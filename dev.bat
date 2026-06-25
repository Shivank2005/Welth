@echo off
title Welth Development Server Launcher
cls
echo =====================================================================
echo                WELTH DEVELOPMENT SERVER LAUNCHER
echo =====================================================================
echo.

:: Check for running node.exe processes and terminate them to release file locks
echo [+] Stopping any stale Node.js / Next.js processes to release locks...
taskkill /f /im node.exe >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo     [v] Terminated active node processes successfully.
) else (
    echo     [.] No active node processes were found.
)

:: Clean Next.js build cache to prevent EPERM/access permission issues
echo.
echo [+] Cleaning .next build cache...
if exist .next (
    rmdir /s /q .next >nul 2>&1
    if exist .next (
        echo     [!] Warning: Could not delete .next folder. Some files may still be locked.
    ) else (
        echo     [v] .next directory cleaned successfully.
    )
) else (
    echo     [.] No existing .next cache directory found.
)

:: Run the development server
echo.
echo [+] Launching dev server (with database schema sync)...
echo ---------------------------------------------------------------------
npm run dev

pause
