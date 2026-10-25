@echo off
setlocal EnableDelayedExpansion

:: ===============================================================================
::  SCOUTGRID / GOLDEN SNITCH - FULL-STACK DEV LAUNCHER
::  Problem Statement 4: Esports Scouting & Multi-Roster Intelligence Platform
:: ===============================================================================

title ScoutGrid - Platform Launcher
color 0E

:: Set and normalize root workspace directory (handles spaces in path)
cd /d "%~dp0"
set "ROOT_DIR=%~dp0"
if "%ROOT_DIR:~-1%"=="\" set "ROOT_DIR=%ROOT_DIR:~0,-1%"
set "FRONTEND_DIR=%ROOT_DIR%\frontend"
set "BACKEND_DIR=%ROOT_DIR%\backend"

:: Parse command-line argument if provided
set "CLI_ARG=%~1"
if /i "%CLI_ARG%"=="backend"  goto DO_START_BACKEND
if /i "%CLI_ARG%"=="frontend" goto DO_START_FRONTEND
if /i "%CLI_ARG%"=="both"     goto DO_START_BOTH
if /i "%CLI_ARG%"=="stop"     goto DO_STOP_ALL
if /i "%CLI_ARG%"=="install"  goto DO_INSTALL_ALL
if /i "%CLI_ARG%"=="test"     goto DO_RUN_TESTS

:MAIN_MENU
cls
echo ===============================================================================
echo     SCOUTGRID / GOLDEN SNITCH - FULL-STACK PLATFORM LAUNCHER
echo     AI Esports Scouting ^& Multi-Roster Intelligence Platform [v2.0]
echo ===============================================================================
echo.
echo   Root Workspace : "%ROOT_DIR%"
echo.

:: ---------------------------------------------------------------------------
:: 1. Preflight Diagnostics
:: ---------------------------------------------------------------------------
echo [*] Preflight System Check:
echo -------------------------------------------------------------------------------

:: Check Python
set "PYTHON_EXE="
if exist "%ROOT_DIR%\.venv\Scripts\python.exe" (
    set "PYTHON_EXE=%ROOT_DIR%\.venv\Scripts\python.exe"
    echo   [OK] Python Virtualenv  : Found [.venv\Scripts\python.exe]
) else if exist "%ROOT_DIR%\venv\Scripts\python.exe" (
    set "PYTHON_EXE=%ROOT_DIR%\venv\Scripts\python.exe"
    echo   [OK] Python Virtualenv  : Found [venv\Scripts\python.exe]
) else (
    where python >nul 2>nul
    if !ERRORLEVEL! equ 0 (
        set "PYTHON_EXE=python"
        echo   [!]  Python Virtualenv  : Missing. Using Global System Python.
    ) else (
        echo   [X]  Python             : NOT FOUND. Please install Python 3.10+.
    )
)

:: Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% equ 0 (
    for /f "tokens=*" %%v in ('node -v 2^>nul') do set "NODE_VER=%%v"
    echo   [OK] Node.js Runtime    : !NODE_VER!
) else (
    echo   [X]  Node.js            : NOT FOUND. Please install Node.js from https://nodejs.org
)

:: Check npm
where npm >nul 2>nul
if %ERRORLEVEL% equ 0 (
    for /f "tokens=*" %%v in ('npm -v 2^>nul') do set "NPM_VER=%%v"
    echo   [OK] Node Package Mgr   : npm !NPM_VER!
) else (
    echo   [X]  npm                : NOT FOUND.
)

:: Check Frontend packages
if exist "%FRONTEND_DIR%\node_modules" (
    echo   [OK] Frontend Packages  : node_modules verified
) else (
    echo   [!]  Frontend Packages  : node_modules MISSING. [Run option 5 to install]
)

:: Check .env
if exist "%ROOT_DIR%\.env" (
    echo   [OK] Configuration      : .env exists
) else if exist "%ROOT_DIR%\.env.example" (
    copy "%ROOT_DIR%\.env.example" "%ROOT_DIR%\.env" >nul
    echo   [OK] Configuration      : Created .env from .env.example
) else (
    echo   [!]  Configuration      : No .env found
)

:: Check SQLite DB
if exist "%ROOT_DIR%\scoutgrid.db" (
    echo   [OK] Database           : scoutgrid.db present
) else (
    echo   [INFO] Database         : scoutgrid.db will auto-initialize on backend start
)

echo -------------------------------------------------------------------------------
echo.
echo   LAUNCH OPTIONS:
echo   =============================================================================
echo     [1] Start Both Frontend + Backend [Recommended Full-Stack]
echo     [2] Start Backend Only   [FastAPI - Port 8000]
echo     [3] Start Frontend Only  [Vite Dev Server - Port 5173]
echo     [4] Open Web App and API Docs in Browser
echo     [5] Install / Repair Dependencies [pip requirements + npm install]
echo     [6] Run Full Test Suite [pytest + frontend verification]
echo     [7] Stop / Kill Any Running Servers [Free ports 8000 ^& 5173]
echo     [0] Exit
echo   =============================================================================
echo.
set /p MENU_CHOICE="Select an option [0-7] (Press ENTER for [1]): "

