from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from auth import get_current_candidate
from database import supabase
from schemas import InterviewResponse

router = APIRouter(prefix="/interviews", tags=["Interviews"])

@router.get("", response_model=List[InterviewResponse])
def get_interviews(current_user: dict = Depends(get_current_candidate)):
    """
    Get all interviews scheduled for the candidate.
    """
    candidate_id = current_user["id"]
    candidate_name = f"{current_user['first_name']} {current_user['last_name']}"
    
    try:
        # Query interviews table
        res = (
            supabase.table("interviews")
            .select("*")
            .eq("candidate_id", candidate_id)
            .execute()
        )
        
        # Get active job title for mapping
        job_title = "Technical Systems Candidate"
        app_res = (
            supabase.table("job_applications")
            .select("jobs(title)")
            .eq("candidate_id", candidate_id)
            .limit(1)
            .execute()
        )
        if app_res.data and app_res.data[0].get("jobs"):
            job_title = app_res.data[0]["jobs"]["title"]

        interviews = []
        for index, item in enumerate(res.data or []):
            # Format date: if it is a full ISO timestamp, extract date
            raw_date = item.get("interview_date") or ""
            date_str = raw_date
            time_str = "2:00 PM" # default mock time
            
            if "T" in raw_date:
                try:
                    dt = datetime.fromisoformat(raw_date.replace("Z", "+00:00"))
                    date_str = dt.strftime("%Y-%m-%d")
                    time_str = dt.strftime("%I:%M %p")
                except Exception:
                    pass
            elif " " in raw_date:
                parts = raw_date.split(" ")
                date_str = parts[0]
                if len(parts) > 1:
                    time_str = parts[1]

            # Alternate interview stages for visual variety
            stages = ["HR Screening", "Technical Review", "Final Panel"]
            stage = stages[index % len(stages)]

            interviews.append(InterviewResponse(
                id=item["interview_id"],
                candidateId=item["candidate_id"],
                candidateName=candidate_name,
                jobTitle=job_title,
                date=date_str,
                time=time_str,
                stage=stage,
                status=item.get("status") or "Scheduled"
            ))
            
        return interviews
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to query interviews: {str(e)}"
        )
