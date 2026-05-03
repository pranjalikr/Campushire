# Login Issues - Comprehensive Fix Guide

## Current Status Check

### ✅ Backend Status
- Backend is running on `http://localhost:8000`
- Health check endpoint is accessible

### Common Login Issues & Solutions

## Issue 1: "Invalid email or password"

### Possible Causes:
1. **Wrong email or password**
   - Email is case-sensitive
   - Password has extra spaces
   - Caps Lock is on
   - Wrong keyboard layout

2. **Password not set**
   - User signed up but didn't complete password setup
   - Account exists but has no password hash

3. **Account not verified**
   - Email verification not completed

### Solutions:

**Quick Fix - Reset Password:**
1. Click "Forgot Password" on login page
2. Enter your email
3. Check email for OTP (check spam folder)
4. Enter OTP and set new password
5. Try logging in again

**Debug Your Account:**
```bash
cd backend
python debug_login.py your-email@example.com
```

**Test Login:**
```bash
cd backend
python test_login.py your-email@example.com your-password
```

## Issue 2: "No password set for this account"

### Cause:
User account exists but password was never set during signup.

### Solution:
1. Use "Forgot Password" feature
2. Enter your email
3. Complete OTP verification
4. Set a new password
5. Login with new password

## Issue 3: "Account is inactive"

### Cause:
Account has been deactivated in the database.

### Solution:
1. Check database: `is_active = 1` should be true
2. Contact admin to reactivate account
3. Or create a new account

## Issue 4: Network/Connection Errors

### Symptoms:
- "Unable to connect to server"
- "Network Error"
- Request timeout

### Solutions:

1. **Check Backend is Running:**
   ```bash
   # Open browser and go to:
   http://localhost:8000/health
   # Should return: {"status": "healthy"}
   ```

2. **Start Backend:**
   ```bash
   cd backend
   venv\Scripts\activate
   python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
   ```

3. **Check Port 8000:**
   ```bash
   netstat -ano | findstr :8000
   ```

4. **Clear Browser Cache:**
   - Press `Ctrl + Shift + R` to hard refresh
   - Or clear browser cache completely

## Issue 5: CORS Errors

### Symptoms:
- Browser console shows CORS errors
- Login request fails with CORS message

### Solution:
Backend is configured to allow all origins. If you see CORS errors:
1. Check backend CORS configuration in `main.py`
2. Verify frontend URL matches allowed origins
3. Restart backend server

## Issue 6: Token Issues

### Symptoms:
- Login succeeds but immediately redirected to login
- "Unauthorized" errors after login

### Solutions:

1. **Check Token Storage:**
   - Open browser DevTools (F12)
   - Go to Application > Local Storage
   - Check `auth-storage` key exists

2. **Clear Storage and Retry:**
   ```javascript
   // In browser console:
   localStorage.clear()
   // Then try logging in again
   ```

3. **Check Token Expiration:**
   - Default token expiration: 30 minutes
   - If expired, login again

## Diagnostic Tools

### 1. Check User Account Status
```bash
cd backend
python debug_login.py your-email@example.com
```

### 2. Test Login API
```bash
cd backend
python test_login.py your-email@example.com your-password
```

### 3. Check Database Users
```bash
cd backend
python -c "import sqlite3; conn = sqlite3.connect('campushire.db'); cursor = conn.cursor(); cursor.execute('SELECT email, is_active, is_verified FROM users'); print(cursor.fetchall()); conn.close()"
```

### 4. Test Backend Health
```bash
curl http://localhost:8000/health
# Or open in browser: http://localhost:8000/health
```

## Step-by-Step Troubleshooting

### Step 1: Verify Backend
```bash
# Check if backend is running
curl http://localhost:8000/health

# If not running, start it:
cd backend
venv\Scripts\activate
python -m uvicorn main:app --reload
```

### Step 2: Check Your Account
```bash
cd backend
python debug_login.py your-email@example.com
```

### Step 3: Test Login
```bash
cd backend
python test_login.py your-email@example.com your-password
```

### Step 4: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Try logging in
4. Check for error messages

### Step 5: Check Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try logging in
4. Check `/api/v1/auth/login` request
5. Look at Request/Response details

## Quick Fix Checklist

- [ ] Backend is running (`http://localhost:8000/health` works)
- [ ] Email is spelled correctly (case-sensitive)
- [ ] Password has no extra spaces
- [ ] Caps Lock is off
- [ ] Account exists in database
- [ ] Account is active (`is_active = 1`)
- [ ] Account is verified (`is_verified = 1`)
- [ ] Password is set (`hashed_password` exists)
- [ ] Browser cache cleared (Ctrl + Shift + R)
- [ ] No CORS errors in console
- [ ] Token is stored in localStorage

## Still Having Issues?

1. **Check Backend Logs:**
   - Look at the backend console window
   - Check for error messages when you try to log in

2. **Check Frontend Logs:**
   - Open browser console (F12)
   - Check for JavaScript errors

3. **Verify Database:**
   ```bash
   cd backend
   python -c "import sqlite3; conn = sqlite3.connect('campushire.db'); cursor = conn.cursor(); cursor.execute('SELECT email, is_active, is_verified, CASE WHEN hashed_password IS NULL THEN 0 ELSE 1 END FROM users WHERE email = ?', ('your-email@example.com',)); print(cursor.fetchone()); conn.close()"
   ```

4. **Try Password Reset:**
   - Use "Forgot Password" feature
   - Set a new password
   - Try logging in again

---

**Most Common Solution:** Use "Forgot Password" to reset your password. This fixes 80% of login issues.
