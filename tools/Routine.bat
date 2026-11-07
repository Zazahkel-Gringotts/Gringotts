@echo off
chcp 65001 >nul
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Gringotts-Sync.ps1" -Once
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Gringotts-Sync.ps1" -Prices
echo.
pause
