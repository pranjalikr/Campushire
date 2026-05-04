# Fix "Cannot connect to server" Error

## ✅ Backend Status
The backend IS running and responding! Verified at: http://localhost:8000/health

## 🔧 Quick Fix Steps

### Step 1: Hard Refresh Your Browser
1. Open your browser (where you see the error)
2. Press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
   - This clears cached errors and forces a fresh connection
3. The error should disappear!

### Step 2: If Still Not Working - Restart Both Servers

**Close all browser tabs first, then:**

#### Start Backend (Command Prompt Window 1):
```cmd
cd "C:\Users\tejuu\OneDrive\Desktop\ai project\backend"
venv\Scripts\activate
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Wait until you see: `INFO:     Uvicorn running on http://127.0.0.1:8000`

#### Start Frontend (Command Prompt Window 2):
```cmd
cd "C:\Users\tejuu\OneDrive\Desktop\ai project\frontend"
npm run dev
```

Wait until you see: `Local:   http://localhost:5173/`

#### Open Browser:
- Go to: http://localhost:5173 (or http://localhost:3002 if that's what you see)
- Press `Ctrl + Shift + R` to hard refresh

## ✅ Verify Backend is Running

Open in browser: http://localhost:8000/health
- Should show: `{"status":"healthy"}`

Open in browser: http://localhost:8000/docs
- Should show the API documentation

## 🐛 Still Having Issues?

1. **Check Browser Console:**
   - Press `F12` to open Developer Tools
   - Go to "Console" tab
   - Look for red error messages
   - Take a screenshot and check what the actual error is

2. **Check Backend Window:**
   - Look at the backend Command Prompt window
   - Make sure there are no error messages
   - Should see: `INFO:     Application startup complete.`

3. **Kill All Processes and Restart:**
   ```cmd
   # In Command Prompt, run:
   netstat -ano | findstr ":8000"
   # Note the PIDs, then:
   taskkill /F /PID <PID_NUMBER>
   # Repeat for each PID
   ```
   Then restart the backend.

## 📝 Current Status

- ✅ Backend is running on port 8000
- ✅ Backend health check: WORKING
- ✅ API endpoint: ACCESSIBLE
- ⚠️ Frontend may need hard refresh to clear cached error

**Most likely solution: Just press `Ctrl + Shift + R` in your browser!**
