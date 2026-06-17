from typing import Any, List, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from auth import get_current_candidate
from database import supabase
from schemas import ProfileResponse, ProfileUpdateRequest, EducationSchema, ExperienceSchema, ProjectSchema

router = APIRouter(prefix="/profile", tags=["Profile"])

def ensure_candidate_records_exist(user_id: str) -> None:
    """
    Ensure rows exist in both 'candidates' and 'candidate_profiles' tables for this user.
    Auto-initializes if missing.
    """
    try:
        # Check candidates table
        cand_res = supabase.table("candidates").select("id").eq("id", user_id).execute()
        if not cand_res.data:
            supabase.table("candidates").insert({"id": user_id}).execute()
            print(f"Auto-initialized 'candidates' record for user {user_id}")
            
        # Check candidate_profiles table
        prof_res = supabase.table("candidate_profiles").select("id").eq("candidate_id", user_id).execute()
        if not prof_res.data:
            supabase.table("candidate_profiles").insert({
                "candidate_id": user_id,
                "completion_percentage": 20,
                "views_count": 0
            }).execute()
            print(f"Auto-initialized 'candidate_profiles' record for user {user_id}")
    except Exception as e:
        print(f"Error ensuring candidate profile exists: {e}")

@router.get("", response_model=ProfileResponse)
def get_candidate_profile(current_user: dict = Depends(get_current_candidate)):
    """
    Retrieve candidate profile (including skills, education, experience, and projects).
    """
    user_id = current_user["id"]
    ensure_candidate_records_exist(user_id)
    
    # 1. Fetch Candidates core columns
    phone = None
    summary = None
    photo_url = None
    try:
        cand_res = supabase.table("candidates").select("*").eq("id", user_id).execute()
        if cand_res.data:
            phone = cand_res.data[0].get("phone")
            summary = cand_res.data[0].get("summary")
            photo_url = cand_res.data[0].get("photo_url")
    except Exception as e:
        print(f"Error reading candidates columns: {e}")

    # 2. Fetch Skills
    skills = []
    try:
        skills_res = (
            supabase.table("candidate_skills")
            .select("skills(name)")
            .eq("candidate_id", user_id)
            .execute()
        )
        skills = [s["skills"]["name"] for s in skills_res.data if s.get("skills")]
    except Exception as e:
        print(f"Error reading candidate_skills: {e}")

    # 3. Fetch Education
    education = []
    try:
        edu_res = supabase.table("education").select("*").eq("candidate_id", user_id).execute()
        for e in (edu_res.data or []):
            education.append(EducationSchema(
                id=e["id"],
                institution=e["institution"],
                degree=e["degree"],
                field_of_study=e.get("field_of_study"),
                start_date=e.get("start_date"),
                end_date=e.get("end_date"),
                grade=e.get("grade"),
                description=e.get("description")
            ))
    except Exception as e:
        print(f"Error reading education: {e}")

    # 4. Fetch Experience
    experience = []
    try:
        exp_res = supabase.table("experience").select("*").eq("candidate_id", user_id).execute()
        for ex in (exp_res.data or []):
            experience.append(ExperienceSchema(
                id=ex["id"],
                company=ex["company"],
                title=ex["title"],
                location=ex.get("location"),
                start_date=ex.get("start_date"),
                end_date=ex.get("end_date"),
                is_current=ex.get("is_current", False),
                description=ex.get("description")
            ))
    except Exception as e:
        print(f"Error reading experience: {e}")

    # 5. Fetch Projects
    projects = []
    try:
        proj_res = supabase.table("projects").select("*").eq("candidate_id", user_id).execute()
        for p in (proj_res.data or []):
            projects.append(ProjectSchema(
                id=p["id"],
                title=p["title"],
                description=p.get("description"),
                technologies=p.get("technologies"),
                project_url=p.get("project_url"),
                github_url=p.get("github_url"),
                start_date=p.get("start_date"),
                end_date=p.get("end_date")
            ))
    except Exception as e:
        print(f"Error reading projects: {e}")

    return ProfileResponse(
        first_name=current_user["first_name"],
        last_name=current_user["last_name"],
        email=current_user["email"],
        phone=phone,
        summary=summary,
        photo_url=photo_url,
        skills=skills,
        education=education,
        experience=experience,
        projects=projects
    )

