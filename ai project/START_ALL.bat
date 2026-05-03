@echo off
echo ========================================
echo Starting CampusHire AI Application
echo ========================================
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "START_BACKEND.bat"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "START_FRONTEND.bat"

echo.
echo ========================================
echo Both servers are starting!
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Open http://localhost:5173 in your browser
echo.
echo Press any key to exit this window...
pause >nul
