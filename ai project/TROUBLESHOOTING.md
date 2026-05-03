# Troubleshooting Guide

## "Cannot connect to server" Error

If you see the error message: **"Cannot connect to server. Please make sure the backend is running."**

This means the frontend cannot reach the backend server at `http://localhost:8000`.

### Quick Fix

1. **Start the Backend Server:**
   - **Option 1 (Easiest)**: Double-click `START_BACKEND.bat` in the project root
   - **Option 2**: Open Command Prompt/PowerShell and run:
     ```powershell
     cd "C:\Users\tejuu\OneDrive\Desktop\ai project"
     START_BACKEND.bat
     ```
   - **Option 3 (Manual)**: 
     ```powershell
     cd backend
     .\venv\Scripts\activate
     python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
     ```

2. **Verify Backend is Running:**
   - Open your browser and go to: `http://localhost:8000/health`
   - You should see: `{"status":"healthy"}`
   - Or check: `http://localhost:8000/docs` (API documentation)

3. **Check Backend Console:**
   - Look for messages like:
     - "Creating database tables..."
     - "Database tables created successfully!"
     - "Uvicorn running on http://127.0.0.1:8000"

### Common Issues

#### Backend Won't Start

**Error: "Module not found" or "No module named 'app'"**
- Make sure you're in the `backend` directory
- Activate the virtual environment: `.\venv\Scripts\activate`
- Install dependencies: `pip install -r requirements.txt`

**Error: "Port 8000 already in use"**
- Another process is using port 8000
- Close other applications or change the port in `START_BACKEND.bat`

**Error: "DATABASE_URL not found" or "SECRET_KEY not found"**
- Create a `.env` file in the `backend` directory
- See `SETUP.md` for required environment variables

#### Backend Starts But Frontend Still Can't Connect

**Check CORS Settings:**
- Backend CORS is configured to allow all origins (`allow_origins=["*"]`)
- If you changed this, make sure frontend URL is included

**Check Firewall:**
- Windows Firewall might be blocking the connection
- Allow Python/uvicorn through the firewall

**Check Port:**
- Verify backend is running on port 8000
- Check frontend `.env` has correct `VITE_API_URL=http://localhost:8000/api/v1`

### Start Both Servers

To start both frontend and backend together:
- Double-click `START_ALL.bat` in the project root
- This will open two windows:
  - Backend: `http://localhost:8000`
  - Frontend: `http://localhost:5173`

### Verify Everything is Working

1. **Backend Health Check:**
   - Open: `http://localhost:8000/health`
   - Should return: `{"status":"healthy"}`

2. **Backend API Docs:**
   - Open: `http://localhost:8000/docs`
   - Should show Swagger UI with all API endpoints

3. **Frontend:**
   - Open: `http://localhost:5173`
   - Should load the CampusHire landing page

### Still Having Issues?

1. **Check Console Logs:**
   - Open browser Developer Tools (F12)
   - Check Console tab for detailed error messages
   - Check Network tab to see if requests are being made

2. **Check Backend Logs:**
   - Look at the terminal/command prompt where backend is running
   - Check for error messages or stack traces

3. **Verify Environment:**
   - Backend `.env` file exists and has all required variables
   - Virtual environment is activated
   - Python version is 3.9 or higher
   - Node.js version is 18 or higher
