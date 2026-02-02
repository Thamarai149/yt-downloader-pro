@echo off
echo Installing YT Downloader Pro dependencies...
echo.

echo Installing root dependencies...
npm install

echo.
echo Installing backend dependencies...
cd backend
npm install

echo.
echo Installing frontend dependencies...
cd ../frontend
npm install

echo.
echo Installation complete!
echo.
echo To start the application:
echo 1. Run "npm run dev" from the root directory
echo 2. Or run backend and frontend separately:
echo    - Backend: cd backend && npm run dev
echo    - Frontend: cd frontend && npm run dev
echo.
pause