from fastapi import FastAPI, Depends, HTTPException, status
from database import supabase
from schemas import (
    RegisterRequest,
    RegisterResponse,
    LoginRequest,
    TokenResponse,
    UserProfileResponse,
)
from auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)

app = FastAPI(
    title="AI Recruitment & Talent Screening System Auth API",
    description="Authentication module using Python, FastAPI, Supabase, and JWT Authentication.",
    version="1.0.0",
)

@app.get("/", tags=["Health"])
def health_check():
    """
    Health check endpoint to verify that the backend service is running.
    """
    return {
        "status": "healthy",
        "service": "AI Recruitment & Talent Screening System Authentication API"
    }

@app.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Authentication"],
)
def register(data: RegisterRequest):
    """
    Register a new user (either candidate or recruiter).
    Validates name characters, email format, role selection, and ensures the email is unique.
    """
    email_clean = data.email.strip().lower()

    # Check if the email already exists in Supabase users table
    try:
        existing_user = (
            supabase.table("users")
            .select("email")
            .eq("email", email_clean)
            .execute()
        )
        if existing_user.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database check failed: {str(e)}",
        )

    # Hash the password using bcrypt
    hashed_pwd = hash_password(data.password)

    # Insert new user into database
    try:
        supabase.table("users").insert({
            "first_name": data.first_name,
            "last_name": data.last_name,
            "email": email_clean,
            "password_hash": hashed_pwd,
            "role": data.role,
        }).execute()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user record: {str(e)}",
        )

    return RegisterResponse(success=True, message="Registration successful")

@app.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    tags=["Authentication"],
)
def login(data: LoginRequest):
    """
    Login an existing user.
    Verifies existence of email, validates bcrypt password hash, and issues a JWT token.
    """
    email_clean = data.email.strip().lower()

    # Fetch user by email
    try:
        result = (
            supabase.table("users")
            .select("*")
            .eq("email", email_clean)
            .execute()
        )
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database query failed: {str(e)}",
        )

    user = result.data[0]

    # Verify password
    if not verify_password(data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Create access token (JWT)
    token_data = {
        "sub": user["id"],
        "email": user["email"],
        "role": user["role"]
    }
    access_token = create_access_token(data=token_data)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        role=user["role"]
    )

@app.get(
    "/profile",
    response_model=UserProfileResponse,
    status_code=status.HTTP_200_OK,
    tags=["Profile"],
)
def get_profile(current_user: dict = Depends(get_current_user)):
    """
    Get user profile. Protected by JWT authorization header.
    Returns details of the currently logged-in user.
    """
    # current_user is validated and fetched in the auth dependency
    return UserProfileResponse(
        id=current_user["id"],
        first_name=current_user["first_name"],
        last_name=current_user["last_name"],
        email=current_user["email"],
        role=current_user["role"],
    )
