@echo off
cd /d "%~dp0FETadr"
if not exist package.json (
  echo Khong thay thu muc FETadr.
  pause
  exit /b 1
)
echo Mo server cong 4000 va trang web cong 5173.
echo Dong tung cua so den de tat.
start "TADR server" cmd /k "npm run server"
start "TADR web" cmd /k "npm run dev"
