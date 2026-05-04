# CampusHire AI

A full-stack web application that helps students prepare for campus interviews using real placement experiences shared by other students.

## Features

- 🔐 OTP-based authentication with email verification
- 👤 User dashboard with company cards and experience sharing
- 🤖 AI-powered interview preparation guides
- 💬 Campus interview chatbot
- 🛡️ Admin interface for content moderation
- 📊 Analytics and insights dashboard
- 🎨 Modern UI with light/dark mode

## Tech Stack

- **Frontend**: React.js with TypeScript
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL
- **AI Layer**: Ollama (LLaMA/Mistral)
- **Vector Database**: ChromaDB
- **Authentication**: JWT

## Project Structure

```
campushire/
 ├── frontend/
 ├── backend/
 ├── docs/
 ├── README.md
 └── .gitignore
```

## Setup Instructions

### Backend Setup

1. Navigate to backend directory
2. Create virtual environment: `python -m venv venv`
3. Activate venv: `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Linux/Mac)
4. Install dependencies: `pip install -r requirements.txt`
5. Set up environment variables in `.env` file
6. Run migrations: `alembic upgrade head`
7. Start server: `uvicorn main:app --reload`

### Frontend Setup

1. Navigate to frontend directory
2. Install dependencies: `npm install`
3. Start development server: `npm start`

## Environment Variables

Create a `.env` file in the backend directory with:

```
DATABASE_URL=postgresql://user:password@localhost/campushire_db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
OLLAMA_BASE_URL=http://localhost:11434
ADMIN_PASSWORD=your-admin-password
```

## License

MIT
