from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from app.db.database import get_db
from app.db.models import Experience, Bookmark, User
from app.api.dependencies import get_current_user
from app.schemas.experience import (
    ExperienceCreateRequest,
    ExperienceUpdateRequest,
    ExperienceResponse
)
from app.api.v1.admin import is_user_eligible

router = APIRouter()


@router.post("/", response_model=ExperienceResponse)
async def create_experience(
    request: ExperienceCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new interview experience - defaults to pending approval"""
    # Validate user eligibility before allowing experience submission
    if not is_user_eligible(current_user, db):
        # Calculate eligibility to provide detailed error message
        from app.api.v1.admin import calculate_profile_eligibility
        eligibility = calculate_profile_eligibility(current_user, db)
        
        error_details = []
        if not current_user.is_verified:
            error_details.append("Your account is not verified. Please verify your email first.")
        if not current_user.profile_completed:
            error_details.append("Your profile is not complete. Please complete your profile first.")
        if eligibility["eligibility_percentage"] < 60:
            error_details.append(f"Your profile eligibility is {eligibility['eligibility_percentage']}% (minimum 60% required).")
            if eligibility["issues"]:
                error_details.append(f"Issues: {', '.join(eligibility['issues'][:3])}")
        
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "message": "You are not eligible to submit experiences. Please complete and verify your profile first.",
                "eligibility_percentage": eligibility["eligibility_percentage"],
                "status": eligibility["status"],
                "issues": error_details,
                "requirements": [
                    "Account must be verified (email verification)",
                    "Profile must be 100% complete",
                    "Eligibility score must be at least 60%"
                ]
            }
        )
    
    # Use only the information provided in the request (no auto-population from user profile)
    # This ensures we only show what the user explicitly uploaded
    experience_data = request.model_dump()
    
    # Validate required personal information fields (must be provided in the request)
    if not experience_data.get('full_name') or not experience_data.get('full_name', '').strip():
        raise HTTPException(status_code=400, detail="Full name is required. Please fill it in the form.")
    if not experience_data.get('linkedin_id') or not experience_data.get('linkedin_id', '').strip():
        raise HTTPException(status_code=400, detail="LinkedIn ID is required. Please fill it in the form.")
    if not experience_data.get('github_id') or not experience_data.get('github_id', '').strip():
        raise HTTPException(status_code=400, detail="GitHub ID is required. Please fill it in the form.")
    if not experience_data.get('college_name') or not experience_data.get('college_name', '').strip():
        raise HTTPException(status_code=400, detail="College name is required. Please fill it in the form.")
    if not experience_data.get('branch') or not experience_data.get('branch', '').strip():
        raise HTTPException(status_code=400, detail="Branch is required. Please fill it in the form.")
    if not experience_data.get('bio') or not experience_data.get('bio', '').strip():
        raise HTTPException(status_code=400, detail="Bio/About Me is required. Please fill it in the form.")
    
    # Validate and clean questions_asked
    if experience_data.get('questions_asked'):
        questions_asked = experience_data['questions_asked']
        if isinstance(questions_asked, dict):
            cleaned_questions = {}
            for category, questions_list in questions_asked.items():
                if isinstance(questions_list, list):
                    # Filter out empty or invalid questions
                    valid_questions = []
                    for q in questions_list:
                        if isinstance(q, str) and q.strip():
                            # Try to parse if it's JSON (question-answer format)
                            try:
                                parsed = q.strip()
                                # If it's JSON, validate it has question field and proper length
                                if parsed.startswith('{') and parsed.endswith('}'):
                                    import json
                                    qa_obj = json.loads(parsed)
                                    if isinstance(qa_obj, dict):
                                        question_text = qa_obj.get('question', '').strip()
                                        answer_text = qa_obj.get('answer', '').strip() if qa_obj.get('answer') else ''
                                        
                                        # Validate question
                                        if not question_text:
                                            continue  # Skip invalid question
                                        if len(question_text) < 5:
                                            continue  # Question too short
                                        if len(question_text) > 500:
                                            continue  # Question too long
                                        
                                        # Validate answer if provided
                                        if answer_text and len(answer_text) > 2000:
                                            continue  # Answer too long
                                        
                                        valid_questions.append(parsed)
                                else:
                                    # Plain string question - validate length
                                    if parsed and len(parsed) >= 5 and len(parsed) <= 500:
                                        valid_questions.append(parsed)
                            except (json.JSONDecodeError, ValueError):
                                # Not valid JSON, but might be plain string
                                parsed = q.strip()
                                if parsed and len(parsed) >= 5 and len(parsed) <= 500:
                                    valid_questions.append(parsed)
                    if valid_questions:
                        cleaned_questions[category] = valid_questions
            experience_data['questions_asked'] = cleaned_questions if cleaned_questions else None
        else:
            experience_data['questions_asked'] = None
    
    try:
        experience = Experience(
            user_id=current_user.id,
            is_approved=False,  # All new experiences require admin approval
            is_published=False,  # Not published until approved
            **experience_data
        )
        db.add(experience)
        db.commit()
        db.refresh(experience)
    except Exception as e:
        db.rollback()
        import traceback
        error_msg = str(e)
        error_trace = traceback.format_exc()
        print("=" * 50)
        print("EXPERIENCE CREATE ERROR:")
        print("=" * 50)
        print(f"Error: {error_msg}")
        print(f"Traceback:\n{error_trace}")
        print("=" * 50)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create experience: {error_msg}"
        )
    
    # Use model_validate for Pydantic v2
    try:
        response = ExperienceResponse.model_validate(experience, from_attributes=True)
        
        # Include user profile information (use model_copy for Pydantic v2)
        if not experience.is_anonymous:
            response = response.model_copy(update={
                'user_name': current_user.full_name,
                'user_email': current_user.email,
                'user_profile_completed': current_user.profile_completed,
                'user_profile_completion_percentage': current_user.profile_completion_percentage
            })
        
        return response
    except Exception as e:
        import traceback
        error_msg = str(e)
        error_trace = traceback.format_exc()
        print("=" * 50)
        print("EXPERIENCE RESPONSE VALIDATION ERROR:")
        print("=" * 50)
        print(f"Error: {error_msg}")
        print(f"Traceback:\n{error_trace}")
        print("=" * 50)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process experience response: {error_msg}"
        )


@router.get("/", response_model=List[ExperienceResponse])
async def get_experiences(
    company_name: Optional[str] = None,
    role: Optional[str] = None,
    published_only: bool = True,
    db: Session = Depends(get_db)
):
    """Get all experiences with optional filters"""
    try:
        query = db.query(Experience)
        
        if published_only:
            # Show published experiences OR pre-uploaded experiences (always visible)
            query = query.filter(or_(Experience.is_published == True, Experience.is_preuploaded == True))
        
        if company_name:
            query = query.filter(Experience.company_name.ilike(f"%{company_name}%"))
        
        if role:
            query = query.filter(Experience.role.ilike(f"%{role}%"))
        
        experiences = query.order_by(Experience.created_at.desc()).all()
        
        # Return empty list if no experiences
        if not experiences:
            return []
        
        # Use model_validate for Pydantic v2
        # Filter to show: pre-uploaded, approved experiences, or experiences from eligible users
        results = []
        for exp in experiences:
            try:
                # Pre-uploaded experiences are always shown (admin-verified)
                if exp.is_preuploaded:
                    response = ExperienceResponse.model_validate(exp, from_attributes=True)
                    if not exp.is_anonymous and exp.user_id:
                        user = db.query(User).filter(User.id == exp.user_id).first()
                        if user:
                            response = response.model_copy(update={
                                'user_name': user.full_name,
                                'user_email': user.email,
                                'user_profile_completed': user.profile_completed,
                                'user_profile_completion_percentage': user.profile_completion_percentage
                            })
                    results.append(response)
                # Approved experiences are always shown (admin has verified them)
                elif exp.is_approved and exp.is_published:
                    response = ExperienceResponse.model_validate(exp, from_attributes=True)
                    if not exp.is_anonymous and exp.user_id:
                        user = db.query(User).filter(User.id == exp.user_id).first()
                        if user:
                            response = response.model_copy(update={
                                'user_name': user.full_name,
                                'user_email': user.email,
                                'user_profile_completed': user.profile_completed,
                                'user_profile_completion_percentage': user.profile_completion_percentage
                            })
                    results.append(response)
                else:
                    # For pending/unpublished user-submitted experiences, only show if user is eligible
                    if exp.user_id:
                        user = db.query(User).filter(User.id == exp.user_id).first()
                        if user and is_user_eligible(user, db):
                            response = ExperienceResponse.model_validate(exp, from_attributes=True)
                            if not exp.is_anonymous:
                                response = response.model_copy(update={
                                    'user_name': user.full_name,
                                    'user_email': user.email,
                                    'user_profile_completed': user.profile_completed,
                                    'user_profile_completion_percentage': user.profile_completion_percentage
                                })
                            results.append(response)
            except Exception as e:
                print(f"Error processing experience {exp.id if exp else 'unknown'}: {e}")
                import traceback
                traceback.print_exc()
                continue
        
        return results
    except Exception as e:
        print(f"Error in get_experiences: {e}")
        import traceback
        traceback.print_exc()
        return []


@router.get("/my-experiences", response_model=List[ExperienceResponse])
async def get_my_experiences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's experiences"""
    experiences = db.query(Experience).filter(
        Experience.user_id == current_user.id
    ).order_by(Experience.created_at.desc()).all()
    
    return [ExperienceResponse.model_validate(exp, from_attributes=True) for exp in experiences]


@router.get("/{experience_id}", response_model=ExperienceResponse)
async def get_experience(
    experience_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific experience - show if pre-uploaded, approved, or from eligible user"""
    experience = db.query(Experience).filter(Experience.id == experience_id).first()
    
    if not experience:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Experience not found"
        )
    
    # Check visibility: show if pre-uploaded, approved, or from eligible user
    if not experience.is_preuploaded and not (experience.is_approved and experience.is_published):
        # For pending/unpublished experiences, check user eligibility
        if experience.user_id:
            user = db.query(User).filter(User.id == experience.user_id).first()
            if not user or not is_user_eligible(user, db):
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Experience not found"
                )
    
    # Use model_validate for Pydantic v2
    response = ExperienceResponse.model_validate(experience, from_attributes=True)
    if not experience.is_anonymous and experience.user_id:
        user = db.query(User).filter(User.id == experience.user_id).first()
        if user:
            response = response.model_copy(update={
                'user_name': user.full_name,
                'user_email': user.email,
                'user_profile_completed': user.profile_completed,
                'user_profile_completion_percentage': user.profile_completion_percentage
            })
    
    return response


@router.put("/{experience_id}", response_model=ExperienceResponse)
async def update_experience(
    experience_id: int,
    request: ExperienceUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an experience (only if not approved)"""
    experience = db.query(Experience).filter(Experience.id == experience_id).first()
    
    if not experience:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Experience not found"
        )
    
    if experience.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this experience"
        )
    
    if experience.is_approved:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update approved experience"
        )
    
    try:
        update_data = request.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(experience, field, value)
        
        db.commit()
        db.refresh(experience)
    except Exception as e:
        db.rollback()
        import traceback
        error_msg = str(e)
        error_trace = traceback.format_exc()
        print("=" * 50)
        print("EXPERIENCE UPDATE ERROR:")
        print("=" * 50)
        print(f"Error: {error_msg}")
        print(f"Traceback:\n{error_trace}")
        print("=" * 50)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update experience: {error_msg}"
        )
    
    try:
        return ExperienceResponse.model_validate(experience, from_attributes=True)
    except Exception as e:
        import traceback
        error_msg = str(e)
        error_trace = traceback.format_exc()
        print("=" * 50)
        print("EXPERIENCE UPDATE RESPONSE VALIDATION ERROR:")
        print("=" * 50)
        print(f"Error: {error_msg}")
        print(f"Traceback:\n{error_trace}")
        print("=" * 50)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process experience response: {error_msg}"
        )