if "%MENU_CHOICE%"=="" goto DO_START_BOTH
if "%MENU_CHOICE%"=="1" goto DO_START_BOTH
if "%MENU_CHOICE%"=="2" goto DO_START_BACKEND
if "%MENU_CHOICE%"=="3" goto DO_START_FRONTEND
if "%MENU_CHOICE%"=="4" goto DO_OPEN_BROWSER
if "%MENU_CHOICE%"=="5" goto DO_INSTALL_ALL
if "%MENU_CHOICE%"=="6" goto DO_RUN_TESTS
if "%MENU_CHOICE%"=="7" goto DO_STOP_ALL
if "%MENU_CHOICE%"=="0" goto DO_EXIT

echo Invalid selection. Please choose a valid number.
ping -n 3 127.0.0.1 >nul
goto MAIN_MENU


:: ===============================================================================
::  ACTIONS
:: ===============================================================================

:DO_START_BOTH
cls
echo ===============================================================================
echo     STARTING SCOUTGRID FULL-STACK PLATFORM [FRONTEND + BACKEND]
echo ===============================================================================
echo.

if "%PYTHON_EXE%"=="" (
    echo [ERROR] Cannot start backend because Python is not available.
    pause
    goto MAIN_MENU
)

where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Cannot start frontend because npm is not available.
    pause
    goto MAIN_MENU
)

if not exist "%FRONTEND_DIR%\node_modules" (
    echo [*] Frontend dependencies missing. Installing npm packages first...
    cd /d "%FRONTEND_DIR%"
    call npm install
    cd /d "%ROOT_DIR%"
)

:: Free ports if already occupied to avoid silent collision
echo [*] Checking for existing instances on ports 8000 and 5173...
call :KILL_PORT 8000
call :KILL_PORT 5173

echo.
echo [*] Spawning FastAPI Backend on Port 8000...
start "ScoutGrid - Backend API [8000]" cmd /k "cd /d "%ROOT_DIR%" && title [ScoutGrid] Backend API - Port 8000 && color 0A && echo =================================================================== && echo    SCOUTGRID BACKEND API [FastAPI + Uvicorn] && echo    Local: http://localhost:8000  ^|  Interactive Docs: http://localhost:8000/docs && echo =================================================================== && echo. && "%PYTHON_EXE%" -m uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000"

echo [*] Waiting 2 seconds for backend initialization...
ping -n 3 127.0.0.1 >nul

echo [*] Spawning Vite Frontend Dev Server on Port 5173...
start "ScoutGrid - Frontend [5173]" cmd /k "cd /d "%FRONTEND_DIR%" && title [ScoutGrid] Frontend Dev Server - Port 5173 && color 0B && echo =================================================================== && echo    SCOUTGRID FRONTEND [Vite + React + Tailwind] && echo    Local App: http://localhost:5173/ && echo =================================================================== && echo. && npm run dev"

echo.
echo [*] Both servers launched in separate managed windows.
ping -n 3 127.0.0.1 >nul
goto DASHBOARD


:DO_START_BACKEND
cls
echo ===============================================================================
echo     STARTING BACKEND API ONLY [FASTAPI]
echo ===============================================================================
echo.
if "%PYTHON_EXE%"=="" (
    echo [ERROR] Python not found.
    pause
    goto MAIN_MENU
)
call :KILL_PORT 8000
start "ScoutGrid - Backend API [8000]" cmd /k "cd /d "%ROOT_DIR%" && title [ScoutGrid] Backend API - Port 8000 && color 0A && echo =================================================================== && echo    SCOUTGRID BACKEND API [FastAPI] && echo    Local: http://localhost:8000  ^|  Docs: http://localhost:8000/docs && echo =================================================================== && echo. && "%PYTHON_EXE%" -m uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000"
echo [*] Backend launched on http://localhost:8000
ping -n 3 127.0.0.1 >nul
goto DASHBOARD


:DO_START_FRONTEND
cls
echo ===============================================================================
echo     STARTING FRONTEND DEV SERVER ONLY [VITE]
echo ===============================================================================
echo.
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm is not found.
    pause
    goto MAIN_MENU
)
if not exist "%FRONTEND_DIR%\node_modules" (
    echo [*] Installing frontend dependencies...
    cd /d "%FRONTEND_DIR%"
    call npm install
    cd /d "%ROOT_DIR%"
)
call :KILL_PORT 5173
start "ScoutGrid - Frontend [5173]" cmd /k "cd /d "%FRONTEND_DIR%" && title [ScoutGrid] Frontend Dev Server - Port 5173 && color 0B && echo =================================================================== && echo    SCOUTGRID FRONTEND DEV SERVER && echo    Local: http://localhost:5173/ && echo =================================================================== && echo. && npm run dev"
echo [*] Frontend launched on http://localhost:5173
ping -n 3 127.0.0.1 >nul
goto DASHBOARD


