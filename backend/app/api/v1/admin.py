from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.db.models import Experience, Admin, AuditLog, User
from app.schemas.experience import ExperienceResponse, ExperienceCreateRequest
from app.schemas.user import UserResponse
from app.core.security import get_password_hash, verify_password
from app.core.config import settings
from pydantic import BaseModel

router = APIRouter()


class AdminLoginRequest(BaseModel):
    email: str
    password: str


class AdminAuthResponse(BaseModel):
    message: str
    admin_id: int


class ApprovalRequest(BaseModel):
    experience_id: int
    action: str  # "approve" or "reject"
    reason: str = None


def _truncate_to_72_bytes(text: str) -> str:
    """Truncate string to 72 bytes maximum - CRITICAL for bcrypt compatibility"""
    if not isinstance(text, str):
        text = str(text)
    
    # Convert to bytes to check actual byte length (not character length)
    text_bytes = text.encode('utf-8')
    
    # Truncate if longer than 72 bytes
    if len(text_bytes) > 72:
        text_bytes = text_bytes[:72]
    
    # Decode back to string (may lose some characters if cut mid-UTF8, but safe)
    try:
        return text_bytes.decode('utf-8')
    except UnicodeDecodeError:
        # If we cut in middle of multi-byte character, use error handling
        return text_bytes.decode('utf-8', errors='ignore')


@router.post("/login", response_model=AdminAuthResponse)
async def admin_login(request: AdminLoginRequest, db: Session = Depends(get_db)):
    """Admin login (simplified - using admin password from config)"""
    try:
        # For simplicity, we'll use a single admin account
        # In production, use proper admin authentication
        
        # Truncate both passwords to 72 bytes before comparison
        request_password = _truncate_to_72_bytes(request.password)
        admin_password = _truncate_to_72_bytes(settings.ADMIN_PASSWORD)
        
        if request_password != admin_password:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid admin credentials"
            )
        
        # Get or create admin user
        admin = db.query(Admin).filter(Admin.email == request.email).first()
        if not admin:
            # Password is already truncated, safe to hash
            admin = Admin(
                email=request.email,
                hashed_password=get_password_hash(request_password),
                role="super_admin"
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
        
        return AdminAuthResponse(message="Admin authenticated", admin_id=admin.id)
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_msg = str(e)
        error_trace = traceback.format_exc()
        print("=" * 50)
        print("ADMIN LOGIN ERROR:")
        print("=" * 50)
        print(f"Error: {error_msg}")
        print(f"Traceback:\n{error_trace}")
        print("=" * 50)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {error_msg}"
        )


@router.get("/experiences/pending", response_model=List[ExperienceResponse])
async def get_pending_experiences(db: Session = Depends(get_db)):
    """Get all pending experiences for approval - show ALL user-submitted experiences with eligibility info"""
    # Get ALL experiences that are not approved (admin should see everything)
    experiences = db.query(Experience).filter(
        Experience.is_approved == False
    ).order_by(Experience.created_at.desc()).all()
    
    results = []
    for exp in experiences:
        response = ExperienceResponse.model_validate(exp, from_attributes=True)
        user = db.query(User).filter(User.id == exp.user_id).first()
        if user:
            user_eligible = is_user_eligible(user, db)
            eligibility_info = calculate_profile_eligibility(user, db)
            # Use experience information for user_name (from experience, not user profile)
            user_name = exp.full_name if exp.full_name else user.full_name
            # Store eligibility info in response (will be added to schema)
            response = response.model_copy(update={
                'user_name': user_name,  # From experience
                'user_eligible': user_eligible,
                'user_eligibility_percentage': eligibility_info["eligibility_percentage"],
                'user_eligibility_status': eligibility_info["status"]
            })
        results.append(response)
    
    return results


