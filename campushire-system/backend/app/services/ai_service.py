import httpx
from typing import List, Dict, Any
from app.core.config import settings
from app.db.models import Experience


class AIService:
    """AI service for processing experiences and generating insights"""
    
    def __init__(self):
        self.ollama_url = settings.OLLAMA_BASE_URL
    
    async def extract_patterns(self, experiences: List[Experience]) -> Dict[str, Any]:
        """Extract patterns from multiple experiences"""
        # Aggregate data
        companies = {}
        roles = {}
        common_questions = {}
        
        for exp in experiences:
            # Company analysis
            if exp.company_name not in companies:
                companies[exp.company_name] = {
                    "count": 0,
                    "selected": 0,
                    "questions": [],
                    "rounds": []
                }
            
            companies[exp.company_name]["count"] += 1
            if exp.final_result == "Selected":
                companies[exp.company_name]["selected"] += 1
            
            # Questions extraction
            if exp.questions_asked:
                for category, questions in exp.questions_asked.items():
                    if category not in common_questions:
                        common_questions[category] = []
                    if isinstance(questions, list):
                        common_questions[category].extend(questions)
            
            # Round analysis
            if exp.interview_rounds:
                companies[exp.company_name]["rounds"].extend(exp.interview_rounds)
        
        return {
            "companies": companies,
            "common_questions": common_questions,
            "roles": roles
        }
    
    async def generate_preparation_guide(
        self,
        company_name: str,
        role: str,
        experiences: List[Experience]
    ) -> str:
        """Generate a preparation guide using AI"""
        # Prepare context from experiences
        context = f"Company: {company_name}, Role: {role}\n\n"
        
        for exp in experiences[:5]:  # Use top 5 experiences
            context += f"Experience:\n"
            context += f"- Result: {exp.final_result}\n"
            if exp.questions_asked:
                context += f"- Questions: {exp.questions_asked}\n"
            if exp.preparation_strategy:
                context += f"- Strategy: {exp.preparation_strategy}\n"
            context += "\n"
        
        prompt = f"""Based on the following interview experiences for {company_name} ({role}), 
        create a comprehensive preparation guide including:
        1. Must-have skills and topics
        2. Common interview questions
        3. Preparation strategy
        4. Resources to follow
        5. Tips for success
        
        Experiences:
        {context}
        
        Preparation Guide:"""
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.ollama_url}/api/generate",
                    json={
                        "model": "llama2",
                        "prompt": prompt,
                        "stream": False
                    }
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return result.get("response", "Unable to generate guide at this time.")
                else:
                    return self._generate_fallback_guide(company_name, role, experiences)
        
        except Exception:
            return self._generate_fallback_guide(company_name, role, experiences)
    
    def _generate_fallback_guide(
        self,
        company_name: str,
        role: str,
        experiences: List[Experience]
    ) -> str:
        """Generate a basic guide without AI"""
        selected_count = sum(1 for exp in experiences if exp.final_result == "Selected")
        total_count = len(experiences)
        success_rate = (selected_count / total_count * 100) if total_count > 0 else 0
        
        guide = f"""# Preparation Guide for {company_name} - {role}
        
## Overview
Based on {total_count} interview experiences, the selection rate is {success_rate:.1f}%.

## Key Preparation Areas:
1. **Technical Skills**: Focus on core CS fundamentals
2. **DSA Practice**: Solve company-specific problems
3. **System Design**: For senior roles
4. **HR Preparation**: Research company values

## Common Topics:
- Data Structures and Algorithms
- Problem-solving skills
- Technical knowledge relevant to role

## Tips:
- Practice coding problems daily
- Prepare for multiple rounds
- Research the company thoroughly
- Be confident and clear in communication
"""
        return guide
    
    async def generate_personalized_roadmap(
        self,
        user_skills: List[str],
        target_role: str,
        target_companies: List[str]
    ) -> Dict[str, Any]:
        """Generate personalized preparation roadmap"""
        # This would use AI to analyze user skills and create a roadmap
        roadmap = {
            "current_skills": user_skills,
            "target_role": target_role,
            "target_companies": target_companies,
            "recommendations": [
                "Focus on DSA fundamentals",
                "Practice coding problems",
                "Build relevant projects",
                "Prepare for technical rounds"
            ],
            "timeline": "8-12 weeks"
        }
        
        return roadmap
    
    async def analyze_resume_feedback(
        self,
        resume_text: str,
        company_name: str
    ) -> Dict[str, Any]:
        """Analyze resume and provide feedback based on company trends"""
        # This would use AI to analyze resume
        feedback = {
            "strengths": [
                "Good technical skills mentioned",
                "Projects are relevant"
            ],
            "improvements": [
                "Add more quantifiable achievements",
                "Highlight relevant experience"
            ],
            "company_specific": f"Based on {company_name} trends, emphasize problem-solving skills"
        }
        
        return feedback
