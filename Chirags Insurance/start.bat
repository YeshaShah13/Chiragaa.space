@echo off
echo Starting Chirag's Insurance Application...

echo Starting Laravel Backend...
start "Backend Server" cmd /c "cd backend && php artisan serve"

echo Starting Next.js Frontend...
start "Frontend Server" cmd /c "cd frontend && npm run dev"

echo Both servers have been launched in separate windows.
pause
