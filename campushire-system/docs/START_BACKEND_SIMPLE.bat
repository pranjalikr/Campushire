@echo off
echo ========================================
echo Starting Backend Server
echo ========================================
echo.

cd /d "%~dp0backend"

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo Starting FastAPI server...
echo.
echo The server will be available at: http://localhost:8000
echo API docs at: http://localhost:8000/docs
echo.
echo Profile API Endpoints:
echo   GET  /api/v1/users/me
echo   PUT  /api/v1/users/me
echo   GET  /api/v1/users/profile-completion
echo.
echo Supported Profile Fields:
echo   - full_name (required)
echo   - linkedin_id
echo   - github_id
echo   - college_name
echo   - branch
echo   - bio
echo.
echo Press Ctrl+C to stop the server
echo.

set PYTHONIOENCODING=utf-8
set PYTHONUTF8=1
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000

pause
