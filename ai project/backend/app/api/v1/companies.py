from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.db.database import get_db
from app.db.models import Experience
from app.services.ai_service import AIService
from app.api.dependencies import get_current_user
from app.db.models import User

router = APIRouter()
ai_service = AIService()

@router.get("/{company_name}/suggestions")
async def get_company_suggestions(
    company_name: str,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get AI-powered suggestions for a specific company"""
    # Get all published experiences for this company
    experiences = db.query(Experience).filter(
        Experience.company_name.ilike(f"%{company_name}%"),
        Experience.is_published == True
    ).all()
    
    if not experiences:
        return {
            "company_name": company_name,
            "interview_questions": [],
            "skills_to_build": [],
            "preparation_tips": [],
            "common_rounds": []
        }
    
    # Extract common patterns
    all_questions = []
    all_skills = []
    all_rounds = []
    
    for exp in experiences:
        # Extract questions
        if exp.questions_asked:
            if isinstance(exp.questions_asked, dict):
                for category, questions in exp.questions_asked.items():
                    if isinstance(questions, list):
                        all_questions.extend(questions[:3])  # Top 3 per category
        
        # Extract rounds
        if exp.interview_rounds:
            if isinstance(exp.interview_rounds, list):
                for round_data in exp.interview_rounds:
                    if isinstance(round_data, dict):
                        round_name = round_data.get('round_name') or round_data.get('round_type', 'Unknown')
                        all_rounds.append(round_name)
        
        # Extract skills from preparation strategy
        if exp.preparation_strategy:
            # Simple keyword extraction (can be enhanced with AI)
            strategy_lower = exp.preparation_strategy.lower()
            if 'dsa' in strategy_lower or 'data structure' in strategy_lower:
                all_skills.append('Data Structures & Algorithms')
            if 'system design' in strategy_lower:
                all_skills.append('System Design')
            if 'coding' in strategy_lower or 'programming' in strategy_lower:
                all_skills.append('Coding Practice')
            if 'oops' in strategy_lower or 'object oriented' in strategy_lower:
                all_skills.append('Object-Oriented Programming')
    
    # Get unique values
    unique_questions = list(set(all_questions))[:10]  # Top 10 unique questions
    unique_skills = list(set(all_skills))[:8]  # Top 8 unique skills
    unique_rounds = list(set(all_rounds))[:6]  # Top 6 unique rounds
    
    # Generate AI suggestions
    try:
        # Use AI service to generate comprehensive suggestions
        preparation_guide = await ai_service.generate_preparation_guide(
            company_name=company_name,
            role="Software Engineer",  # Default role, can be made dynamic
            experiences=experiences[:10]  # Use top 10 experiences
        )
        
        # Parse preparation guide for tips
        preparation_tips = []
        if preparation_guide:
            lines = preparation_guide.split('\n')
            for line in lines:
                line = line.strip()
                if line and (line.startswith('-') or line.startswith('•') or line.startswith('*')):
                    tip = line.lstrip('-•*').strip()
                    if tip and len(tip) > 10:
                        preparation_tips.append(tip)
        
        # If AI didn't generate enough tips, add defaults
        if len(preparation_tips) < 5:
            preparation_tips.extend([
                f"Focus on {company_name}'s core technologies and values",
                "Practice coding problems daily on platforms like LeetCode",
                "Prepare for multiple interview rounds",
                "Research the company's recent projects and initiatives",
                "Practice explaining your thought process clearly"
            ])
    except Exception:
        # Fallback suggestions
        preparation_tips = [
            f"Research {company_name}'s interview process and expectations",
            "Practice Data Structures and Algorithms problems",
            "Prepare for technical coding rounds",
            "Review system design concepts (for senior roles)",
            "Practice behavioral questions and STAR method",
            "Build projects relevant to the role",
            "Prepare questions to ask the interviewer"
        ]
    
    return {
        "company_name": company_name,
        "interview_questions": unique_questions[:8],
        "skills_to_build": unique_skills[:6] if unique_skills else [
            "Data Structures & Algorithms",
            "Problem Solving",
            "System Design",
            "Coding Practice",
            "Technical Communication"
        ],
        "preparation_tips": preparation_tips[:7],
        "common_rounds": unique_rounds[:5] if unique_rounds else [
            "Online Assessment",
            "Technical Round",
            "HR Round"
        ],
        "total_experiences": len(experiences)
    }
