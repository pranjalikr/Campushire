from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List, Dict, Any
from app.db.database import get_db
from app.db.models import Experience, User
from collections import Counter

router = APIRouter()


@router.get("/company-stats", response_model=Dict[str, Any])
async def get_company_statistics(
    company_name: str = None,
    db: Session = Depends(get_db)
):
    """Get statistics for a specific company or all companies"""
    query = db.query(Experience).filter(Experience.is_published == True)
    
    if company_name:
        query = query.filter(Experience.company_name.ilike(f"%{company_name}%"))
    
    experiences = query.all()
    
    if not experiences:
        return {
            "total_experiences": 0,
            "companies": [],
            "roles": [],
            "selection_rate": 0,
            "average_package": 0
        }
    
    # Calculate statistics
    total = len(experiences)
    selected = sum(1 for exp in experiences if exp.final_result == "Selected")
    selection_rate = (selected / total * 100) if total > 0 else 0
    
    # Average package
    packages = [exp.package_offered for exp in experiences if exp.package_offered]
    avg_package = sum(packages) / len(packages) if packages else 0
    
    # Company distribution
    companies = Counter([exp.company_name for exp in experiences])
    
    # Role distribution
    roles = Counter([exp.role for exp in experiences])
    
    # Most asked questions
    all_questions = []
    for exp in experiences:
        if exp.questions_asked:
            for category, questions in exp.questions_asked.items():
                if isinstance(questions, list):
                    all_questions.extend(questions)
    
    top_questions = Counter(all_questions).most_common(10)
    
    return {
        "total_experiences": total,
        "companies": dict(companies.most_common(10)),
        "roles": dict(roles.most_common(10)),
        "selection_rate": round(selection_rate, 2),
        "average_package": round(avg_package, 2),
        "top_questions": [{"question": q, "count": c} for q, c in top_questions]
    }


@router.get("/role-stats", response_model=Dict[str, Any])
async def get_role_statistics(
    role: str,
    db: Session = Depends(get_db)
):
    """Get statistics for a specific role"""
    experiences = db.query(Experience).filter(
        and_(
            Experience.role.ilike(f"%{role}%"),
            Experience.is_published == True
        )
    ).all()
    
    if not experiences:
        return {
            "role": role,
            "total_experiences": 0,
            "companies": [],
            "selection_rate": 0,
            "average_package": 0
        }
    
    total = len(experiences)
    selected = sum(1 for exp in experiences if exp.final_result == "Selected")
    selection_rate = (selected / total * 100) if total > 0 else 0
    
    packages = [exp.package_offered for exp in experiences if exp.package_offered]
    avg_package = sum(packages) / len(packages) if packages else 0
    
    companies = Counter([exp.company_name for exp in experiences])
    
    return {
        "role": role,
        "total_experiences": total,
        "companies": dict(companies.most_common(10)),
        "selection_rate": round(selection_rate, 2),
        "average_package": round(avg_package, 2)
    }


@router.get("/trends", response_model=Dict[str, Any])
async def get_trends(db: Session = Depends(get_db)):
    """Get placement trends and insights"""
    experiences = db.query(Experience).filter(
        Experience.is_published == True
    ).all()
    
    # Skills/technologies mentioned
    all_resources = []
    for exp in experiences:
        if exp.resources_followed:
            if isinstance(exp.resources_followed, list):
                all_resources.extend(exp.resources_followed)
    
    top_resources = Counter(all_resources).most_common(10)
    
    # Rejection reasons analysis
    rejection_reasons = []
    for exp in experiences:
        if exp.rejection_reasons and exp.final_result == "Rejected":
            rejection_reasons.append(exp.rejection_reasons)
    
    # Difficulty analysis (if available in interview rounds)
    difficulty_levels = []
    for exp in experiences:
        if exp.interview_rounds:
            for round_data in exp.interview_rounds:
                if isinstance(round_data, dict) and "difficulty" in round_data:
                    difficulty_levels.append(round_data["difficulty"])
    
    difficulty_dist = Counter(difficulty_levels)
    
    return {
        "top_resources": [{"resource": r, "count": c} for r, c in top_resources],
        "rejection_reasons_count": len(rejection_reasons),
        "difficulty_distribution": dict(difficulty_dist),
        "total_experiences": len(experiences)
    }


@router.get("/college-stats", response_model=Dict[str, Any])
async def get_college_statistics(db: Session = Depends(get_db)):
    """Get statistics by college"""
    users = db.query(User).filter(User.college_name.isnot(None)).all()
    
    college_experiences = {}
    for user in users:
        if user.college_name:
            college = user.college_name
            if college not in college_experiences:
                college_experiences[college] = []
            
            user_exps = db.query(Experience).filter(
                and_(
                    Experience.user_id == user.id,
                    Experience.is_published == True
                )
            ).all()
            college_experiences[college].extend(user_exps)
    
    college_stats = {}
    for college, exps in college_experiences.items():
        if exps:
            selected = sum(1 for exp in exps if exp.final_result == "Selected")
            college_stats[college] = {
                "total_experiences": len(exps),
                "selection_rate": round((selected / len(exps) * 100), 2) if exps else 0
            }
    
    return college_stats
