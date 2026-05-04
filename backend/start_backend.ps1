# Backend Server Startup Script
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "STARTING CAMPUSHIRE BACKEND SERVER" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Change to backend directory
Set-Location "$PSScriptRoot"

# Check if virtual environment exists
if (Test-Path "venv\Scripts\activate.ps1") {
    Write-Host "Activating virtual environment..." -ForegroundColor Cyan
    & "venv\Scripts\activate.ps1"
} else {
    Write-Host "Warning: Virtual environment not found!" -ForegroundColor Yellow
    Write-Host "Creating virtual environment..." -ForegroundColor Cyan
    python -m venv venv
    & "venv\Scripts\activate.ps1"
    Write-Host "Installing dependencies..." -ForegroundColor Cyan
    pip install -r requirements.txt
}

Write-Host "`nStarting backend server on http://localhost:8000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server`n" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Green

# Start the server
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
