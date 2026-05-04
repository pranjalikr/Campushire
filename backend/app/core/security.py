from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import bcrypt
from app.core.config import settings


def _truncate_password(password: str) -> str:
    """Truncate password to 72 bytes (bcrypt limit)"""
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
        # Try to decode, but if it fails (mid-character), use safe decode
        try:
            return password_bytes.decode('utf-8')
        except UnicodeDecodeError:
            # If we cut in the middle of a multi-byte character, decode with error handling
            return password_bytes.decode('utf-8', errors='ignore')
    return password


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash using bcrypt"""
    # Truncate password before verification to match bcrypt limit
    password_bytes = plain_password.encode('utf-8')
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
    
    # Use bcrypt directly for verification
    try:
        return bcrypt.checkpw(password_bytes, hashed_password.encode('utf-8'))
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt with proper 72-byte truncation"""
    # Ensure password is a string
    if not isinstance(password, str):
        password = str(password)
    
    # CRITICAL: Convert to bytes and enforce 72-byte limit BEFORE any bcrypt operation
    password_bytes = password.encode('utf-8')
    
    # Force truncation to maximum 72 bytes
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
    
    # Double-check: ensure we never exceed 72 bytes
    if len(password_bytes) > 72:
        # This should never happen, but if it does, force truncation
        password_bytes = password_bytes[:72]
    
    # Final safety check
    assert len(password_bytes) <= 72, f"FATAL: Password bytes exceed 72: {len(password_bytes)}"
    
    # Use bcrypt directly - pass bytes directly, never convert back to string
    salt = bcrypt.gensalt()
    # bcrypt.hashpw expects bytes and will fail if > 72 bytes
    hashed_bytes = bcrypt.hashpw(password_bytes, salt)
    return hashed_bytes.decode('utf-8')


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """Decode and verify a JWT token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None
