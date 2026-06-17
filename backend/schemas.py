from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime
import re

class RegisterRequest(BaseModel):
    first_name: str = Field(..., max_length=100, description="User's first name")
    last_name: str = Field(..., max_length=100, description="User's last name")
    email: EmailStr = Field(..., max_length=255, description="User's email address")
    password: str = Field(..., min_length=8, description="User's password (min 8 characters)")
    role: Literal["candidate", "recruiter"] = Field(..., description="User's role: 'candidate' or 'recruiter'")

    @field_validator("first_name", "last_name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v_stripped = v.strip()
        if not v_stripped:
            raise ValueError("Name cannot be empty or whitespace only")
        if not re.match(r"^[A-Za-z\s]+$", v_stripped):
            raise ValueError("Name can only contain alphabetic characters and spaces")
        return v_stripped

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one number")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one special character")
        return v

class RegisterResponse(BaseModel):
    success: bool
    message: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# Auth Response
class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str

class UserProfileResponse(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: str
    role: str

# Candidate Dashboard
class DashboardResponse(BaseModel):
    total_applications: int
    shortlisted: int
    interviews: int
    highest_match_score: int
    current_rank: int

# Job Post (Matches frontend JobPost schema)
class JobPostResponse(BaseModel):
    id: str
    title: str
    department: str
    location: str
    description: str
    requirements: List[str]
    skills: List[str]
    status: str
    optimizationScore: int
    healthScore: int
    completionPercentage: int
    missingSkills: List[str]
    salaryMin: int
    salaryMax: int
    applicationsCount: int
    created_at: str

# Apply Job
class JobApplyRequest(BaseModel):
    job_id: str

class JobApplyResponse(BaseModel):
    success: bool
    application_id: str
    message: str

# Resume Parsed details
class ResumeDetailsResponse(BaseModel):
    name: str
    email: str
    skills: List[str]
    education: List[Dict[str, Any]]
    experience: List[Dict[str, Any]]
    projects: List[Dict[str, Any]]

# Match Score
class MatchScoreResponse(BaseModel):
    skills_score: float
    experience_score: float
    education_score: float
    overall_score: float
    recommendation: str

# Ranking
class RankingResponse(BaseModel):
    rank: int
    total_candidates: int
    percentile: float

# Notification
class NotificationResponse(BaseModel):
    id: str
    title: str
    message: str
    type: str
    is_read: bool
    created_at: str

class NotificationReadRequest(BaseModel):
    is_read: bool

# Interview
class InterviewResponse(BaseModel):
    id: str
    candidateId: str
    candidateName: str
    jobTitle: str
    date: str
    time: str
    stage: str
    status: str

# Profile Management
class EducationSchema(BaseModel):
    id: Optional[str] = None
    institution: str
    degree: str
    field_of_study: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    grade: Optional[str] = None
    description: Optional[str] = None

class ExperienceSchema(BaseModel):
    id: Optional[str] = None
    company: str
    title: str
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: bool = False
    description: Optional[str] = None

class ProjectSchema(BaseModel):
    id: Optional[str] = None
    title: str
    description: Optional[str] = None
    technologies: Optional[str] = None
    project_url: Optional[str] = None
    github_url: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class ProfileResponse(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    summary: Optional[str] = None
    photo_url: Optional[str] = None
    skills: List[str]
    education: List[EducationSchema]
    experience: List[ExperienceSchema]
    projects: List[ProjectSchema]

class ProfileUpdateRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    summary: Optional[str] = None
    photo_url: Optional[str] = None
    skills: Optional[List[str]] = None
    education: Optional[List[EducationSchema]] = None
    experience: Optional[List[ExperienceSchema]] = None
    projects: Optional[List[ProjectSchema]] = None
