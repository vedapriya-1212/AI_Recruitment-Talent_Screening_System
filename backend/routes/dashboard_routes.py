from fastapi import APIRouter, Depends
from auth import get_current_candidate
from database import supabase
from schemas import DashboardResponse

router = APIRouter(prefix="", tags=["Dashboard"])

@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard_metrics(current_user: dict = Depends(get_current_candidate)):
    """
    Get dashboard analytics metrics for the authenticated candidate.
    """
    candidate_id = current_user["id"]
    
    total_applications = 0
    shortlisted = 0
    interviews_count = 0
    highest_match_score = 0
    current_rank = 1

    try:
        # 1. Total applications count
        apps_res = (
            supabase.table("job_applications")
            .select("id, status")
            .eq("candidate_id", candidate_id)
            .execute()
        )
        total_applications = len(apps_res.data) if apps_res.data else 0
        
        # 2. Shortlisted count
        if apps_res.data:
            shortlisted = sum(
                1 for row in apps_res.data 
                if row.get("status") in ["Shortlisted", "Selected", "Interview Scheduled", "Under Review"]
            )
            
        # 3. Interviews count
        int_res = (
            supabase.table("interviews")
            .select("interview_id")
            .eq("candidate_id", candidate_id)
            .eq("status", "Scheduled")
            .execute()
        )
        # fallback to select count including confirmed
        int_res_all = (
            supabase.table("interviews")
            .select("interview_id")
            .eq("candidate_id", candidate_id)
            .execute()
        )
        interviews_count = len(int_res_all.data) if int_res_all.data else 0
        
        # 4. Highest match score and rank
        rank_res = (
            supabase.table("candidate_rankings")
            .select("score, rank")
            .eq("candidate_id", candidate_id)
            .execute()
        )
        
        if rank_res.data:
            scores = [r["score"] for r in rank_res.data if r.get("score") is not None]
            highest_match_score = int(max(scores)) if scores else 0
            
            ranks = [r["rank"] for r in rank_res.data if r.get("rank") is not None]
            current_rank = int(min(ranks)) if ranks else 1
            
    except Exception as e:
        print(f"Error querying dashboard metrics: {e}")
        
    return DashboardResponse(
        total_applications=total_applications,
        shortlisted=shortlisted,
        interviews=interviews_count,
        highest_match_score=highest_match_score,
        current_rank=current_rank
    )
