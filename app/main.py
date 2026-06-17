from fastapi import FastAPI

from .database import engine
from .models import Base

from .routes import (
    jobs,
    candidates,
    results
)

Base.metadata.create_all(
    bind=engine
)

app = FastAPI(
    title="AI Recruitment API"
)

app.include_router(jobs.router)
app.include_router(candidates.router)
app.include_router(results.router)