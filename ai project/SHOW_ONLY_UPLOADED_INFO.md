# Show Only Uploaded Information

## ✅ Changes Made

### Backend: Removed Auto-Population from User Profile

**File**: `backend/app/api/v1/experiences.py`

**What Changed**:
- Removed the auto-population logic that was falling back to user profile data
- Now the backend **only uses information explicitly provided in the experience form**
- This ensures that displayed experiences show only what was uploaded, not auto-populated data

**Before**:
```python
# Auto-populated from user profile if empty
if not experience_data.get('full_name'):
    experience_data['full_name'] = current_user.full_name
```

**After**:
```python
# Only use what's in the request - no fallback to user profile
experience_data = request.model_dump()
# Validate required fields are present
```

### Frontend: Still Auto-Populates Form (Good UX)

The frontend still auto-populates the form fields from the user profile for convenience, but:
- Users can see and edit these values before submitting
- Only what's in the form gets sent to the backend
- The backend no longer falls back to user profile data

## 🎯 Result

Now when an experience is displayed:
- ✅ Shows **only the information that was uploaded** in the experience form
- ✅ Does **not** show auto-populated data from user profile (unless user explicitly kept it)
- ✅ Users can edit auto-populated values before submitting
- ✅ Backend validates that all required fields are provided in the request

## 🚀 Next Steps

1. **Restart the backend** to apply changes:
   ```cmd
   cd "C:\Users\tejuu\OneDrive\Desktop\ai project\backend"
   venv\Scripts\activate
   python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
   ```

2. **Test the experience upload**:
   - Create a new experience
   - The form will auto-populate from your profile (for convenience)
   - Edit any fields if needed
   - Submit the experience
   - The displayed experience will show only what you uploaded/kept in the form

## 📝 Notes

- The form still auto-populates for better user experience (users don't have to re-enter their info)
- But users can edit these values, and only their final values are saved
- The backend no longer has a "fallback" to user profile - it only uses what's in the request