@router.post("/experiences/approve", response_model=dict)
async def approve_experience(
    request: ApprovalRequest,
    admin_id: int = 1,  # Simplified - in production, get from auth
    db: Session = Depends(get_db)
):
    """Approve or reject an experience"""
    experience = db.query(Experience).filter(Experience.id == request.experience_id).first()
    
    if not experience:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Experience not found"
        )
    
    if request.action == "approve":
        experience.is_approved = True
        experience.is_published = True
    elif request.action == "reject":
        experience.is_approved = False
        experience.is_published = False
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid action. Use 'approve' or 'reject'"
        )
    
    # Create audit log
    audit_log = AuditLog(
        admin_id=admin_id,
        action=request.action,
        entity_type="experience",
        entity_id=experience.id,
        details={"reason": request.reason}
    )
    db.add(audit_log)
    db.commit()
    
    return {"message": f"Experience {request.action}d successfully"}


@router.get("/experiences/all", response_model=List[ExperienceResponse])
async def get_all_experiences(
    approved_only: bool = False,
    db: Session = Depends(get_db)
):
    """Get all experiences (admin view) - show ALL experiences with eligibility info"""
    query = db.query(Experience)
    
    if approved_only:
        query = query.filter(Experience.is_approved == True)
    
    experiences = query.order_by(Experience.created_at.desc()).all()
    
    results = []
    for exp in experiences:
        response = ExperienceResponse.model_validate(exp)
        user = db.query(User).filter(User.id == exp.user_id).first()
        if user:
            response.user_name = user.full_name
            # Add eligibility information for admin review
            user_eligible = is_user_eligible(user, db)
            eligibility_info = calculate_profile_eligibility(user, db)
            # Store eligibility info in response
            response.user_eligible = user_eligible
            response.user_eligibility_percentage = eligibility_info["eligibility_percentage"]
            response.user_eligibility_status = eligibility_info["status"]
        results.append(response)
    
    return results


