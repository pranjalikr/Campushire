from pydantic import BaseModel, EmailStr
from typing import Optional


class SignUpRequest(BaseModel):
    full_name: str = ""  # Optional, will be collected during OTP verification
    email: EmailStr


class OTPVerifyOnlyRequest(BaseModel):
    email: EmailStr
    otp: str


class OTPVerifyRequest(BaseModel):
    email: EmailStr
    otp: str
    full_name: str
    password: str
    confirm_password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    email: str
    full_name: str = ""
    is_verified: bool
    profile_completed: bool
    
    class Config:
        from_attributes = True


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str
    confirm_password: str
