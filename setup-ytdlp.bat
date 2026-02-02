@echo off
echo Setting up yt-dlp for YouTube Downloader Pro...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python is not installed or not in PATH.
    echo Please install Python from https://python.org
    echo Make sure to check "Add Python to PATH" during installation.
    pause
    exit /b 1
)

echo Python found. Installing yt-dlp...
pip install --upgrade yt-dlp

REM Check if ffmpeg is available
ffmpeg -version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo WARNING: ffmpeg is not installed or not in PATH.
    echo Audio extraction may not work properly.
    echo.
    echo To install ffmpeg:
    echo 1. Download from https://ffmpeg.org/download.html
    echo 2. Extract to a folder (e.g., C:\ffmpeg)
    echo 3. Add the bin folder to your PATH environment variable
    echo.
) else (
    echo ffmpeg found.
)

echo.
echo yt-dlp setup complete!
echo You can now run the YouTube Downloader Pro application.
echo.
pause