@echo off
echo ===================================================
echo   Starting UPI Fraud Detection System v2.0.0
echo ===================================================

echo.
echo Starting Python ML sidecar and Node.js Backend + React Frontend...
echo Port: 5000

echo Launching ML sidecar on port 8000...
start "ML Sidecar" cmd /k "cd /d %~dp0ml_service && python main.py"

echo Starting Node.js backend and frontend in this window...
npm run dev

echo.
echo Application stopped.
pause
