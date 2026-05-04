from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import httpx
from app.core.config import settings

router = APIRouter()


class ChatMessage(BaseModel):
    message: str
    conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    conversation_id: str


# Campus interview related keywords
CAMPUS_KEYWORDS = [
    "interview", "placement", "campus", "company", "round", "question",
    "preparation", "resume", "coding", "dsa", "technical", "hr", "managerial",
    "offer", "package", "rejection", "selected", "experience", "skill",
    "leetcode", "hackerrank", "codeforces", "project", "internship"
]


def is_campus_related(message: str) -> bool:
    """Check if message is related to campus interviews"""
    message_lower = message.lower()
    return any(keyword in message_lower for keyword in CAMPUS_KEYWORDS)


@router.post("/chat", response_model=ChatResponse)
async def chat_with_bot(request: ChatMessage):
    """Chat with campus interview bot"""
    # Check if message is campus interview related
    if not is_campus_related(request.message):
        return ChatResponse(
            response="I'm CampusHire AI, specialized in helping with campus interview preparation. Please ask me questions about interviews, placements, preparation strategies, or company-specific guidance.",
            conversation_id=request.conversation_id or "default"
        )
    
    # Prepare prompt for Ollama
    system_prompt = """You are CampusHire AI, an expert assistant specialized in campus interview preparation. 
    Your role is to help students prepare for campus placements by:
    1. Providing interview preparation tips and strategies
    2. Answering questions about common interview patterns
    3. Suggesting resources for DSA, technical skills, and HR preparation
    4. Offering company-specific guidance based on placement experiences
    5. Helping with resume tips and mock interview preparation
    
    Keep responses concise, practical, and focused on campus interview preparation.
    Do not answer questions unrelated to campus interviews or placements."""
    
    user_prompt = f"{system_prompt}\n\nUser Question: {request.message}\n\nAssistant:"
    
    try:
        # Call Ollama API
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{settings.OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": "llama2",  # or "mistral" if available
                    "prompt": user_prompt,
                    "stream": False
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                bot_response = result.get("response", "I apologize, but I couldn't generate a response. Please try again.")
            else:
                # Fallback response if Ollama is not available
                bot_response = generate_fallback_response(request.message)
    
    except Exception as e:
        # Fallback if Ollama is not running
        bot_response = generate_fallback_response(request.message)
    
    return ChatResponse(
        response=bot_response,
        conversation_id=request.conversation_id or "default"
    )


def generate_fallback_response(message: str) -> str:
    """Generate a fallback response when AI is unavailable"""
    message_lower = message.lower()
    
    if any(word in message_lower for word in ["dsa", "data structure", "algorithm", "coding"]):
        return """For DSA preparation, I recommend:
1. Start with basics: Arrays, Strings, Linked Lists, Stacks, Queues
2. Practice on platforms like LeetCode, HackerRank, Codeforces
3. Focus on problem-solving patterns: Two Pointers, Sliding Window, Dynamic Programming
4. Solve company-specific problems from previous experiences
5. Time yourself while solving problems to improve speed"""
    
    elif any(word in message_lower for word in ["resume", "cv", "curriculum"]):
        return """For resume tips:
1. Keep it concise (1-2 pages)
2. Highlight relevant projects and internships
3. Include technical skills and programming languages
4. Add achievements and certifications
5. Tailor resume for each company
6. Use action verbs and quantify achievements
7. Ensure no grammatical errors"""
    
    elif any(word in message_lower for word in ["hr", "human resource", "behavioral"]):
        return """For HR round preparation:
1. Prepare answers for common questions: Tell me about yourself, Why this company?
2. Research the company's values and culture
3. Prepare questions to ask the interviewer
4. Practice STAR method for behavioral questions
5. Be confident and maintain eye contact
6. Show enthusiasm and genuine interest"""
    
    elif any(word in message_lower for word in ["technical", "round", "interview"]):
        return """For technical interviews:
1. Revise core CS fundamentals: OS, DBMS, Networks, OOP
2. Practice coding problems daily
3. Explain your thought process clearly
4. Ask clarifying questions before solving
5. Write clean, optimized code
6. Test your solution with examples
7. Discuss time and space complexity"""
    
    else:
        return """I'm here to help with campus interview preparation! You can ask me about:
- DSA and coding preparation strategies
- Technical interview tips
- HR round guidance
- Resume building advice
- Company-specific preparation
- Common interview questions
- Mock interview practice

What would you like to know?"""
