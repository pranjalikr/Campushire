from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class InterviewRound(BaseModel):
    round_name: str
    round_type: str  # "Technical", "HR", "Managerial", "DSA"
    questions: List[str]
    difficulty: Optional[str] = None


class ExperienceCreateRequest(BaseModel):
    company_name: str
    role: str
    package_offered: Optional[float] = None
    years_of_experience: Optional[float] = None  # Years of experience at time of interview
    
    # Personal Information (Required fields)
    full_name: str  # Required
    linkedin_id: str  # Required
    github_id: str  # Required
    college_name: str  # Required
    branch: str  # Required
    bio: str  # Required - About/Bio information
    
    interview_rounds: Optional[List[Dict[str, Any]]] = None
    questions_asked: Optional[Dict[str, List[str]]] = None
    preparation_strategy: Optional[str] = None
    resources_followed: Optional[List[str]] = None
    rejection_reasons: Optional[str] = None
    final_result: str  # "Selected" or "Rejected"
    is_anonymous: bool = False
    is_preuploaded: bool = False  # Admin pre-uploaded experiences


class ExperienceUpdateRequest(BaseModel):
    company_name: Optional[str] = None
    role: Optional[str] = None
    package_offered: Optional[float] = None
    years_of_experience: Optional[float] = None
    
    # Personal Information (Optional for updates)
    full_name: Optional[str] = None
    linkedin_id: Optional[str] = None
    github_id: Optional[str] = None
    college_name: Optional[str] = None
    branch: Optional[str] = None
    bio: Optional[str] = None
    
    interview_rounds: Optional[List[Dict[str, Any]]] = None
    questions_asked: Optional[Dict[str, List[str]]] = None
    preparation_strategy: Optional[str] = None
    resources_followed: Optional[List[str]] = None
    rejection_reasons: Optional[str] = None
    final_result: Optional[str] = None
    is_anonymous: Optional[bool] = None


class ExperienceResponse(BaseModel):
    id: int
    company_name: str
    role: str
    package_offered: Optional[float]
    years_of_experience: Optional[float]
    
    # Personal Information
    full_name: str
    linkedin_id: str
    github_id: str
    college_name: str
    branch: str
    bio: str
    
    interview_rounds: Optional[List[Dict[str, Any]]]
    questions_asked: Optional[Dict[str, List[str]]]
    preparation_strategy: Optional[str]
    resources_followed: Optional[List[str]]
    rejection_reasons: Optional[str]
    final_result: str
    is_anonymous: bool
    is_approved: bool
    is_published: bool
    is_preuploaded: bool = False  # Admin pre-uploaded experiences
    user_id: Optional[int] = None
    user_name: Optional[str] = None
    # User profile information (from user's profile)
    user_email: Optional[str] = None
    user_profile_completed: Optional[bool] = None
    user_profile_completion_percentage: Optional[int] = None
    # Eligibility information (for admin view)
    user_eligible: Optional[bool] = None
    user_eligibility_percentage: Optional[int] = None
    user_eligibility_status: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
