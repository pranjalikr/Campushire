# Quick Login Fix Guide

## 🚨 If You Can't Login Right Now

### Immediate Steps:

1. **Clear Browser Cache**
   - Press `Ctrl + Shift + R` (Windows/Linux)
   - Or `Cmd + Shift + R` (Mac)
   - This refreshes the page and clears cached errors

2. **Check Backend is Running**
   - Open: `http://localhost:8000/health`
   - Should show: `{"status": "healthy"}`
   - If not, start backend:
     ```bash
     cd backend
     venv\Scripts\activate
     python -m uvicorn main:app --reload
     ```

3. **Try "Forgot Password"**
   - Click "Forgot Password" on login page
   - Enter your email
   - Check email for OTP
   - Set new password
   - Try logging in again

---

## 🔍 Common Issues & Quick Fixes

### Issue: "Invalid email or password"

**Check These:**
- ✅ Email spelling (emails are case-sensitive)
- ✅ No extra spaces before/after email or password
- ✅ Caps Lock is OFF
- ✅ Password is correct (try typing it in a text editor first to verify)

**Fix:**
1. Use "Forgot Password" to reset
2. Or verify your credentials are correct

---

### Issue: "Network Error" or "Cannot connect"

**Check:**
- Backend window is open and running
- No errors in backend console
- Port 8000 is not blocked

**Fix:**
1. Restart backend server
2. Check `http://localhost:8000/health` works
3. Refresh browser (Ctrl + Shift + R)

---

### Issue: Login succeeds but redirects back to login

**Check:**
- Browser localStorage is working
- No JavaScript errors in console

**Fix:**
1. Clear browser storage:
   - Press F12
   - Go to Application tab
   - Clear Local Storage
   - Try logging in again

---

## 🛠️ Debug Your Account

### Check Account Status:
```bash
cd backend
python debug_login.py your-email@example.com
```

### Test Login:
```bash
cd backend
python test_login.py your-email@example.com your-password
```

---

## ✅ Current System Status

- **Backend:** ✅ Running on port 8000
- **Database:** ✅ 3 users with passwords set
- **All Accounts:** ✅ Active and Verified

**Available Accounts:**
- tejalharibabu0@gmail.com
- aryan.gt77@gmail.com  
- aadkar240@gmail.com

---

## 📝 Step-by-Step Login Process

1. **Open Login Page**
   - Go to: `http://localhost:5173/auth`
   - Click "Login" tab if on signup page

2. **Enter Credentials**
   - Email: Your exact email (case-sensitive)
   - Password: Your password (no spaces)

3. **Click Login**
   - Wait for response
   - Check for error messages

4. **If Error Occurs:**
   - Read the error message carefully
   - Try "Forgot Password" if password might be wrong
   - Check browser console (F12) for details

---

## 🆘 Still Not Working?

1. **Check Browser Console:**
   - Press F12
   - Go to Console tab
   - Look for red error messages
   - Take a screenshot

2. **Check Network Tab:**
   - Press F12
   - Go to Network tab
   - Try logging in
   - Click on `/api/v1/auth/login` request
   - Check Status Code and Response

3. **Check Backend Logs:**
   - Look at backend console window
   - Check for error messages
   - Note any exceptions

4. **Try Password Reset:**
   - This fixes most login issues
   - Use "Forgot Password" feature
   - Set a new password
   - Try logging in again

---

## 💡 Pro Tips

- **Always use "Forgot Password"** if you're unsure about your password
- **Check spam folder** for OTP emails
- **Clear browser cache** if seeing old errors
- **Restart backend** if connection issues persist
- **Use debug tools** to check account status

---

**Most Common Solution:** Use "Forgot Password" → Set New Password → Login

This fixes 90% of login issues!
