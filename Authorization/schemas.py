import re
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Literal

class RegisterRequest(BaseModel):
    first_name: str = Field(..., description="User's first name")
    last_name: str = Field(..., description="User's last name")
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., min_length=8, description="User's password (min 8 characters)")
    role: Literal["candidate", "recruiter"] = Field(..., description="User's role: 'candidate' or 'recruiter'")

    @validator("first_name", "last_name")
    def validate_name(cls, v: str) -> str:
        # Strip whitespace
        v_stripped = v.strip()
        if not v_stripped:
            raise ValueError("Name cannot be empty or whitespace only")
        # Ensure name contains only alphabetic characters and spaces
        if not re.match(r"^[A-Za-z\s]+$", v_stripped):
            raise ValueError("Name can only contain alphabetic characters and spaces")
        return v_stripped

class RegisterResponse(BaseModel):
    success: bool
    message: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

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
