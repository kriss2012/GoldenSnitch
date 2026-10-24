"""Golden Snitch / ScoutGrid - SQLite Zero-Downtime Backup Utility
Uses Python's native sqlite3 online backup API to take consistent snapshots
of the live production database without table locking or service interruption.
"""
import os
import sqlite3
import sys
import time
from pathlib import Path

def backup_database(source_path: str = "./data/scoutgrid.db", backup_dir: str = "./backups"):
    source = Path(source_path).resolve()
    if not source.exists():
        print(f"[ERROR] Source database not found at {source}")
        sys.exit(1)

    backup_folder = Path(backup_dir).resolve()
    backup_folder.mkdir(parents=True, exist_ok=True)

    timestamp = time.strftime("%Y%m%d_%H%M%S")
    dest_path = backup_folder / f"scoutgrid_backup_{timestamp}.db"

    print(f"[*] Starting online backup of {source} -> {dest_path}...")
    source_conn = sqlite3.connect(str(source))
    dest_conn = sqlite3.connect(str(dest_path))

    try:
        with dest_conn:
            source_conn.backup(dest_conn, pages=100)
        size_kb = dest_path.stat().st_size / 1024
        print(f"[+] Backup completed successfully: {dest_path.name} ({size_kb:.2f} KB)")
    except Exception as e:
        print(f"[ERROR] Backup failed: {e}")
        sys.exit(1)
    finally:
        source_conn.close()
        dest_conn.close()

if __name__ == "__main__":
    db_path = os.environ.get("SCOUTGRID_DB", "./data/scoutgrid.db")
    backup_database(source_path=db_path)
