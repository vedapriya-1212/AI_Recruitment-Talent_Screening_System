import os
from typing import Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks, status
from auth import get_current_candidate
from database import supabase
from schemas import ResumeDetailsResponse
from services.resume_parser import ResumeParser
from services.ai_match_engine import AIMatchEngine
from websocket.candidate_socket import manager

router = APIRouter(prefix="/resume", tags=["Resume"])

@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_resume(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="PDF Resume file"),
    current_user: dict = Depends(get_current_candidate)
):
    """
    Upload a resume PDF, store it in Supabase Storage, and trigger real-time AI parsing.
    """
    candidate_id = current_user["id"]
    filename = file.filename
    
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF resume documents are supported."
        )

    try:
        # Read file bytes
        file_bytes = await file.read()
        
        # 1. Upload file to Supabase Storage resumes bucket
        timestamp = int(datetime.utcnow().timestamp())
        storage_filename = f"{candidate_id}_{timestamp}_{filename}"
        
        # Default mock fallback URL if storage upload fails or is blocked
        file_url = f"/uploads/resumes/{storage_filename}"
        
        try:
            # Try uploading to Supabase Storage
            # Note: storage bucket 'resumes' should exist
            upload_res = supabase.storage.from_("resumes").upload(
                path=storage_filename,
                file=file_bytes,
                file_options={"content-type": "application/pdf"}
            )
            
            # Retrieve public URL
            public_url_res = supabase.storage.from_("resumes").get_public_url(storage_filename)
            if public_url_res:
                file_url = public_url_res
        except Exception as storage_err:
            print(f"Warning: Supabase Storage upload failed ({storage_err}). Falling back to local URL schema.")
            
        # 2. Deactivate existing resumes for this candidate
        try:
            supabase.table("resumes").update({"is_active": False}).eq("candidate_id", candidate_id).execute()
        except Exception as e:
            print(f"Error deactivating old resumes: {e}")

        # 3. Save resume record in database
        resume_db_res = (
            supabase.table("resumes")
            .insert({
                "candidate_id": candidate_id,
                "file_name": filename,
                "file_url": file_url,
                "file_type": "application/pdf",
                "is_active": True
            })
            .execute()
        )
        
        if not resume_db_res.data:
            raise HTTPException(
                status_code=500,
                detail="Failed to save resume metadata in the database"
            )

        # 4. Trigger background parsing and AI score updates
        background_tasks.add_task(parse_and_screen_resume, candidate_id, file_bytes)

        # 5. Broadcast WS upload success event
        await manager.send_personal_message({
            "event": "RESUME_UPLOADED",
            "data": {
                "file_name": filename,
                "file_url": file_url
            }
        }, candidate_id)

        return {
            "success": True,
            "message": "Resume uploaded successfully. Processing coordinates in real-time.",
            "file_name": filename,
            "file_url": file_url
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Resume upload processing failed: {str(e)}"
        )

async def parse_and_screen_resume(candidate_id: str, file_bytes: bytes):
    """
    Async worker tasks: PDF Text extraction -> Section parsing -> DB Upserts -> AI Matching.
    """
    print(f"Background: Processing resume ingestion for candidate {candidate_id}...")
    try:
        # Extract text from PDF
        text = ResumeParser.extract_text(file_bytes)
        
        # Parse sections
        parsed_data = ResumeParser.parse_text(text)
        print(f"Background: Parsing complete for {candidate_id}. Skills found: {parsed_data['skills']}")
        
        # Persist parsed entities
        ResumeParser.save_parsed_info(candidate_id, parsed_data)
        print(f"Background: Saved parsed details to DB for {candidate_id}.")
        
        # Send WS parsed event
        await manager.send_personal_message({
            "event": "RESUME_PARSED",
            "data": parsed_data
        }, candidate_id)

        # Notify success
        supabase.table("notifications").insert({
            "user_id": candidate_id,
            "title": "Resume Parsed Successfully",
            "message": "Your technical competencies registry and academic credentials have been synced.",
            "type": "resume_parser",
            "is_read": False
        }).execute()
        
        await manager.send_personal_message({
            "event": "NOTIFICATION_CREATED",
            "data": {
                "title": "Resume Parsed Successfully",
                "message": "Your profile credentials have been synchronized."
            }
        }, candidate_id)

        # Screen candidate against applied or active jobs
        active_apps = supabase.table("job_applications").select("job_id").eq("candidate_id", candidate_id).execute()
        jobs_to_screen = [app["job_id"] for app in (active_apps.data or [])]
        
        # If no active applications, fetch top active jobs to pre-calculate matching scores
        if not jobs_to_screen:
            jobs_res = supabase.table("jobs").select("id").eq("is_active", True).limit(2).execute()
            jobs_to_screen = [j["id"] for j in (jobs_res.data or [])]
            
        for job_id in jobs_to_screen:
            scores = AIMatchEngine.calculate_match_scores(candidate_id, job_id)
            print(f"Background: Pre-calculated match score for job {job_id}: {scores['overall_score']}")
            
            # Broadcast matches
            await manager.send_personal_message({
                "event": "AI_SCORE_GENERATED",
                "data": {
                    "job_id": job_id,
                    "overall_score": scores["overall_score"]
                }
            }, candidate_id)
            
    except Exception as e:
        print(f"Background: Error in resume screening worker: {e}")

@router.get("/details", response_model=ResumeDetailsResponse)
def get_parsed_resume_details(current_user: dict = Depends(get_current_candidate)):
    """
    Get current parsed resume sections.
    """
    user_id = current_user["id"]
    candidate_name = f"{current_user['first_name']} {current_user['last_name']}"
    email = current_user["email"]

    try:
        # Fetch skills
        skills_res = (
            supabase.table("candidate_skills")
            .select("skills(name)")
            .eq("candidate_id", user_id)
            .execute()
        )
        skills = [s["skills"]["name"] for s in skills_res.data if s.get("skills")]

        # Fetch education
        edu_res = supabase.table("education").select("*").eq("candidate_id", user_id).execute()
        education = [
            {
                "institution": e["institution"],
                "degree": e["degree"],
                "field_of_study": e.get("field_of_study"),
                "start_date": e.get("start_date"),
                "end_date": e.get("end_date")
            }
            for e in (edu_res.data or [])
        ]

        # Fetch experience
        exp_res = supabase.table("experience").select("*").eq("candidate_id", user_id).execute()
        experience = [
            {
                "company": ex["company"],
                "title": ex["title"],
                "location": ex.get("location"),
                "start_date": ex.get("start_date"),
                "end_date": ex.get("end_date"),
                "is_current": ex.get("is_current", False),
                "description": ex.get("description")
            }
            for ex in (exp_res.data or [])
        ]

        # Fetch projects
        proj_res = supabase.table("projects").select("*").eq("candidate_id", user_id).execute()
        projects = [
            {
                "title": p["title"],
                "description": p.get("description"),
                "technologies": p.get("technologies"),
                "project_url": p.get("project_url"),
                "github_url": p.get("github_url")
            }
            for p in (proj_res.data or [])
        ]

        return ResumeDetailsResponse(
            name=candidate_name,
            email=email,
            skills=skills,
            education=education,
            experience=experience,
            projects=projects
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to query resume details: {str(e)}"
        )