@router.post("/{experience_id}/bookmark", response_model=dict)
async def bookmark_experience(
    experience_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Bookmark an experience"""
    experience = db.query(Experience).filter(Experience.id == experience_id).first()
    
    if not experience:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Experience not found"
        )
    
    # Check if already bookmarked
    existing = db.query(Bookmark).filter(
        Bookmark.user_id == current_user.id,
        Bookmark.experience_id == experience_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already bookmarked"
        )
    
    bookmark = Bookmark(
        user_id=current_user.id,
        experience_id=experience_id
    )
    db.add(bookmark)
    db.commit()
    
    return {"message": "Experience bookmarked successfully"}


@router.delete("/{experience_id}/bookmark", response_model=dict)
async def remove_bookmark(
    experience_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove bookmark from an experience"""
    bookmark = db.query(Bookmark).filter(
        Bookmark.user_id == current_user.id,
        Bookmark.experience_id == experience_id
    ).first()
    
    if not bookmark:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bookmark not found"
        )
    
    db.delete(bookmark)
    db.commit()
    
    return {"message": "Bookmark removed successfully"}


@router.get("/bookmarks/all", response_model=List[ExperienceResponse])
async def get_bookmarked_experiences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all bookmarked experiences"""
    bookmarks = db.query(Bookmark).filter(
        Bookmark.user_id == current_user.id
    ).all()
    
    experience_ids = [b.experience_id for b in bookmarks]
    experiences = db.query(Experience).filter(
        Experience.id.in_(experience_ids)
    ).all()
    
    results = []
    for exp in experiences:
        response = ExperienceResponse.model_validate(exp, from_attributes=True)
        if not exp.is_anonymous and exp.user_id:
            user = db.query(User).filter(User.id == exp.user_id).first()
            if user:
                response = response.model_copy(update={
                    'user_name': user.full_name,
                    'user_email': user.email,
                    'user_profile_completed': user.profile_completed,
                    'user_profile_completion_percentage': user.profile_completion_percentage
                })
        results.append(response)
    
    return results
