from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
import uvicorn

# Import Routers
from routes import (
    auth_routes,
    dashboard_routes,
    jobs_routes,
    resume_routes,
    application_routes,
    ranking_routes,
    notification_routes,
    interview_routes,
    profile_routes
)
from websocket import candidate_socket
from services.ai_match_engine import get_sentence_transformer_model
from services.resume_parser import nlp

# Initialize FastAPI App
app = FastAPI(
    title="AI Recruitment & Talent Screening System API",
    description="Backend services for candidate portal, automated resume screening, ranking, and notification updates.",
    version="1.0.0"
)

# Custom Validation Exception Handler to return clean string messages in 400 responses
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc: RequestValidationError):
    errors = exc.errors()
    if errors:
        first_error = errors[0]
        # Get field name, e.g. "body.email" or "body.first_name"
        loc = [str(x) for x in first_error.get("loc", []) if x != "body"]
        field_name = ".".join(loc) if loc else "field"
        raw_msg = first_error.get("msg", "Invalid value")
        
        # Clean standard Pydantic error prefix if present
        if raw_msg.startswith("Value error, "):
            raw_msg = raw_msg[13:]
            
        detail_msg = f"{field_name.replace('_', ' ').capitalize()}: {raw_msg}"
    else:
        detail_msg = "Validation error"
        
    return JSONResponse(
        status_code=400, # Return 400 Bad Request to satisfy test cases
        content={"detail": detail_msg}
    )

# CORS Configurations (to enable direct communication with the frontend client)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for development and ease of routing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Startup Event
@app.on_event("startup")
def startup_event():
    """
    Startup hook to initialize AI parsing and vector models.
    """
    print("Initializing NLP resources on startup...")
    # Trigger model lazy-loading
    get_sentence_transformer_model()
    if nlp:
        print("spaCy pipelines synced.")

# Root Health Check
@app.get("/", tags=["Health"])
def root_health():
    return {
        "status": "healthy",
        "service": "AI Recruitment & Talent Screening System Core API"
    }

# Include Routers with /api prefix
app.include_router(auth_routes.router, prefix="/api")
app.include_router(dashboard_routes.router, prefix="/api")
app.include_router(jobs_routes.router, prefix="/api")
app.include_router(resume_routes.router, prefix="/api")
app.include_router(application_routes.router, prefix="/api")
app.include_router(ranking_routes.router, prefix="/api")
app.include_router(notification_routes.router, prefix="/api")
app.include_router(interview_routes.router, prefix="/api")
app.include_router(profile_routes.router, prefix="/api")
app.include_router(candidate_socket.router, prefix="/api")

# Include Routers without prefix (fallback/direct)
app.include_router(auth_routes.router)
app.include_router(dashboard_routes.router)
app.include_router(jobs_routes.router)
app.include_router(resume_routes.router)
app.include_router(application_routes.router)
app.include_router(ranking_routes.router)
app.include_router(notification_routes.router)
app.include_router(interview_routes.router)
app.include_router(profile_routes.router)
app.include_router(candidate_socket.router)

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
