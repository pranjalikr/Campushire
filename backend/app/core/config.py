from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    
    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Email
    SMTP_HOST: str
    SMTP_PORT: int = 587
    SMTP_USER: str
    SMTP_PASSWORD: str
    EMAIL_FROM: str = ""
    EMAIL_FROM_NAME: str = "CampusHire AI"
    
    # AI
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    
    # Admin
    ADMIN_PASSWORD: str
    
    # Frontend
    FRONTEND_URL: str = "http://localhost:3000"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance
settings = Settings()

# Set EMAIL_FROM to SMTP_USER if not provided in .env
if not settings.EMAIL_FROM:
    settings.EMAIL_FROM = settings.SMTP_USER
