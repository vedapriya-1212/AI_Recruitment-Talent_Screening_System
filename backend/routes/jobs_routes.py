import re
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from auth import get_current_candidate
from database import supabase
from schemas import JobPostResponse

router = APIRouter(prefix="/jobs", tags=["Jobs"])

def map_db_job_to_response(db_job: dict, apps_count: int = 0) -> dict:
    """
    Map Supabase jobs columns to frontend JobPost schema.
    """
    reqs_str = db_job.get("requirements") or ""
    reqs = [r.strip() for r in reqs_str.split("\n") if r.strip()]
    if not reqs:
        reqs = [r.strip() for r in reqs_str.split(",") if r.strip()]
        
    skills_str = db_job.get("skills_required") or ""
    skills = [s.strip() for s in skills_str.split(",") if s.strip()]
    
    # Extract salary digits from string "$120,000 - $150,000"
    salary_range = db_job.get("salary_range") or ""
    sal_min = 90000
    sal_max = 130000
    sal_numbers = re.findall(r'\d+', salary_range.replace(',', ''))
    if len(sal_numbers) >= 2:
        try:
            sal_min = int(sal_numbers[0])
            sal_max = int(sal_numbers[1])
        except ValueError:
            pass
    elif len(sal_numbers) == 1:
        try:
            sal_min = int(sal_numbers[0])
            sal_max = int(int(sal_numbers[0]) * 1.3)
        except ValueError:
            pass

    is_active = db_job.get("is_active", True)
    status_str = "published" if is_active else "draft"
    
    # Determine department name
    title_lower = db_job.get("title", "").lower()
    dept = "Engineering"
    if "security" in title_lower or "cloud" in title_lower or "infrastructure" in title_lower:
        dept = "Infrastructure"
    elif "ai" in title_lower or "machine learning" in title_lower or "ml" in title_lower or "data" in title_lower:
        dept = "AI Core"

    return {
        "id": db_job["id"],
        "title": db_job["title"],
        "department": dept,
        "location": db_job.get("location") or "Remote",
        "description": db_job.get("description") or "",
        "requirements": reqs,
        "skills": skills,
        "status": status_str,
        "optimizationScore": 92 if "senior" in title_lower else 85,
        "healthScore": 88 if "senior" in title_lower else 80,
        "completionPercentage": 100,
        "missingSkills": [],
        "salaryMin": sal_min,
        "salaryMax": sal_max,
        "applicationsCount": apps_count,
        "created_at": db_job.get("created_at") or datetime.utcnow().isoformat()
    }

@router.get("", response_model=List[JobPostResponse])
def get_all_jobs(
    search: Optional[str] = Query(None, description="Search term for job title or skills"),
    location: Optional[str] = Query(None, description="Filter by location"),
    job_type: Optional[str] = Query(None, description="Filter by job type"),
    experience_level: Optional[str] = Query(None, description="Filter by experience level"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=50, description="Items per page"),
    current_user: dict = Depends(get_current_candidate)
):
    """
    Get all active jobs with search, filtering, and pagination support.
    """
    try:
        # Query active jobs from Supabase
        query = supabase.table("jobs").select("*").eq("is_active", True)
        
        # Apply filters
        if location:
            query = query.ilike("location", f"%{location}%")
        if job_type:
            query = query.eq("job_type", job_type)
        if experience_level:
            query = query.eq("experience_level", experience_level)
            
        res = query.execute()
        jobs_data = res.data or []
        
        # Search client-side/in-memory for flexible multi-field search
        if search:
            search_lower = search.lower()
            jobs_data = [
                j for j in jobs_data
                if search_lower in j.get("title", "").lower() 
                or search_lower in j.get("description", "").lower()
                or search_lower in j.get("skills_required", "").lower()
            ]

        # Get applications count for each job to display on UI
        mapped_jobs = []
        for job in jobs_data:
            apps_count_res = (
                supabase.table("job_applications")
                .select("id", count="exact")
                .eq("job_id", job["id"])
                .execute()
            )
            apps_count = getattr(apps_count_res, "count", 0) or len(apps_count_res.data or [])
            mapped_jobs.append(map_db_job_to_response(job, apps_count))
            
        # Pagination
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        
        return mapped_jobs[start_idx:end_idx]
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Database query failed: {str(e)}"
        )

@router.get("/{job_id}", response_model=JobPostResponse)
def get_job_details(job_id: str, current_user: dict = Depends(get_current_candidate)):
    """
    Retrieve details of a specific job.
    """
    try:
        res = supabase.table("jobs").select("*").eq("id", job_id).execute()
        if not res.data:
            raise HTTPException(
                status_code=404,
                detail="Job posting not found"
            )
            
        # Get applications count
        apps_count_res = (
            supabase.table("job_applications")
            .select("id", count="exact")
            .eq("job_id", job_id)
            .execute()
        )
        apps_count = getattr(apps_count_res, "count", 0) or len(apps_count_res.data or [])
        
        return map_db_job_to_response(res.data[0], apps_count)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Database lookup failed: {str(e)}"
        )
