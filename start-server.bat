@echo off
echo ============================================
echo   房地产行业分析报告平台
echo ============================================
echo.
echo [1/2] Starting server on port 3001...
start "ReportPlatform-Server" cmd /c "cd /d %~dp0packages\server && npx tsx src/index.ts"
timeout /t 6 /nobreak >nul

echo [2/2] Starting public tunnel...
start "ReportPlatform-Tunnel" cmd /c "ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -R 80:127.0.0.1:3001 nokey@localhost.run"
timeout /t 10 /nobreak >nul

echo.
echo ============================================
echo   Platform is running!
echo   Check the tunnel window for the URL
echo   (looks like: https://xxxx.lhr.life)
echo ============================================
echo.
echo Keep this window open. Press any key to stop.
pause
taskkill /FI "WINDOWTITLE eq ReportPlatform-*" /T /F >nul 2>&1
