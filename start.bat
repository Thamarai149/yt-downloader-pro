@echo off
echo Starting YT Downloader Pro...
echo.

REM Check if yt-dlp is installed
yt-dlp --version >nul 2>&1
if %errorlevel% neq 0 (
    echo yt-dlp is not installed. Running setup...
    call setup-ytdlp.bat
    if %errorlevel% neq 0 (
        echo Setup failed. Please install yt-dlp manually.
        pause
        exit /b 1
    )
)

echo yt-dlp found. Starting application...
echo.

REM Start the application
start "Backend Server" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause >nul