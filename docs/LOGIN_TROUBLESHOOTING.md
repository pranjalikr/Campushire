# Login Troubleshooting Guide

## "Invalid email or password" Error

If you're seeing "Invalid email or password" when trying to log in, here are the steps to resolve it:

### Step 1: Verify Your Email

Make sure you're using the **exact email address** you used during signup. Email addresses are case-sensitive in some systems.

**Check available users:**
```bash
cd backend
python debug_login.py <your-email>
```

### Step 2: Check Your Password

1. **Password Requirements:**
   - Minimum 6 characters
   - Case-sensitive
   - No special character requirements

2. **Common Issues:**
   - Extra spaces before/after password
   - Caps Lock is on
   - Wrong keyboard layout
   - Password was changed but you're using old password

### Step 3: Verify Account Status

Your account must be:
- ✅ **Active** (`is_active = True`)
- ✅ **Verified** (`is_verified = True`)
- ✅ **Has a password set** (`hashed_password` exists)

### Step 4: Debug Your Account

Run the debug script to check your account:

```bash
cd backend
python debug_login.py <your-email>
```

To test password:
```bash
python debug_login.py <your-email> <your-password>
```

### Step 5: Reset Your Password

If you've forgotten your password or it's not working:

1. **Use Forgot Password:**
   - Click "Forgot Password" on the login page
   - Enter your email
   - Check your email for OTP
   - Enter OTP and new password

2. **Or Create a New Account:**
   - Sign up with a different email
   - Complete the OTP verification
   - Set your password

### Step 6: Check Backend Logs

If the issue persists, check the backend console window for errors:

1. Look at the backend PowerShell/Command Prompt window
2. Check for any error messages when you try to log in
3. Common errors:
   - Database connection issues
   - Password hashing errors
   - User not found

### Step 7: Verify Backend is Running

Make sure the backend server is running:

1. Check `http://localhost:8000/health` in your browser
2. Should return: `{"status": "healthy"}`
3. If not running, start it:
   ```bash
   cd backend
   venv\Scripts\activate
   python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
   ```

## Common Solutions

### Solution 1: Account Not Verified
**Problem:** You signed up but didn't complete email verification.

**Fix:** 
- Complete the signup process
- Verify OTP
- Set your password during signup

### Solution 2: Password Never Set
**Problem:** You verified OTP but didn't set a password.

**Fix:**
- Use "Forgot Password" to set a new password
- Or complete signup with password

### Solution 3: Password Encoding Issue
**Problem:** Password was hashed incorrectly during signup.

**Fix:**
- Use "Forgot Password" to reset
- Set a new password (this will re-hash correctly)

### Solution 4: Account Inactive
**Problem:** Account was deactivated.

**Fix:**
- Contact admin or create a new account

## Testing Login

To test if login works:

1. **Use Debug Script:**
   ```bash
   cd backend
   python debug_login.py tejalharibabu0@gmail.com yourpassword
   ```

2. **Check API Directly:**
   ```bash
   curl -X POST http://localhost:8000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "your-email@example.com", "password": "your-password"}'
   ```

## Still Having Issues?

1. **Check Browser Console:**
   - Press F12
   - Go to Console tab
   - Look for error messages

2. **Check Network Tab:**
   - Press F12
   - Go to Network tab
   - Try logging in
   - Check the `/api/v1/auth/login` request
   - Look at the response for error details

3. **Verify Database:**
   ```bash
   cd backend
   python -c "import sqlite3; conn = sqlite3.connect('campushire.db'); cursor = conn.cursor(); cursor.execute('SELECT email, is_active, is_verified FROM users WHERE email = ?', ('your-email@example.com',)); print(cursor.fetchone()); conn.close()"
   ```

## Quick Fix: Reset Password

The easiest solution is often to reset your password:

1. Go to login page
2. Click "Forgot Password"
3. Enter your email
4. Check email for OTP
5. Enter OTP and new password
6. Try logging in again

---

**Note:** If you continue having issues, the debug script (`backend/debug_login.py`) will help identify the exact problem.
