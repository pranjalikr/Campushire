from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User
from app.core.security import get_password_hash, create_access_token, verify_password
from app.core.email import send_otp_email, verify_otp, verified_emails
from app.schemas.auth import SignUpRequest, OTPVerifyRequest, OTPVerifyOnlyRequest, LoginRequest, TokenResponse, ForgotPasswordRequest, ResetPasswordRequest
from datetime import timedelta
from app.core.config import settings

router = APIRouter()


@router.post("/signup", response_model=dict)
async def signup(request: SignUpRequest, db: Session = Depends(get_db)):
    """Sign up a new user and send OTP to email"""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Send OTP via email
    try:
        send_otp_email(request.email)
        return {
            "message": "OTP sent to your email. Please check your inbox, spam folder, and Promotions tab (Gmail).", 
            "email": request.email
        }
    except Exception as e:
        # Re-raise the error with a user-friendly message
        error_msg = str(e).encode('ascii', 'ignore').decode('ascii')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send OTP email: {error_msg}. Please check your email configuration."
        )


@router.post("/verify-otp-only", response_model=dict)
async def verify_otp_only(request: OTPVerifyOnlyRequest, db: Session = Depends(get_db)):
    """Verify OTP only - does not create account yet"""
    import time
    
    # Verify OTP
    if not verify_otp(request.email, request.otp):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP"
        )
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Mark email as verified (valid for 5 minutes)
    verified_emails[request.email] = time.time() + 300
    
    return {
        "message": "OTP verified successfully. Please complete your profile.",
        "email": request.email
    }


@router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp_endpoint(request: OTPVerifyRequest, db: Session = Depends(get_db)):
    """Verify OTP and create user account with password"""
    import time
    
    # Validate password confirmation
    if request.password != request.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )
    
    # Validate password length
    if len(request.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long"
        )
    
    # Check if email was verified in previous step (within 5 minutes)
    is_recently_verified = (
        request.email in verified_emails and 
        verified_emails[request.email] > time.time()
    )
    
    # If not recently verified, verify OTP again
    if not is_recently_verified:
        if not request.otp or not verify_otp(request.email, request.otp):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired OTP. Please verify your OTP again."
            )
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Remove from verified emails (one-time use)
    if request.email in verified_emails:
        del verified_emails[request.email]
    
    # Create new user with password
    user = User(
        email=request.email,
        full_name=request.full_name,
        hashed_password=get_password_hash(request.password),
        is_verified=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return TokenResponse(
        access_token=access_token,
        user_id=user.id,
        email=user.email,
        full_name=user.full_name or "",
        is_verified=user.is_verified,
        profile_completed=user.profile_completed
    )


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Login with email and password"""
    try:
        user = db.query(User).filter(User.email == request.email).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        if not user.hashed_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No password set for this account. Please use 'Forgot Password' to set a password."
            )
        
        if not verify_password(request.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is inactive"
            )
        
        # Create access token
        access_token = create_access_token(
            data={"sub": user.email, "user_id": user.id},
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        
        # Create response
        response = TokenResponse(
            access_token=access_token,
            user_id=user.id,
            email=user.email,
            full_name=user.full_name or "",
            is_verified=bool(user.is_verified),
            profile_completed=bool(user.profile_completed)
        )
        
        return response
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in login endpoint: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )


@router.post("/resend-otp", response_model=dict)
async def resend_otp(request: dict, db: Session = Depends(get_db)):
    """Resend OTP to user's email"""
    email = request.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is required"
        )
    try:
        send_otp_email(email)
        return {
            "message": "OTP resent to your email. Please check your inbox, spam folder, and Promotions tab (Gmail)."
        }
    except Exception as e:
        error_msg = str(e).encode('ascii', 'ignore').decode('ascii')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to resend OTP email: {error_msg}. Please check your email configuration."
        )


@router.post("/forgot-password", response_model=dict)
async def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Send password reset OTP to user's email"""
    # Check if user exists
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        # Don't reveal if email exists or not (security best practice)
        return {
            "message": "If the email exists, a password reset OTP has been sent. Please check your inbox, spam folder, and Promotions tab (Gmail)."
        }
    
    # Send password reset OTP
    try:
        send_otp_email(request.email)
        return {
            "message": "Password reset OTP sent to your email. Please check your inbox, spam folder, and Promotions tab (Gmail)."
        }
    except Exception as e:
        error_msg = str(e).encode('ascii', 'ignore').decode('ascii')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send password reset OTP: {error_msg}. Please check your email configuration."
        )


@router.post("/reset-password", response_model=dict)
async def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset password using OTP"""
    # Validate password confirmation
    if request.new_password != request.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )
    
    # Validate password length
    if len(request.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long"
        )
    
    # Verify OTP
    if not verify_otp(request.email, request.otp):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP"
        )
    
    # Check if user exists
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update password
    user.hashed_password = get_password_hash(request.new_password)
    db.commit()
    db.refresh(user)
    
    return {
        "message": "Password reset successfully. You can now login with your new password."
    }
