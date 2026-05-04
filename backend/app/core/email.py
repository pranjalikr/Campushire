import smtplib
from email.message import EmailMessage
from app.core.config import settings
import random
import string
import time
import sys
import io

# Configure stdout to handle encoding errors gracefully on Windows
if sys.platform == 'win32':
    try:
        # Set environment variable for Python to use UTF-8
        import os
        os.environ['PYTHONIOENCODING'] = 'utf-8'
        # Reconfigure stdout with error handling
        if hasattr(sys.stdout, 'reconfigure'):
            sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        if hasattr(sys.stderr, 'reconfigure'):
            sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except:
        pass

# Safe print function that handles encoding errors
def safe_print(*args, **kwargs):
    """Print function that safely handles encoding errors"""
    try:
        print(*args, **kwargs)
    except UnicodeEncodeError:
        # Convert all arguments to ASCII-safe strings
        safe_args = []
        for arg in args:
            if isinstance(arg, str):
                safe_args.append(arg.encode('ascii', 'ignore').decode('ascii'))
            else:
                safe_args.append(str(arg).encode('ascii', 'ignore').decode('ascii'))
        print(*safe_args, **kwargs)

# Store OTPs temporarily (in production, use Redis)
otp_store = {}
# Store verified emails temporarily (valid for 5 minutes after OTP verification)
verified_emails = {}
# Store verified emails temporarily (valid for 5 minutes after OTP verification)
verified_emails = {}


def generate_otp(length: int = 6) -> str:
    """Generate a random OTP"""
    return ''.join(random.choices(string.digits, k=length))


def send_otp_email(email: str) -> str:
    """Send OTP to user's email via Gmail SMTP - NO console fallback"""
    otp = generate_otp()
    # Store OTP with expiration (1 minute)
    otp_store[email] = {"otp": otp, "expires_at": time.time() + 60}
    
    # Check if SMTP credentials are configured (not placeholder values)
    is_smtp_configured = (
        settings.SMTP_USER != "your-email@gmail.com" and 
        settings.SMTP_PASSWORD != "your-app-password" and
        settings.SMTP_PASSWORD and
        "@" in settings.SMTP_USER  # Basic check for valid email
    )
    
    if not is_smtp_configured:
        raise ValueError(
            "SMTP not configured! Please set SMTP_USER and SMTP_PASSWORD in backend/.env file. "
            "For Gmail, use an App Password (not your regular password)."
        )
    
    # Prepare email message using EmailMessage - Plain text only for better deliverability
    msg = EmailMessage()
    # Subject must include OTP for better deliverability
    msg["Subject"] = f"CampusHire AI - Your OTP is {otp}"
    # Same sender every time (consistent EMAIL_FROM)
    msg["From"] = f"{settings.EMAIL_FROM_NAME} <{settings.EMAIL_FROM}>"
    msg["To"] = email
    
    # Plain text content only - No HTML, No links (better spam avoidance)
    msg.set_content(
        f"""Hello,

Your One-Time Password (OTP) for CampusHire AI is: {otp}

This OTP is valid for 1 minute.
Do not share it with anyone.

If you didn't request this, please ignore this email.

Thank you,
{settings.EMAIL_FROM_NAME}
"""
    )
    
    # Send email - NO FALLBACK TO CONSOLE
    try:
        safe_print(f"\n{'='*60}")
        safe_print(f"Sending OTP email to {email}...")
        safe_print(f"SMTP Host: {settings.SMTP_HOST}:{settings.SMTP_PORT}")
        safe_print(f"From: {settings.EMAIL_FROM_NAME} <{settings.EMAIL_FROM}>")
        safe_print(f"To: {email}")
        safe_print(f"Subject: CampusHire AI - Your OTP is {otp}")
        
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.set_debuglevel(1)  # Enable debug to see SMTP communication
            safe_print(f"Connecting to SMTP server...")
            server.starttls()
            safe_print(f"TLS started successfully")
            safe_print(f"Logging in as {settings.SMTP_USER}...")
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            safe_print(f"SMTP login successful")
            safe_print(f"Sending email message...")
            server.send_message(msg)
            safe_print(f"Email message sent to SMTP server")
        
        safe_print(f"\n{'='*60}")
        safe_print(f"✓ OTP EMAIL SENT SUCCESSFULLY!")
        safe_print(f"{'='*60}")
        safe_print(f"  To: {email}")
        safe_print(f"  From: {settings.EMAIL_FROM_NAME} <{settings.EMAIL_FROM}>")
        safe_print(f"  Subject: CampusHire AI - Your OTP is {otp}")
        safe_print(f"\n{'='*60}")
        safe_print(f"  ⭐ YOUR OTP CODE: {otp} ⭐")
        safe_print(f"{'='*60}")
        safe_print(f"\n  📧 Also check your email inbox!")
        safe_print(f"  📧 Check Spam/Junk folder if not in inbox")
        safe_print(f"  📧 Check Promotions tab (Gmail)")
        safe_print(f"  📧 Check Updates tab (Gmail)")
        safe_print(f"\n{'='*60}\n")
        safe_print(f"\nIMPORTANT: Check the following locations:")
        safe_print(f"1. Inbox folder")
        safe_print(f"2. Spam/Junk folder")
        safe_print(f"3. Promotions tab (Gmail)")
        safe_print(f"4. Updates tab (Gmail)")
        safe_print(f"5. All Mail folder")
        safe_print(f"6. Wait 30-60 seconds for delivery")
        safe_print(f"\nIf still not received, check backend terminal for SMTP errors above.\n")
        
        return otp
        
    except smtplib.SMTPAuthenticationError as e:
        error_msg = str(e).encode('ascii', 'ignore').decode('ascii')
        safe_print(f"\n✗ SMTP Authentication Failed!")
        safe_print(f"Error: {error_msg}")
        safe_print(f"\nCommon causes:")
        safe_print(f"1. Wrong email or App Password in backend/.env")
        safe_print(f"2. Using regular password instead of App Password")
        safe_print(f"3. 2-Step Verification not enabled on Gmail")
        safe_print(f"\nFix: Update SMTP_USER and SMTP_PASSWORD in backend/.env\n")
        raise ValueError(
            "Failed to send email: SMTP authentication error. "
            "Check your Gmail App Password in backend/.env file."
        )
    except Exception as e:
        error_msg = str(e).encode('ascii', 'ignore').decode('ascii')
        safe_print(f"\n✗ Failed to send email!")
        safe_print(f"Error: {error_msg}")
        safe_print(f"Error type: {type(e).__name__}")
        safe_print(f"\nCheck your SMTP settings in backend/.env file\n")
        raise ValueError(
            f"Failed to send email: {error_msg}. "
            "Please check your SMTP configuration in backend/.env"
        )


def verify_otp(email: str, otp: str) -> bool:
    """Verify OTP for email"""
    import time
    stored_data = otp_store.get(email)
    if stored_data:
        stored_otp = stored_data.get("otp") if isinstance(stored_data, dict) else stored_data
        expires_at = stored_data.get("expires_at") if isinstance(stored_data, dict) else None
        
        # Check expiration
        if expires_at and time.time() > expires_at:
            del otp_store[email]
            return False
        
        if stored_otp == otp:
            del otp_store[email]
            return True
    return False

