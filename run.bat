@echo off
chcp 65001 >nul

echo ===== MQ Ads Master Startup Script =====
echo.

:: 1. Check Node.js
node -v
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found
    pause
    exit /b 1
)
echo [OK] Node.js detected

:: 2. Check dependencies
if not exist "node_modules" (
    echo [ERROR] node_modules not found. Please run 'npm install' or 'pnpm install' first
    pause
    exit /b 1
)
echo [OK] Dependencies installed

:: 3. Try pnpm first, fallback to npm
where pnpm >nul 2>nul
if %errorlevel% equ 0 (
    set "PKG_CMD=pnpm"
) else (
    set "PKG_CMD=npm"
)

:: 4. Start dev server
echo [START] Starting dev server...
%PKG_CMD% run dev
