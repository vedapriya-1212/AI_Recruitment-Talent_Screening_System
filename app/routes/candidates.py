from sqlalchemy.orm import Session

from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    Form
)

from ..database import SessionLocal
from ..models import Candidate

import os

router = APIRouter()

UPLOAD_DIR = "app/uploads"

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/candidates")
async def upload_candidate(
    name: str = Form(...),
    email: str = Form(...),
    resume: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    filepath = f"{UPLOAD_DIR}/{resume.filename}"

    with open(filepath, "wb") as buffer:
        buffer.write(await resume.read())

    candidate = Candidate(
        name=name,
        email=email,
        resume_path=filepath
    )

    db.add(candidate)
    db.commit()
    db.refresh(candidate)

    return candidate

@router.get("/candidates")
def get_candidates(
    db: Session = Depends(get_db)
):
    return db.query(Candidate).all()