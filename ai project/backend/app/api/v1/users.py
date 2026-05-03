from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User
from app.api.dependencies import get_current_user
from app.schemas.user import ProfileUpdateRequest, UserResponse
from app.api.v1.admin import calculate_profile_eligibility, is_user_eligible

router = APIRouter()


def calculate_profile_completion(user: User) -> int:
    """Calculate profile completion percentage"""
    # Check each field - must be non-empty string (not None, not empty string)
    fields_to_check = [
        ('full_name', getattr(user, 'full_name', None)),
        ('email', getattr(user, 'email', None)),
        ('linkedin_id', getattr(user, 'linkedin_id', None)),
        ('github_id', getattr(user, 'github_id', None)),
        ('college_name', getattr(user, 'college_name', None)),
        ('branch', getattr(user, 'branch', None)),
        ('bio', getattr(user, 'bio', None))
    ]
    
    completed = 0
    for field_name, field_value in fields_to_check:
        if field_value and isinstance(field_value, str) and len(field_value.strip()) > 0:
            completed += 1
    
    return int((completed / len(fields_to_check)) * 100)


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's profile"""
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_profile(
    request: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile"""
    try:
        # Get update data, excluding unset fields (Pydantic v2)
        update_data = request.model_dump(exclude_unset=True)
        
        # Update only provided fields
        # Convert empty strings to None for consistency, but keep non-empty strings
        for field, value in update_data.items():
            if hasattr(current_user, field):
                # Handle empty strings - convert to None for optional fields
                if value == '' and field in ['linkedin_id', 'github_id', 'college_name', 'branch', 'bio']:
                    setattr(current_user, field, None)
                else:
                    setattr(current_user, field, value)
        
        # Calculate profile completion
        current_user.profile_completion_percentage = calculate_profile_completion(current_user)
        current_user.profile_completed = current_user.profile_completion_percentage == 100
        
        # Ensure all string fields are properly trimmed
        if current_user.full_name:
            current_user.full_name = current_user.full_name.strip()
        if current_user.linkedin_id:
            current_user.linkedin_id = current_user.linkedin_id.strip()
        if current_user.github_id:
            current_user.github_id = current_user.github_id.strip()
        if current_user.college_name:
            current_user.college_name = current_user.college_name.strip()
        if current_user.branch:
            current_user.branch = current_user.branch.strip()
        if current_user.bio:
            current_user.bio = current_user.bio.strip()
        
        db.commit()
        db.refresh(current_user)
        
        return current_user
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile: {str(e)}"
        )


@router.get("/profile-completion", response_model=dict)
async def get_profile_completion(
    current_user: User = Depends(get_current_user)
):
    """Get profile completion status"""
    return {
        "percentage": current_user.profile_completion_percentage,
        "completed": current_user.profile_completed,
        "fields": {
            "full_name": bool(current_user.full_name),
            "email": bool(current_user.email),
            "linkedin_id": bool(current_user.linkedin_id),
            "github_id": bool(current_user.github_id),
            "college_name": bool(current_user.college_name),
            "branch": bool(current_user.branch),
            "bio": bool(current_user.bio)
        }
    }


@router.get("/eligibility", response_model=dict)
async def get_user_eligibility(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user eligibility status for submitting experiences"""
    eligibility = calculate_profile_eligibility(current_user, db)
    eligible = is_user_eligible(current_user, db)
    
    return {
        "eligible": eligible,
        "eligibility_percentage": eligibility["eligibility_percentage"],
        "status": eligibility["status"],
        "recommendation": eligibility["recommendation"],
        "score": eligibility["score"],
        "max_score": eligibility["max_score"],
        "issues": eligibility["issues"],
        "strengths": eligibility["strengths"],
        "requirements": {
            "is_verified": current_user.is_verified,
            "profile_completed": current_user.profile_completed,
            "profile_completion_percentage": current_user.profile_completion_percentage,
            "minimum_eligibility_percentage": 60
        }
    }