@router.put("", response_model=ProfileResponse)
def update_candidate_profile(payload: ProfileUpdateRequest, current_user: dict = Depends(get_current_candidate)):
    """
    Update profile details for the candidate.
    """
    user_id = current_user["id"]
    ensure_candidate_records_exist(user_id)

    # 1. Update users table first/last name
    user_update = {}
    if payload.first_name is not None:
        user_update["first_name"] = payload.first_name
    if payload.last_name is not None:
        user_update["last_name"] = payload.last_name
        
    if user_update:
        try:
            supabase.table("users").update(user_update).eq("id", user_id).execute()
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to update user identity properties: {str(e)}"
            )

    # 2. Update candidates table phone/summary/photo_url
    cand_update = {}
    if payload.phone is not None:
        cand_update["phone"] = payload.phone
    if payload.summary is not None:
        cand_update["summary"] = payload.summary
    if payload.photo_url is not None:
        cand_update["photo_url"] = payload.photo_url
        
    if cand_update:
        try:
            supabase.table("candidates").update(cand_update).eq("id", user_id).execute()
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to update candidate metrics: {str(e)}"
            )

    # 3. Update Skills
    if payload.skills is not None:
        try:
            # Delete old mappings
            supabase.table("candidate_skills").delete().eq("candidate_id", user_id).execute()
            
            # Map new mappings
            for skill_name in payload.skills:
                # Get or create skill
                skill_res = supabase.table("skills").select("id").eq("name", skill_name).execute()
                if skill_res.data:
                    skill_id = skill_res.data[0]["id"]
                else:
                    new_skill = supabase.table("skills").insert({"name": skill_name}).execute()
                    skill_id = new_skill.data[0]["id"]
                    
                # Link
                supabase.table("candidate_skills").upsert({
                    "candidate_id": user_id,
                    "skill_id": skill_id,
                    "proficiency": "Intermediate"
                }).execute()
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to save profile skills: {str(e)}"
            )

    # 4. Update Education
    if payload.education is not None:
        try:
            # Clear existing education records
            supabase.table("education").delete().eq("candidate_id", user_id).execute()
            # Insert new rows
            for edu in payload.education:
                edu_data = edu.dict(exclude_unset=True, exclude={"id"})
                edu_data["candidate_id"] = user_id
                supabase.table("education").insert(edu_data).execute()
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to save education: {str(e)}"
            )

    # 5. Update Experience
    if payload.experience is not None:
        try:
            # Clear existing experience records
            supabase.table("experience").delete().eq("candidate_id", user_id).execute()
            # Insert new rows
            for exp in payload.experience:
                exp_data = exp.dict(exclude_unset=True, exclude={"id"})
                exp_data["candidate_id"] = user_id
                supabase.table("experience").insert(exp_data).execute()
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to save experience history: {str(e)}"
            )

    # 6. Update Projects
    if payload.projects is not None:
        try:
            # Clear existing projects
            supabase.table("projects").delete().eq("candidate_id", user_id).execute()
            # Insert new rows
            for proj in payload.projects:
                proj_data = proj.dict(exclude_unset=True, exclude={"id"})
                proj_data["candidate_id"] = user_id
                supabase.table("projects").insert(proj_data).execute()
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to save projects listings: {str(e)}"
            )

    # Recalculate completion percentage
    try:
        completion = 30
        if payload.skills: completion += 20
        if payload.education: completion += 20
        if payload.experience: completion += 20
        if payload.projects: completion += 10
        supabase.table("candidate_profiles").update({
            "completion_percentage": min(100, completion)
        }).eq("candidate_id", user_id).execute()
    except Exception:
        pass

    return get_candidate_profile(current_user)
