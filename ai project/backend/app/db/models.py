from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String)
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Profile fields
    linkedin_id = Column(String, nullable=True)
    github_id = Column(String, nullable=True)
    college_name = Column(String, nullable=True)
    branch = Column(String, nullable=True)
    bio = Column(Text, nullable=True)  # About/Bio information
    package_offered = Column(Float, nullable=True)  # Expected/typical package
    questions_asked = Column(JSON, nullable=True)  # Common questions (same structure as experiences)
    profile_completed = Column(Boolean, default=False)
    profile_completion_percentage = Column(Integer, default=0)
    
    # Relationships
    experiences = relationship("Experience", back_populates="user")
    bookmarks = relationship("Bookmark", back_populates="user")


class Experience(Base):
    __tablename__ = "experiences"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    company_name = Column(String, nullable=False, index=True)
    role = Column(String, nullable=False, index=True)
    package_offered = Column(Float, nullable=True)
    years_of_experience = Column(Float, nullable=True)  # Years of experience at time of interview
    
    # Personal Information (Important fields)
    full_name = Column(String, nullable=False)  # Required
    linkedin_id = Column(String, nullable=False)  # Required
    github_id = Column(String, nullable=False)  # Required
    college_name = Column(String, nullable=False)  # Required
    branch = Column(String, nullable=False)  # Required
    bio = Column(Text, nullable=False)  # Required - About/Bio information
    
    # Interview details
    interview_rounds = Column(JSON, nullable=True)  # List of round details
    questions_asked = Column(JSON, nullable=True)  # Categorized questions
    preparation_strategy = Column(Text, nullable=True)
    resources_followed = Column(JSON, nullable=True)  # List of resources
    rejection_reasons = Column(Text, nullable=True)
    final_result = Column(String, nullable=False)  # "Selected" or "Rejected"
    
    # Metadata
    is_anonymous = Column(Boolean, default=False)
    is_approved = Column(Boolean, default=False)
    is_published = Column(Boolean, default=False)
    is_preuploaded = Column(Boolean, default=False)  # Admin pre-uploaded experiences
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="experiences")
    bookmarks = relationship("Bookmark", back_populates="experience")


class Bookmark(Base):
    __tablename__ = "bookmarks"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    experience_id = Column(Integer, ForeignKey("experiences.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="bookmarks")
    experience = relationship("Experience", back_populates="bookmarks")


class Admin(Base):
    __tablename__ = "admins"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="moderator")  # "super_admin" or "moderator"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("admins.id"), nullable=True)
    action = Column(String, nullable=False)  # "approve", "reject", "delete"
    entity_type = Column(String, nullable=False)  # "experience", "user"
    entity_id = Column(Integer, nullable=False)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
