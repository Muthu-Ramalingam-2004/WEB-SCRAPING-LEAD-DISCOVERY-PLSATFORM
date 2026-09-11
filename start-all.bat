@echo off
echo ========================================================
echo   Starting Lead Discovery Platform (Backend + Frontend)
echo ========================================================
start "Lead Discovery Backend API" cmd /k "%~dp0start-backend.bat"
start "Lead Discovery Frontend UI" cmd /k "%~dp0start-frontend.bat"
