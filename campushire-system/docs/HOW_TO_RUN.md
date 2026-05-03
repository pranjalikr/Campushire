# How to Run CampusHire AI Application

## Quick Start (Easiest Method)

### Option 1: Use Batch Files (Recommended for Windows)

1. **Double-click `START_ALL.bat`** in the project root folder
   - This will start both backend and frontend in separate windows

OR

2. **Start them separately:**
   - Double-click `START_BACKEND.bat` to start the backend
   - Double-click `START_FRONTEND.bat` to start the frontend

---

## Manual Setup (Command Prompt)

### Prerequisites
- Python 3.10+ installed
- Node.js and npm installed
- Virtual environment already created (in `backend/venv`)

### Step 1: Start Backend Server

Open **Command Prompt** and run:

```cmd
cd "C:\Users\tejuu\OneDrive\Desktop\ai project\backend"
venv\Scripts\activate
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
Creating database tables...
Database tables created successfully!
INFO:     Application startup complete.
```

**Backend URLs:**
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

**Keep this window open!** The backend must stay running.

---

### Step 2: Start Frontend Server

Open a **NEW Command Prompt window** and run:

```cmd
cd "C:\Users\tejuu\OneDrive\Desktop\ai project\frontend"
npm install
npm run dev
```

**Expected output:**
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

**Frontend URL:**
- Application: http://localhost:5173

**Keep this window open too!** The frontend must stay running.

---

## Verify Everything is Working

1. **Check Backend:**
   - Open browser: http://localhost:8000/health
   - Should show: `{"status":"healthy"}`

2. **Check Frontend:**
   - Open browser: http://localhost:5173
   - Should see the CampusHire AI homepage

---

## Troubleshooting

### Backend Issues

**Problem: "Cannot connect to server"**
- Make sure backend is running (check the backend command prompt window)
- Verify port 8000 is not blocked by firewall
- Try: `curl http://localhost:8000/health` in a new terminal

**Problem: "Module not found" or "No module named uvicorn"**
- Activate virtual environment: `venv\Scripts\activate`
- Install dependencies: `pip install -r requirements.txt`

**Problem: Port 8000 already in use**
- Find and kill the process:
  ```cmd
  netstat -ano | findstr ":8000"
  taskkill /PID <PID_NUMBER> /F
  ```
- Or change port in `main.py` and update frontend API URL

### Frontend Issues

**Problem: "Cannot connect to server" error in browser**
- Make sure backend is running first
- Check browser console for errors
- Hard refresh: `Ctrl + Shift + R`

**Problem: "npm: command not found"**
- Install Node.js from https://nodejs.org/
- Restart command prompt after installation

**Problem: Port 5173 already in use**
- Vite will automatically try the next available port
- Or kill the process using port 5173

---

## Stopping the Servers

- Press `Ctrl + C` in each command prompt window
- Or close the command prompt windows

---

## Development Tips

1. **Backend auto-reloads** when you save Python files (thanks to `--reload` flag)
2. **Frontend auto-reloads** when you save React/TypeScript files (Vite hot reload)
3. **Always start backend first**, then frontend
4. **Keep both windows open** while developing

---

## Project Structure

```
ai project/
├── backend/          # FastAPI backend
│   ├── venv/         # Python virtual environment
│   ├── main.py       # FastAPI app entry point
│   └── app/          # Application code
├── frontend/         # React + TypeScript frontend
│   ├── src/          # Source code
│   └── package.json  # Node dependencies
├── START_BACKEND.bat # Backend startup script
├── START_FRONTEND.bat # Frontend startup script
└── START_ALL.bat     # Start both servers
```

---

## Need Help?

Check `TROUBLESHOOTING.md` for more detailed solutions to common issues.
