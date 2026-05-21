# 🚀 CampusHire AI – Smart Interview Preparation & Placement Experience Platform

CampusHire AI is a full-stack web application designed to help students prepare effectively for campus placements by providing access to real interview experiences, AI-powered preparation resources, company-specific insights, and personalized guidance.

The platform bridges the gap between students and placement preparation by creating a centralized repository of authentic interview experiences while leveraging Artificial Intelligence to generate tailored preparation content.

## 🌟 Project Vision

Every year thousands of students struggle to find reliable placement preparation resources and real interview experiences from previous candidates.

CampusHire AI aims to solve this by creating a collaborative platform where students can:

✅ Share placement experiences  
✅ Learn from previous interview rounds  
✅ Access AI-generated preparation guides  
✅ Practice company-specific questions  
✅ Interact with an intelligent interview assistant  
✅ Track placement preparation progress  

## ✨ Core Features

### 🔐 Secure Authentication System
- OTP-based email verification
- JWT authentication
- Role-based access control
- Protected routes and user sessions

### 👨‍🎓 Student Dashboard
- Personalized profile management
- Company experience browsing
- Experience submission portal
- Saved preparation resources

### 📚 Interview Experience Repository
- Company-wise interview experiences
- Technical and HR round details
- Interview difficulty ratings
- Search and filter functionality

### 🤖 AI Interview Assistant
- AI-generated preparation guides
- Company-specific interview preparation
- Resume and interview guidance
- Intelligent query handling

### 📊 Analytics Dashboard
- Platform usage insights
- Popular company trends
- Experience contribution statistics
- Student engagement metrics

### 🛡️ Admin Management Panel
- Content moderation
- User management
- Experience approval workflow
- Platform monitoring

### 🌙 Modern User Experience
- Responsive design
- Mobile-friendly interface
- Light/Dark mode support
- Clean and intuitive UI

## 🛠️ Tech Stack

### Frontend
- React.js
- TypeScript
- Tailwind CSS
- Axios
- React Router

### Backend
- FastAPI
- Python
- SQLAlchemy
- Pydantic

### Database
- PostgreSQL

### AI Layer
- Ollama
- LLaMA Models
- Mistral Models
- ChromaDB Vector Database

### Authentication & Security
- JWT Authentication
- Email OTP Verification
- Password Hashing
- Protected API Routes

## 📂 Project Structure

```
CampusHire/
│
├── backend/
│   ├── app/
│   ├── api/
│   ├── models/
│   ├── services/
│   ├── database/
│   └── main.py
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── assets/
│
├── docs/
├── screenshots/
├── scripts/
└── README.md
```

## ⚙️ Installation & Setup

**1. Clone the repository:**
```bash
git clone https://github.com/pranjalikr/Campushire.git
cd Campushire
```

**2. Backend Setup:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

Backend runs at: `http://127.0.0.1:8000`

**3. Frontend Setup:**
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

## 📈 Learning Outcomes

This project helped me gain practical experience in:

- Full Stack Web Development
- Frontend Development with React
- Backend API Development using FastAPI
- Database Design & Integration
- Authentication & Authorization
- AI Integration in Web Applications
- REST API Development
- Software Architecture Design
- Project Structuring & Deployment Concepts

## 🔮 Future Enhancements

- 🎤 AI Mock Interview Simulator
- 📄 Resume Analyzer Integration
- 🏢 Company Placement Statistics
- 🌍 Multi-language Support
- 📱 Mobile Application
- 🔔 Real-time Placement Notifications
- 📊 Advanced Analytics & Recommendation System

## 👩‍💻 Developed By

**Pranjali K**  
Artificial Intelligence & Data Science Student  
Passionate about AI, Full-Stack Development, and building impactful solutions that solve real-world problems.

- GitHub: [github.com/pranjalikr](https://github.com/pranjalikr)

## ⭐ Support

If you found this project interesting, consider exploring the repository and sharing your feedback!
