from datetime import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from auth import get_current_candidate
from database import supabase
from schemas import JobApplyRequest, JobApplyResponse
from services.ai_match_engine import AIMatchEngine
from websocket.candidate_socket import manager

router = APIRouter(prefix="", tags=["Applications"])

@router.post("/jobs/apply", response_model=JobApplyResponse, status_code=status.HTTP_201_CREATED)
async def apply_for_job(
    payload: JobApplyRequest, 
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_candidate)
):
    """
    Submit an application for a job posting. Triggers AI matching in the background.
    """
    candidate_id = current_user["id"]
    job_id = payload.job_id

    try:
        # 1. Check if job exists
        job_res = supabase.table("jobs").select("title, company").eq("id", job_id).execute()
        if not job_res.data:
            raise HTTPException(
                status_code=404,
                detail="Job posting not found"
            )
        job_details = job_res.data[0]

        # 2. Check if already applied
        dup_res = (
            supabase.table("job_applications")
            .select("id")
            .eq("job_id", job_id)
            .eq("candidate_id", candidate_id)
            .execute()
        )
        if dup_res.data:
            raise HTTPException(
                status_code=400,
                detail="You have already applied for this job posting"
            )

        # 3. Retrieve active resume URL
        resume_res = (
            supabase.table("resumes")
            .select("file_url")
            .eq("candidate_id", candidate_id)
            .eq("is_active", True)
            .execute()
        )
        resume_url = resume_res.data[0]["file_url"] if resume_res.data else None

        # 4. Insert application record
        app_res = (
            supabase.table("job_applications")
            .insert({
                "job_id": job_id,
                "candidate_id": candidate_id,
                "resume_url": resume_url,
                "status": "Applied"
            })
            .execute()
        )
        
        if not app_res.data:
            raise HTTPException(
                status_code=500,
                detail="Failed to submit application record"
            )
            
        app_id = app_res.data[0]["id"]

        # 5. Create application success notification
        notif_msg = f"Your application for {job_details['title']} at {job_details['company']} has been received."
        try:
            supabase.table("notifications").insert({
                "user_id": candidate_id,
                "title": "Application Submitted Successfully",
                "message": notif_msg,
                "type": "application_status",
                "is_read": False
            }).execute()
        except Exception as e:
            print(f"Error creating notification: {e}")

        # 6. Push real-time WS broadcasts
        # Notify application updated
        await manager.send_personal_message({
            "event": "APPLICATION_UPDATED",
            "data": {
                "application_id": app_id,
                "job_id": job_id,
                "status": "Applied"
            }
        }, candidate_id)
        
        # Notify notification created
        await manager.send_personal_message({
            "event": "NOTIFICATION_CREATED",
            "data": {
                "title": "Application Submitted Successfully",
                "message": notif_msg
            }
        }, candidate_id)

        # 7. Start AI Matching task in the background
        background_tasks.add_task(run_background_ai_match, candidate_id, job_id)

        return JobApplyResponse(
            success=True,
            application_id=app_id,
            message="Application submitted successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Application submission failed: {str(e)}"
        )

async def run_background_ai_match(candidate_id: str, job_id: str):
    """
    Background worker task to trigger AI semantic scoring.
    """
    print(f"Background: Starting AI matching for candidate {candidate_id} and job {job_id}...")
    try:
        # Run Match Engine
        scores = AIMatchEngine.calculate_match_scores(candidate_id, job_id)
        print(f"Background: Match calculated for {candidate_id}. Overall score: {scores['overall_score']}")
        
        # Create score generation notification
        supabase.table("notifications").insert({
            "user_id": candidate_id,
            "title": "AI Match Score Compiled",
            "message": f"Your matching index calculation is complete. Match rate: {scores['overall_score']}%",
            "type": "match_score",
            "is_read": False
        }).execute()

        # Push WS updates
        await manager.send_personal_message({
            "event": "AI_SCORE_GENERATED",
            "data": {
                "job_id": job_id,
                "overall_score": scores["overall_score"]
            }
        }, candidate_id)
        
        await manager.send_personal_message({
            "event": "NOTIFICATION_CREATED",
            "data": {
                "title": "AI Match Score Compiled",
                "message": f"AI evaluation score compiled: {scores['overall_score']}%"
            }
        }, candidate_id)
    except Exception as e:
        print(f"Background: Error in background match execution: {e}")

@router.get("/applications", response_model=List[Dict[str, Any]])
def get_my_applications(current_user: dict = Depends(get_current_candidate)):
    """
    Get application history and tracking status for the candidate.
    """
    candidate_id = current_user["id"]
    try:
        # Select applications joined with job details
        res = (
            supabase.table("job_applications")
            .select("*, jobs(*)")
            .eq("candidate_id", candidate_id)
            .order("applied_at", desc=True)
            .execute()
        )
        
        applications = []
        for app in (res.data or []):
            job = app.get("jobs") or {}
            applications.append({
                "id": app["id"],
                "job_id": app["job_id"],
                "job_title": job.get("title") or "Unknown Position",
                "company": job.get("company") or "Unknown Company",
                "location": job.get("location") or "Remote",
                "resume_url": app.get("resume_url"),
                "status": app.get("status") or "Applied",
                "applied_at": app.get("applied_at") or datetime.utcnow().isoformat()
            })
            
        return applications
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve applications: {str(e)}"
        )
