@echo off
echo Starting ПРОТОКОЛ: ПЕРЕЗАПУСК...
cd /d "%~dp0"
npm run build
node server\dist\server\src\index.js
pause
