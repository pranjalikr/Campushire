# 🚀 QUICK START - Backend Server

## The errors you're seeing mean the backend server is NOT running.

## ✅ FIX: Start the Backend Server

### Method 1: Command Prompt (Easiest)

1. **Press Windows Key + R**
2. **Type `cmd` and press Enter**
3. **Copy and paste these commands ONE BY ONE:**

```cmd
cd "C:\Users\tejuu\OneDrive\Desktop\ai project\backend"
venv\Scripts\activate
python -m uvicorn main:app --reload
```

4. **Wait for this message:**
   ```
   INFO:     Uvicorn running on http://127.0.0.1:8000
   INFO:     Application startup complete.
   ```

5. **KEEP THIS WINDOW OPEN!** (Don't close it)

6. **Go back to your browser and refresh (Ctrl + Shift + R)**

### Method 2: PowerShell Script

1. **Navigate to:** `backend` folder in File Explorer
2. **Right-click:** `start_backend.ps1`
3. **Select:** "Run with PowerShell"

---

## ✅ After Backend Starts:

- ✅ Both error messages will disappear
- ✅ Auto-save will work automatically
- ✅ Signup/Login will work
- ✅ All features will work normally

---

## ⚠️ Important:

- **Keep the backend window open** while using the app
- **Don't close the Command Prompt window** where backend is running
- If you close it, the backend stops and errors will return

---

## 🔍 Verify Backend is Running:

Open this in your browser: **http://localhost:8000/health**

You should see: `{"status":"healthy"}`

---

## 🛑 To Stop Backend:

Press `Ctrl + C` in the Command Prompt window
