from fastapi import APIRouter

router = APIRouter()

@router.get("/results")
def get_results():

    return [
        {
            "candidate_name":"John",
            "score":91,
            "status":"Shortlisted"
        }
    ]