:DO_OPEN_BROWSER
echo [*] Opening application in default browser...
start "" "http://localhost:5173"
ping -n 2 127.0.0.1 >nul
start "" "http://localhost:8000/docs"
goto DASHBOARD


:DO_INSTALL_ALL
cls
echo ===============================================================================
echo     INSTALLING / UPDATING DEPENDENCIES
echo ===============================================================================
echo.
if exist "%PYTHON_EXE%" (
    echo [*] Updating Python packages in virtualenv...
    "%PYTHON_EXE%" -m pip install --upgrade pip
    if exist "%BACKEND_DIR%\requirements.txt" (
        "%PYTHON_EXE%" -m pip install -r "%BACKEND_DIR%\requirements.txt"
    )
) else (
    echo [!] Python interpreter not available to install packages.
)

echo.
echo [*] Installing Frontend npm packages...
cd /d "%FRONTEND_DIR%"
call npm install
cd /d "%ROOT_DIR%"
echo.
echo [OK] Dependency installation completed.
echo.
pause
goto MAIN_MENU


:DO_RUN_TESTS
cls
echo ===============================================================================
echo     RUNNING TEST SUITE
echo ===============================================================================
echo.
if exist "%PYTHON_EXE%" (
    echo [*] Running Backend Pytest...
    "%PYTHON_EXE%" -m pytest backend/tests/ -v
) else (
    echo [!] Skipping backend tests - Python not found.
)
echo.
echo [*] Running Frontend Verification...
if exist "%FRONTEND_DIR%\scripts\verify-frontend.js" (
    node "%FRONTEND_DIR%\scripts\verify-frontend.js"
) else (
    cd /d "%FRONTEND_DIR%"
    call npx tsc --noEmit
    cd /d "%ROOT_DIR%"
)
echo.
pause
goto MAIN_MENU


:DO_STOP_ALL
cls
echo ===============================================================================
echo     STOPPING SCOUTGRID SERVERS
echo ===============================================================================
echo.
echo [*] Terminating servers on ports 8000 and 5173...
call :KILL_PORT 8000
call :KILL_PORT 5173
echo.
echo [OK] All ScoutGrid server processes stopped.
echo.
if "%CLI_ARG%"=="" (
    pause
    goto MAIN_MENU
)
goto DO_EXIT


:DASHBOARD
cls
echo ===============================================================================
echo     SCOUTGRID LIVE DASHBOARD - SERVERS ACTIVE
echo ===============================================================================
echo.
echo   [FRONTEND WEB APP] : http://localhost:5173/
echo   [BACKEND API ROOT] : http://localhost:8000/
echo   [SWAGGER API DOCS] : http://localhost:8000/docs
echo   [REDOC API SPECS]  : http://localhost:8000/redoc
echo.
echo -------------------------------------------------------------------------------
echo   CONTROLS:
echo     [B] Open Frontend in Browser       [D] Open API Docs in Browser
echo     [R] Restart Both Servers           [S] Stop All Servers
echo     [M] Return to Main Menu            [Q] Quit Launcher
echo -------------------------------------------------------------------------------
echo.

set "DASH_CHOICE="
set /p "DASH_CHOICE=Command [B, D, R, S, M, Q]: "
if "%DASH_CHOICE%"=="" (
    ping -n 3 127.0.0.1 >nul
    goto DASHBOARD
)
if /i "%DASH_CHOICE%"=="B" (
    start "" "http://localhost:5173"
    goto DASHBOARD
)
if /i "%DASH_CHOICE%"=="D" (
    start "" "http://localhost:8000/docs"
    goto DASHBOARD
)
if /i "%DASH_CHOICE%"=="R" (
    goto DO_START_BOTH
)
if /i "%DASH_CHOICE%"=="S" (
    goto DO_STOP_ALL
)
if /i "%DASH_CHOICE%"=="M" (
    goto MAIN_MENU
)
if /i "%DASH_CHOICE%"=="Q" (
    goto DO_EXIT
)
goto DASHBOARD


:KILL_PORT
set "TARGET_PORT=%~1"
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr /r ":%TARGET_PORT% "') do (
    if not "%%a"=="0" (
        echo   [-] Stopping existing process on port %TARGET_PORT% [PID: %%a]...
        taskkill /F /PID %%a >nul 2>nul
    )
)
exit /b 0


:DO_EXIT
cls
echo ===============================================================================
echo     THANK YOU FOR USING SCOUTGRID / GOLDEN SNITCH
echo ===============================================================================
echo.
echo Note: If servers were started in separate windows, they will remain running
echo until you close their respective windows or run option 7 / 'start.bat stop'.
echo.
ping -n 3 127.0.0.1 >nul
exit /b 0
