@echo off
title Golden Snitch - Esports Scouting Platform
echo =================================================================
echo    GOLDEN SNITCH - ESPORTS SCOUTING & MULTI-ROSTER PLATFORM
echo    Problem Statement 4: Esports Scouting & Multi-Roster Intelligence
echo =================================================================
cd /d "%~dp0"
if exist ".venv\Scripts\python.exe" (
    ".venv\Scripts\python.exe" run.py
) else (
    python run.py
)
pause
