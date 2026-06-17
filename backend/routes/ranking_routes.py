from fastapi import APIRouter, Depends, HTTPException
from auth import get_current_candidate
from database import supabase
from schemas import MatchScoreResponse, RankingResponse
from services.ai_match_engine import AIMatchEngine
from services.ranking_service import RankingService

router = APIRouter(prefix="", tags=["Rankings"])

@router.get("/match-score/{job_id}", response_model=MatchScoreResponse)
def get_match_score(job_id: str, current_user: dict = Depends(get_current_candidate)):
    """
    Get detailed match score breakdown for a specific job posting.
    Calculates on the fly if not yet cached in database.
    """
    candidate_id = current_user["id"]
    try:
        # Check if job exists
        job_check = supabase.table("jobs").select("id").eq("id", job_id).execute()
        if not job_check.data:
            raise HTTPException(
                status_code=404,
                detail="Job posting not found"
            )

        # We compute actual match scores (skills, experience, education, overall) using AIMatchEngine.
        # This calculates scores using the NLP embeddings or falls back to keyword overlaps.
        scores = AIMatchEngine.calculate_match_scores(candidate_id, job_id)
        
        return MatchScoreResponse(
            skills_score=scores["skills_score"],
            experience_score=scores["experience_score"],
            education_score=scores["education_score"],
            overall_score=scores["overall_score"],
            recommendation=scores["recommendation"]
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Match evaluation failed: {str(e)}"
        )

@router.get("/ranking/{job_id}", response_model=RankingResponse)
def get_ranking_details(job_id: str, current_user: dict = Depends(get_current_candidate)):
    """
    Get candidate's leaderboard placement, total participants, and percentile for a job.
    """
    candidate_id = current_user["id"]
    try:
        # Check if job exists
        job_check = supabase.table("jobs").select("id").eq("id", job_id).execute()
        if not job_check.data:
            raise HTTPException(
                status_code=404,
                detail="Job posting not found"
            )

        # Retrieve rank metrics from RankingService
        rank_data = RankingService.get_candidate_rank(candidate_id, job_id)
        
        return RankingResponse(
            rank=rank_data["rank"],
            total_candidates=rank_data["total_candidates"],
            percentile=rank_data["percentile"]
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Ranking assessment failed: {str(e)}"
        )
