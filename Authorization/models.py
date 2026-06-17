from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class User(BaseModel):
    """
    Represents the database structure of a User in the users table.
    """
    id: Optional[str] = None
    first_name: str
    last_name: str
    email: str
    password_hash: str
    role: str
    created_at: Optional[datetime] = None
