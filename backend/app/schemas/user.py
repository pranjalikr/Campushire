from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, List
from datetime import datetime


class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    linkedin_id: Optional[str] = None
    github_id: Optional[str] = None
    college_name: Optional[str] = None
    branch: Optional[str] = None
    bio: Optional[str] = None
    package_offered: Optional[float] = None
    questions_asked: Optional[Dict[str, List[str]]] = None


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    linkedin_id: Optional[str]
    github_id: Optional[str]
    college_name: Optional[str]
    branch: Optional[str]
    bio: Optional[str]
    package_offered: Optional[float]
    questions_asked: Optional[Dict[str, List[str]]]
    profile_completed: bool
    profile_completion_percentage: int
    created_at: datetime
    
    class Config:
        from_attributes = True