@router.get("/audit-logs", response_model=List[dict])
async def get_audit_logs(
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get audit logs"""
    logs = db.query(AuditLog).order_by(
        AuditLog.created_at.desc()
    ).limit(limit).all()
    
    return [
        {
            "id": log.id,
            "admin_id": log.admin_id,
            "action": log.action,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "details": log.details,
            "created_at": log.created_at.isoformat()
        }
        for log in logs
    ]


def is_user_eligible(user: User, db: Session) -> bool:
    """Check if user meets eligibility criteria to submit experiences"""
    # User must be verified
    if not user.is_verified:
        return False
    
    # User profile must be completed
    if not user.profile_completed:
        return False
    
    # Calculate eligibility percentage
    eligibility = calculate_profile_eligibility(user, db)
    
    # User must have at least 60% eligibility (status "Eligible" or "Highly Eligible")
    if eligibility["eligibility_percentage"] < 60:
        return False
    
    return True


def calculate_profile_eligibility(user: User, db: Session) -> dict:
    """Calculate profile eligibility score based on information from submitted experiences"""
    score = 0
    max_score = 100
    issues = []
    strengths = []
    
    # Get user's most recent experience to extract profile information
    # User information should come from experiences, not user profile
    all_experiences = db.query(Experience).filter(Experience.user_id == user.id).order_by(Experience.created_at.desc()).all()
    
    # Use information from the most recent experience
    latest_experience = all_experiences[0] if all_experiences else None
    
    # Basic information (30 points) - from experience
    if latest_experience and latest_experience.full_name and len(latest_experience.full_name.strip()) > 0:
        score += 10
        strengths.append("Full name provided")
    elif user.full_name and len(user.full_name.strip()) > 0:
        score += 10
        strengths.append("Full name provided")
    else:
        issues.append("Full name is missing")
    
    if user.email:
        score += 10
        strengths.append("Email verified")
    else:
        issues.append("Email not verified")
    
    # Check college name - from experience
    college_name = None
    if latest_experience:
        college_name = getattr(latest_experience, 'college_name', None)
    if not college_name or not (isinstance(college_name, str) and len(college_name.strip()) > 0):
        college_name = getattr(user, 'college_name', None)
    
    if college_name and isinstance(college_name, str) and len(college_name.strip()) > 0:
        score += 10
        strengths.append("College information provided")
    else:
        issues.append("College name missing")
    
    # Check branch - from experience
    branch = None
    if latest_experience:
        branch = getattr(latest_experience, 'branch', None)
    if not branch or not (isinstance(branch, str) and len(branch.strip()) > 0):
        branch = getattr(user, 'branch', None)
    
    if branch and isinstance(branch, str) and len(branch.strip()) > 0:
        score += 5
        strengths.append("Branch information provided")
    else:
        issues.append("Branch information missing")
    
    # Professional profiles (30 points) - from experience
    linkedin_id = None
    if latest_experience:
        linkedin_id = getattr(latest_experience, 'linkedin_id', None)
    if not linkedin_id or not (isinstance(linkedin_id, str) and len(linkedin_id.strip()) > 0):
        linkedin_id = getattr(user, 'linkedin_id', None)
    
    if linkedin_id and isinstance(linkedin_id, str) and len(linkedin_id.strip()) > 0:
        score += 15
        strengths.append("LinkedIn profile linked")
    else:
        issues.append("LinkedIn profile not linked")
    
    # Check GitHub - from experience
    github_id = None
    if latest_experience:
        github_id = getattr(latest_experience, 'github_id', None)
    if not github_id or not (isinstance(github_id, str) and len(github_id.strip()) > 0):
        github_id = getattr(user, 'github_id', None)
    
    if github_id and isinstance(github_id, str) and len(github_id.strip()) > 0:
        score += 15
        strengths.append("GitHub profile linked")
    else:
        issues.append("GitHub profile not linked")
    
    # Experience quality (40 points)
    # Count all experiences submitted by the user (information comes from experiences)
    experience_count = len(all_experiences)
    
    if experience_count > 0:
        score += min(20, experience_count * 5)  # Up to 20 points for experiences
        strengths.append(f"{experience_count} experience(s) shared")
    else:
        issues.append("No experiences shared yet")
    
    approved_experiences = [e for e in all_experiences if e.is_approved]
    if len(approved_experiences) > 0:
        score += 10
        strengths.append(f"{len(approved_experiences)} approved experience(s)")
    
    # Check if latest experience has all required fields (from experience, not user profile)
    if latest_experience:
        has_all_fields = (
            latest_experience.full_name and
            latest_experience.college_name and
            latest_experience.branch and
            latest_experience.linkedin_id and
            latest_experience.github_id and
            latest_experience.bio
        )
        if has_all_fields:
            score += 10
            strengths.append("Complete information in experience")
        else:
            issues.append("Incomplete information in experience")
    else:
        issues.append("No experience submitted yet")
    
    # Calculate percentage
    eligibility_percentage = min(100, int((score / max_score) * 100))
    
    # Determine eligibility status
    if eligibility_percentage >= 80:
        status = "Highly Eligible"
        recommendation = "approve"
    elif eligibility_percentage >= 60:
        status = "Eligible"
        recommendation = "approve"
    elif eligibility_percentage >= 40:
        status = "Needs Improvement"
        recommendation = "review"
    else:
        status = "Not Eligible"
        recommendation = "reject"
    
    return {
        "eligibility_percentage": eligibility_percentage,
        "score": score,
        "max_score": max_score,
        "status": status,
        "recommendation": recommendation,
        "issues": issues,
        "strengths": strengths,
        "experience_count": experience_count,
        "approved_experience_count": len(approved_experiences)
    }


class UserProfileResponse(BaseModel):
    user: UserResponse
    eligibility: dict
    experience_count: int
    
    class Config:
        from_attributes = True


@router.get("/users", response_model=List[UserProfileResponse])
async def get_all_users(
    db: Session = Depends(get_db)
):
    """Get all users with their profiles and eligibility scores"""
    users = db.query(User).filter(User.is_active == True).order_by(User.created_at.desc()).all()
    
    results = []
    for user in users:
        eligibility = calculate_profile_eligibility(user, db)
        experience_count = db.query(Experience).filter(Experience.user_id == user.id).count()
        
        results.append({
            "user": user,
            "eligibility": eligibility,
            "experience_count": experience_count
        })
    
    return results


@router.get("/users/{user_id}", response_model=UserProfileResponse)
async def get_user_profile(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific user's profile with eligibility score"""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    eligibility = calculate_profile_eligibility(user, db)
    experience_count = db.query(Experience).filter(Experience.user_id == user.id).count()
    
    return {
        "user": user,
        "eligibility": eligibility,
        "experience_count": experience_count
    }


@router.get("/users/{user_id}/experiences", response_model=List[ExperienceResponse])
async def get_user_experiences(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get all experiences for a specific user"""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    experiences = db.query(Experience).filter(Experience.user_id == user_id).order_by(Experience.created_at.desc()).all()
    
    results = []
    for exp in experiences:
        response = ExperienceResponse.model_validate(exp, from_attributes=True)
        response = response.model_copy(update={'user_name': user.full_name})
        results.append(response)
    
    return results


class ProfileApprovalRequest(BaseModel):
    user_id: int
    action: str  # "approve" or "reject"
    reason: Optional[str] = None


@router.post("/users/approve", response_model=dict)
async def approve_user_profile(
    request: ProfileApprovalRequest,
    admin_id: int = 1,  # Simplified - in production, get from auth
    db: Session = Depends(get_db)
):
    """Approve or reject a user profile"""
    user = db.query(User).filter(User.id == request.user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if request.action == "approve":
        user.is_verified = True
        user.is_active = True
        message = "User profile approved"
    elif request.action == "reject":
        user.is_verified = False
        user.is_active = False
        message = "User profile rejected"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid action. Use 'approve' or 'reject'"
        )
    
    # Create audit log
    audit_log = AuditLog(
        admin_id=admin_id,
        action=request.action,
        entity_type="user",
        entity_id=user.id,
        details={"reason": request.reason, "eligibility": calculate_profile_eligibility(user, db)}
    )
    db.add(audit_log)
    db.commit()
    
    return {"message": message}


@router.post("/experiences/create", response_model=ExperienceResponse)
async def create_experience_as_admin(
    request: ExperienceCreateRequest,
    admin_id: int = 1,  # Simplified - in production, get from auth
    db: Session = Depends(get_db)
):
    """Create an experience as admin - automatically approved and published"""
    # Validate required fields
    if not request.full_name or not request.full_name.strip():
        raise HTTPException(status_code=400, detail="Full name is required")
    if not request.linkedin_id or not request.linkedin_id.strip():
        raise HTTPException(status_code=400, detail="LinkedIn ID is required")
    if not request.github_id or not request.github_id.strip():
        raise HTTPException(status_code=400, detail="GitHub ID is required")
    if not request.college_name or not request.college_name.strip():
        raise HTTPException(status_code=400, detail="College name is required")
    if not request.branch or not request.branch.strip():
        raise HTTPException(status_code=400, detail="Branch is required")
    if not request.bio or not request.bio.strip():
        raise HTTPException(status_code=400, detail="Bio/About Me is required")
    
    # Get or create a system user for admin-created experiences
    # First, try to find a system user (email like "system@campushire.com" or similar)
    system_user = db.query(User).filter(User.email == "system@campushire.com").first()
    if not system_user:
        # Create a system user if it doesn't exist
        system_user = User(
            email="system@campushire.com",
            full_name="CampusHire System",
            hashed_password=get_password_hash("system_password_never_used"),
            is_verified=True,
            is_active=True,
            profile_completed=True,
            profile_completion_percentage=100
        )
        db.add(system_user)
        db.commit()
        db.refresh(system_user)
    
    # Create experience with system user_id
    experience_data = request.model_dump()
    # Mark as pre-uploaded if not explicitly set
    is_preuploaded = experience_data.pop('is_preuploaded', True)
    
    experience = Experience(
        user_id=system_user.id,  # Use system user for admin-created experiences
        is_approved=True,  # Auto-approved
        is_published=True,  # Auto-published
        is_preuploaded=is_preuploaded,  # Mark as admin pre-uploaded
        **experience_data
    )
    db.add(experience)
    db.commit()
    db.refresh(experience)
    
    # Create audit log
    audit_log = AuditLog(
        admin_id=admin_id,
        action="create",
        entity_type="experience",
        entity_id=experience.id,
        details={"source": "admin_created", "auto_approved": True}
    )
    db.add(audit_log)
    db.commit()
    
    # Return the created experience
    response = ExperienceResponse.model_validate(experience, from_attributes=True)
    # Mark as admin-created and include system user profile information
    response = response.model_copy(update={
        'user_name': "Admin",
        'user_email': system_user.email,
        'user_profile_completed': system_user.profile_completed,
        'user_profile_completion_percentage': system_user.profile_completion_percentage
    })
    
    return response
