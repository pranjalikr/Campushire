# CampusHire AI - Setup Guide

## Prerequisites

- Python 3.9+
- Node.js 18+
- PostgreSQL (or use SQLite for development)
- Ollama (for AI features) - [Install Ollama](https://ollama.ai)

## Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment**
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`

4. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Update the following variables:
     ```
     DATABASE_URL=postgresql://user:password@localhost/campushire_db
     SECRET_KEY=your-secret-key-here
     SMTP_USER=your-email@gmail.com
     SMTP_PASSWORD=your-app-password
     ADMIN_PASSWORD=your-admin-password
     ```

6. **Set up database**
   - Create PostgreSQL database: `createdb campushire_db`
   - Or update DATABASE_URL to use SQLite: `sqlite:///./campushire.db`

7. **Run migrations** (if using Alembic)
   ```bash
   alembic upgrade head
   ```

8. **Start backend server**
   ```bash
   uvicorn main:app --reload
   ```

   Backend will run on `http://localhost:8000`

## Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (optional)
   - Create `.env` file:
     ```
     VITE_API_URL=http://localhost:8000/api/v1
     ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   Frontend will run on `http://localhost:3000`

## Ollama Setup (for AI features)

1. **Install Ollama**
   - Download from [ollama.ai](https://ollama.ai)
   - Or use: `curl https://ollama.ai/install.sh | sh`

2. **Pull required model**
   ```bash
   ollama pull llama2
   # or
   ollama pull mistral
   ```

3. **Start Ollama server**
   ```bash
   ollama serve
   ```

   Ollama will run on `http://localhost:11434`

## Email Configuration (Gmail) - REQUIRED for OTP

**IMPORTANT**: Email configuration is required for user signup, login OTP, and password reset functionality.

### Step-by-Step Gmail Setup:

1. **Enable 2-Step Verification** on your Google account
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable "2-Step Verification" if not already enabled

2. **Generate App Password**:
   - Go to [Google Account → Security → App passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" as the app
   - Select "Other (Custom name)" as device, enter "CampusHire"
   - Click "Generate"
   - Copy the 16-character password (no spaces)

3. **Update backend/.env file**:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-16-character-app-password
   EMAIL_FROM=your-email@gmail.com
   EMAIL_FROM_NAME=CampusHire AI
   ```

### Common Email Issues:

**Error: "Failed to send reset OTP" or "Failed to send OTP email"**
- ✅ Check that `SMTP_USER` and `SMTP_PASSWORD` are set in `backend/.env`
- ✅ Verify you're using an **App Password** (not your regular Gmail password)
- ✅ Ensure 2-Step Verification is enabled on your Google account
- ✅ Check that the App Password is correct (16 characters, no spaces)
- ✅ Verify `SMTP_USER` matches the email used to generate the App Password

**Error: "SMTP authentication error"**
- The App Password is incorrect or expired
- Generate a new App Password and update `SMTP_PASSWORD` in `.env`
- Restart the backend server after updating `.env`

**Error: "Invalid credentials" (Login)**
- Check that the email and password are correct
- Verify the user account exists and is active
- Ensure the password was set correctly during signup

## Quick Start (Development)

1. Start PostgreSQL (or use SQLite)
2. Start Ollama: `ollama serve`
3. Start Backend: `cd backend && uvicorn main:app --reload`
4. Start Frontend: `cd frontend && npm run dev`
5. Open browser: `http://localhost:3000`

## Testing

### Backend API
- API docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

### Test User Flow
1. Sign up with email
2. Verify OTP
3. Complete profile
4. Share interview experience
5. View dashboard

## Troubleshooting

### Database Connection Issues
- Check PostgreSQL is running
- Verify DATABASE_URL in `.env`
- Try SQLite for quick testing

### Ollama Connection Issues
- Ensure Ollama is running: `ollama serve`
- Check OLLAMA_BASE_URL in `.env`
- AI features will use fallback responses if Ollama is unavailable

### Email Not Sending
- Verify SMTP credentials
- Check Gmail app password is correct
- Check firewall/network settings

## Production Deployment

1. Set `SECRET_KEY` to a strong random value
2. Use production database (PostgreSQL recommended)
3. Configure proper CORS origins
4. Set up SSL/HTTPS
5. Use environment variables for all secrets
6. Set up proper logging and monitoring
