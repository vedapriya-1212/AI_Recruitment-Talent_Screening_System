from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class UserRole:
    CANDIDATE = "candidate"
    RECRUITER = "recruiter"

class ApplicationStatus:
    APPLIED = "Applied"
    SCREENED = "Resume Screened"
    UNDER_REVIEW = "Under Review"
    SHORTLISTED = "Shortlisted"
    REJECTED = "Rejected"
    SELECTED = "Selected"
    INTERVIEW_SCHEDULED = "Interview Scheduled"
