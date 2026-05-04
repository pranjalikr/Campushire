# 🚀 Quick Start Guide - CampusHire AI

## ✅ All Errors Fixed!

The application is now ready to run. Follow these simple steps:

---

## 📋 Prerequisites

- ✅ Python 3.10+ installed
- ✅ Node.js and npm installed
- ✅ Virtual environment already created in `backend/venv`

---

## 🎯 Method 1: Using Batch Files (Easiest - Windows)

### Option A: Start Everything at Once
1. **Double-click `START_ALL.bat`** in the project root folder
   - This starts both backend and frontend automatically

### Option B: Start Separately
1. **Double-click `START_BACKEND.bat`** → Starts backend server
2. **Double-click `START_FRONTEND.bat`** → Starts frontend server

---

## 💻 Method 2: Using Command Prompt (Manual)

### ⚠️ IMPORTANT: You need **2 SEPARATE** Command Prompt windows!

---

### 📦 STEP 1: Start Backend Server

**Open Command Prompt #1** and run these commands **ONE BY ONE**:

```cmd
cd "C:\Users\tejuu\OneDrive\Desktop\ai project\backend"
```

```cmd
venv\Scripts\activate
```

```cmd
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

**✅ Success looks like:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Application startup complete.
```

**🔴 KEEP THIS WINDOW OPEN!** Backend must stay running.

---

### 🌐 STEP 2: Start Frontend Server

**Open a NEW Command Prompt window** (#2) and run:

```cmd
cd "C:\Users\tejuu\OneDrive\Desktop\ai project\frontend"
```

```cmd
npm run dev
```

**✅ Success looks like:**
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

**🔴 KEEP THIS WINDOW OPEN TOO!** Frontend must stay running.

---

### 🌍 STEP 3: Open in Browser

Open your web browser and go to:

**Frontend:** http://localhost:5173  
*(or http://localhost:3002 if port 5173 is busy)*

**Backend API:** http://localhost:8000  
**Backend Docs:** http://localhost:8000/docs  
**Health Check:** http://localhost:8000/health

---

## ✅ Verify Everything Works

1. **Check Backend:**
   - Open: http://localhost:8000/health
   - Should show: `{"status":"healthy"}`

2. **Check Frontend:**
   - Open: http://localhost:5173
   - Should see the CampusHire homepage

---

## 🛑 Stopping the Servers

In each Command Prompt window, press:
```
Ctrl + C
```

Then close the windows.

---

## 🔧 Troubleshooting

### ❌ "Cannot connect to server" in browser
**Solution:**
1. Make sure backend is running (check Window #1)
2. Hard refresh browser: `Ctrl + Shift + R`
3. Check http://localhost:8000/health in browser

### ❌ "python: command not found"
**Solution:**
```cmd
venv\Scripts\activate
```
Make sure you activated the virtual environment first!

### ❌ "npm: command not found"
**Solution:**
- Install Node.js from https://nodejs.org/
- Restart Command Prompt after installation

### ❌ "Port 8000 already in use"
**Solution:**
- Backend is already running! Just start the frontend.
- Or kill the process:
  ```cmd
  netstat -ano | findstr ":8000"
  taskkill /PID <PID_NUMBER> /F
  ```

### ❌ "Port 5173 already in use"
**Solution:**
- Vite will automatically use the next available port (like 3002)
- Check the terminal output for the actual port number

---

## 📝 Quick Reference

### Backend Commands:
```cmd
cd "C:\Users\tejuu\OneDrive\Desktop\ai project\backend"
venv\Scripts\activate
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### Frontend Commands:
```cmd
cd "C:\Users\tejuu\OneDrive\Desktop\ai project\frontend"
npm run dev
```

### URLs:
- **Frontend:** http://localhost:5173 (or 3002)
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/health

---

## 🎉 New Features Added!

✅ **More Question Categories** (13 total):
- DSA, Technical, HR, Managerial
- System Design, Database, OOP
- Web Development, Mobile Development
- Data Structures, Algorithms
- Operating Systems, Networking

✅ **Question-Answer Pairs:**
- Add answers to each question
- Edit questions and answers inline
- Delete questions individually

✅ **Auto-Save:**
- Automatically saves after 2 seconds
- Shows save status (Saving/Saved/Unsaved)
- Works when editing existing experiences

---

## 💡 Development Tips

1. **Backend auto-reloads** when you save Python files
2. **Frontend auto-reloads** when you save React/TypeScript files
3. **Always start backend first**, then frontend
4. **Keep both windows open** while developing

---

## 📞 Need More Help?

Check these files:
- `HOW_TO_RUN.md` - Detailed instructions
- `RUN_IN_CMD.txt` - Command reference
- `TROUBLESHOOTING.md` - Common issues and solutions

---

**Happy Coding! 🚀**
