@echo off
echo ========================================
echo Starting CampusHire AI - Backend and Frontend
echo ========================================
echo.
echo This will open 2 separate windows:
echo   1. Backend Server (port 8000)
echo   2. Frontend Server (port 5173)
echo.
echo Press any key to start...
pause >nul

echo.
echo Starting Backend Server...
start "CampusHire Backend" cmd /k "cd /d %~dp0backend && venv\Scripts\activate && python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start "CampusHire Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================
echo Both servers are starting in separate windows!
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Open http://localhost:5173 in your browser
echo.
echo Press any key to close this window...
pause >nul
