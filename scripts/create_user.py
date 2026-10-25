"""Create user CLI script for Golden Snitch.
Usage: python scripts/create_user.py --org "My Org" --name "Ada" --email ada@org.com --role ROLE_GM
"""
import argparse
import getpass
import sys
import uuid
from pathlib import Path

# Add backend to path so imports work cleanly
backend_path = Path(__file__).resolve().parents[1] / "backend"
sys.path.insert(0, str(backend_path))

from app.security import hash_password
from app import db

def main():
    parser = argparse.ArgumentParser(description="Create a new Golden Snitch user account")
    parser.add_argument("--org", required=True, help="Organization name")
    parser.add_argument("--name", required=True, help="User full name")
    parser.add_argument("--email", required=True, help="User work email (unique)")
    parser.add_argument("--role", default="ROLE_GM", choices=["ROLE_GM", "ROLE_COACH", "ROLE_SCOUT"], help="User role")

    args = parser.parse_args()

    clean_email = args.email.strip().lower()
    if "@" not in clean_email or "." not in clean_email:
        print("[ERROR] Please provide a valid email address.", file=sys.stderr)
        sys.exit(1)

    print(f"Creating account for {args.name} <{clean_email}> ({args.role}) at '{args.org}'")
    password = getpass.getpass("Enter password (minimum 12 characters): ")
    if len(password) < 12:
        print("[ERROR] Password must be at least 12 characters long.", file=sys.stderr)
        sys.exit(1)

    confirm_password = getpass.getpass("Confirm password: ")
    if password != confirm_password:
        print("[ERROR] Passwords do not match.", file=sys.stderr)
        sys.exit(1)

    conn = db.connect()
    try:
        db.init(conn)
        existing = db.get_user_by_email(conn, clean_email)
        if existing:
            print(f"[ERROR] User with email '{clean_email}' already exists.", file=sys.stderr)
            sys.exit(1)

        user_id = f"USR-{uuid.uuid4().hex[:8].upper()}"
        pw_hash = hash_password(password)

        user = db.create_user(
            conn,
            user_id=user_id,
            org=args.org,
            name=args.name,
            email=clean_email,
            password_hash=pw_hash,
            role=args.role
        )
        print(f"[SUCCESS] User created successfully: ID={user['id']}, Email={user['email']}, Role={user['role']}")
    finally:
        conn.close()

if __name__ == "__main__":
    main()
