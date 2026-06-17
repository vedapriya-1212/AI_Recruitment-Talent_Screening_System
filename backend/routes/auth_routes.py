from fastapi import APIRouter, Depends, HTTPException, status
from database import supabase, SUPABASE_KEY
from schemas import (
    RegisterRequest,
    RegisterResponse,
    LoginRequest,
    TokenResponse,
    UserProfileResponse
)
from auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)

router = APIRouter(tags=["Authentication"])

@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(data: RegisterRequest):
    """
    Register a new user (either candidate or recruiter).
    """
    email_clean = data.email.strip().lower()

    # 1. Check if unique in DB
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
    except Exception:
        pass

    # 2. Register via Supabase Auth if keys exist
    user_id = None
    try:
        if SUPABASE_KEY and SUPABASE_KEY != "your_supabase_anon_key_here":
            auth_response = supabase.auth.sign_up({
                "email": email_clean,
                "password": data.password
            })
            if auth_response and auth_response.user:
                user_id = auth_response.user.id
    except Exception as e:
        error_str = str(e)
        if "already registered" in error_str.lower() or "already exists" in error_str.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
        print(f"Supabase Auth signup failed: {e}. Falling back to database-only.")

    # 3. Generate UUID for mock fallback
    if not user_id:
        import uuid
        user_id = str(uuid.uuid4())

    hashed_pwd = hash_password(data.password)

    # 4. Insert into users table
    try:
        supabase.table("users").insert({
            "id": user_id,
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

@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
)
def login(data: LoginRequest):
    """
    Login an existing user.
    """
    email_clean = data.email.strip().lower()
    access_token = None
    role = None

    # Try logging in via Supabase Auth
    try:
        if SUPABASE_KEY and SUPABASE_KEY != "your_supabase_anon_key_here":
            auth_response = supabase.auth.sign_in_with_password({
                "email": email_clean,
                "password": data.password
            })
            if auth_response and auth_response.session:
                access_token = auth_response.session.access_token
                user_id = auth_response.user.id
                
                # Fetch role
                profile_result = (
                    supabase.table("users")
                    .select("role")
                    .eq("id", user_id)
                    .execute()
                )
                if profile_result.data:
                    role = profile_result.data[0]["role"]
                else:
                    role = "candidate"
    except Exception as e:
        print(f"Supabase Auth login failed: {e}. Trying database fallback...")

    # Fallback to local DB verification
    if not access_token:
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
            
            user = result.data[0]
            
            if not user.get("password_hash") or not verify_password(data.password, user["password_hash"]):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password",
                )
            
            role = user["role"]
            token_data = {
                "sub": user["id"],
                "email": user["email"],
                "role": role
            }
            access_token = create_access_token(data=token_data)
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database query failed: {str(e)}",
            )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        role=role
    )
