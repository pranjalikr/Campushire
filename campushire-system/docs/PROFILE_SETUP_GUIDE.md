# Profile Page Setup Guide

## ✅ Backend Configuration Complete

All backend components are properly configured:

### Database Schema ✓
- ✅ `full_name` (required)
- ✅ `linkedin_id`
- ✅ `github_id`
- ✅ `college_name`
- ✅ `branch`
- ✅ `bio` (TEXT field for long-form content)

### API Endpoints ✓
- ✅ `GET /api/v1/users/me` - Get current user profile
- ✅ `PUT /api/v1/users/me` - Update user profile
- ✅ `GET /api/v1/users/profile-completion` - Get profile completion status

### Frontend Configuration ✓
- ✅ Profile page component (`ProfilePage.tsx`)
- ✅ API client configured (`api/users.ts`)
- ✅ All form fields implemented
- ✅ Error handling and loading states

---

## 🚀 How to Start the Backend

### Option 1: Use the Batch File (Recommended)
1. **Double-click** `START_BACKEND.bat` in the project root folder
2. A window will open showing the backend starting
3. Wait until you see: `INFO: Uvicorn running on http://127.0.0.1:8000`
4. **Keep this window open**

### Option 2: Manual Start (Command Prompt)
1. Open Command Prompt (Windows Key + R, type `cmd`, press Enter)
2. Run these commands **one by one**:
```cmd
cd "C:\Users\tejuu\OneDrive\Desktop\ai project\backend"

venv\Scripts\activate

python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### Option 3: PowerShell
1. Open PowerShell
2. Navigate to backend folder:
```powershell
cd "C:\Users\tejuu\OneDrive\Desktop\ai project\backend"
```
3. Activate virtual environment:
```powershell
.\venv\Scripts\Activate.ps1
```
4. Start server:
```powershell
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

---

## ✅ Verify Backend is Running

1. Open your browser and go to: `http://localhost:8000/health`
2. You should see: `{"status": "healthy"}`
3. Or check API docs at: `http://localhost:8000/docs`

---

## 📝 Profile Fields Available

All these fields can be edited and saved:

1. **Full Name** (required)
   - Display name for your profile

2. **LinkedIn ID**
   - Your LinkedIn profile identifier
   - Example: `john-doe` or `in/johndoe`

3. **GitHub ID**
   - Your GitHub username
   - Example: `johndoe`

4. **College Name**
   - Your university/college name
   - Example: `MIT`, `Stanford University`, `IIT Delhi`

5. **Branch**
   - Your field of study
   - Example: `Computer Science`, `Electrical Engineering`

6. **Bio / About Me**
   - Large textarea for detailed information
   - No character limit
   - Can include interests, skills, achievements, goals, etc.

---

## 🔧 Troubleshooting

### Backend Won't Start

**Error: "Module not found"**
```cmd
cd backend
venv\Scripts\activate
pip install -r requirements.txt
```

**Error: "Port 8000 already in use"**
```cmd
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F
```
Then try starting again.

**Error: "Database locked"**
- Close any other programs accessing the database
- Restart the backend server

### Frontend Shows "Network Error"

1. **Check backend is running:**
   - Open `http://localhost:8000/health` in browser
   - Should show `{"status": "healthy"}`

2. **Check backend window:**
   - Look for any error messages
   - Should see: `INFO: Uvicorn running on http://127.0.0.1:8000`

3. **Refresh browser:**
   - Press `Ctrl + Shift + R` to hard refresh
   - Or close and reopen the browser

4. **Check CORS:**
   - Backend is configured to allow all origins
   - If issues persist, check browser console (F12)

### Profile Fields Not Saving

1. **Check authentication:**
   - Make sure you're logged in
   - Check browser console for 401 errors

2. **Check backend logs:**
   - Look at the backend window for error messages
   - Check for validation errors

3. **Verify database:**
   - Database should exist at `backend/campushire.db`
   - All columns should be present (verified automatically)

---

## 📍 File Locations

### Backend Files
- **Main app**: `backend/main.py`
- **User model**: `backend/app/db/models.py`
- **User API**: `backend/app/api/v1/users.py`
- **User schemas**: `backend/app/schemas/user.py`
- **Database**: `backend/campushire.db`

### Frontend Files
- **Profile page**: `frontend/src/pages/ProfilePage.tsx`
- **User API client**: `frontend/src/api/users.ts`
- **API client config**: `frontend/src/api/client.ts`

---

## ✨ Next Steps

1. **Start the backend** using one of the methods above
2. **Start the frontend** (if not already running):
   ```cmd
   cd frontend
   npm run dev
   ```
3. **Open browser** and navigate to: `http://localhost:5173/profile`
4. **Edit your profile** - all fields are editable and will save automatically

---

## 🎯 Summary

✅ Database schema configured with all fields
✅ Backend API endpoints ready
✅ Frontend profile page implemented
✅ Error handling configured
✅ All profile fields editable and saveable

**Just start the backend server and refresh your browser!**
