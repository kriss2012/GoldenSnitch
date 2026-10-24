"""Golden Snitch / ScoutGrid - 1-Click Platform Launcher.
Automatically activates the project virtualenv and starts Uvicorn.
"""
import os, sys, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
VENV_PY = ROOT / ".venv" / "Scripts" / "python.exe"
GLOBAL_PY = sys.executable

def main():
    print("=" * 65)
    print("   GOLDEN SNITCH - ESPORTS SCOUTING & MULTI-ROSTER PLATFORM")
    print("   Problem Statement 4: Esports Scouting & Multi-Roster Intelligence")
    print("   Team: Logic Legend | Version: 2.0.0")
    print("=" * 65)
    
    # Choose Python executable
    py_bin = str(VENV_PY) if VENV_PY.exists() else GLOBAL_PY
    print(f"[*] Python Interpreter : {py_bin}")
    print(f"[*] Workspace Root     : {ROOT}")
    print(f"[*] Full-Stack Server  : http://localhost:8000/ (React App + API)")
    print(f"[*] Interactive API    : http://localhost:8000/docs")
    print(f"[*] Vite Dev Mode      : cd frontend && npm run dev (http://localhost:5173/)")
    print("=" * 65)
    print("Demo Accounts:")
    print(" - Maya Lin (GM)           : username 'maya'  / password 'admin123'")
    print(" - Dev Sharma (Head Coach) : username 'dev'   / password 'coach123'")
    print(" - Arjun Patel (Scout)     : username 'arjun' / password 'scout123'")
    print("=" * 65)
    print("\nPress Ctrl+C to stop server.\n")

    cmd = [py_bin, "-m", "uvicorn", "backend.app.main:app", "--reload", "--port", "8000"]
    try:
        subprocess.run(cmd, cwd=str(ROOT))
    except KeyboardInterrupt:
        print("\n[!] Server stopped cleanly.")

if __name__ == "__main__":
    main()
