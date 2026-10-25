"""Authentication, JWT Token handling, and Role-Based Access Control (RBAC) (SEC-001).
Uses standard library hashlib and hmac for zero-dependency robust cryptographic authentication.
"""
import base64, hashlib, hmac, json, os, secrets, time
from typing import Optional
from fastapi import Header, HTTPException, status, Request
from pydantic import BaseModel

SECRET_KEY = os.environ.get("SCOUTGRID_SECRET_KEY", "golden_snitch_production_secret_key_2026_logic_legend")
TOKEN_EXPIRY_SECONDS = 86400  # 24 hours

class User(BaseModel):
    id: str
    username: str
    name: str
    role: str  # ROLE_GM, ROLE_COACH, ROLE_SCOUT, ROLE_MANAGER
    organization: str

class UserLogin(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password: str

class UserRegister(BaseModel):
    username: str
    name: str
    password: str
    role: str = "ROLE_SCOUT"
    organization: str = "Logic Legend Esports"

class ForgotPasswordRequest(BaseModel):
    username_or_email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User

SYSTEM_USERS = {
    "maya": {
        "id": "USR-001",
        "username": "maya",
        "name": "General Manager",
        "role": "ROLE_GM",
        "organization": "Logic Legend Esports",
        "salt": "d4a8e6f1a9b2c3d4",
        "hash": "cb2411e72e0bf32a5dfae70b80ba8d2bcfbf5fec0db6a54101e4ecba0bb51fc9",  # admin123
    },
    "dev": {
        "id": "USR-002",
        "username": "dev",
        "name": "Head Coach",
        "role": "ROLE_COACH",
        "organization": "Logic Legend Esports",
        "salt": "e1f2a3b4c5d6e7f8",
        "hash": "3e9b068da6c1e309cb936ea4aaae7e35bcfbeab9f6f6630f9a5d45d8b2d4fef6",  # coach123
    },
    "arjun": {
        "id": "USR-003",
        "username": "arjun",
        "name": "Talent Scout",
        "role": "ROLE_SCOUT",
        "organization": "Logic Legend Esports",
        "salt": "a9b8c7d6e5f4a3b2",
        "hash": "310344d2d46e3e1be22a6113b5a19ef47e452145bfeae21262d989f6b9ce0552",  # scout123
    },
}
DEFAULT_USERS = SYSTEM_USERS

def hash_password(password: str, salt: Optional[str] = None) -> tuple[str, str]:
    if salt is None:
        salt = secrets.token_hex(8)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100_000)
    return key.hex(), salt

def verify_password(stored_hash: str, salt: str, password: str) -> bool:
    h, _ = hash_password(password, salt)
    return hmac.compare_digest(stored_hash, h)

# Pre-compute & set hashes for default users at initialization
for u, data in SYSTEM_USERS.items():
    pw = "admin123" if u == "maya" else "coach123" if u == "dev" else "scout123"
    h, s = hash_password(pw, data["salt"])
    data["hash"] = h

def token_hash(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()

def b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")

def b64url_decode(s: str) -> bytes:
    padding = 4 - (len(s) % 4)
    if padding < 4:
        s += "=" * padding
    return base64.urlsafe_b64decode(s.encode("utf-8"))

def create_access_token(user: User) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "sub": user.id,
        "username": user.username,
        "name": user.name,
        "role": user.role,
        "organization": user.organization,
        "exp": int(time.time()) + TOKEN_EXPIRY_SECONDS,
    }
    h_enc = b64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    p_enc = b64url_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    signing_input = f"{h_enc}.{p_enc}".encode("utf-8")
    sig = hmac.new(SECRET_KEY.encode("utf-8"), signing_input, hashlib.sha256).digest()
    sig_enc = b64url_encode(sig)
    return f"{h_enc}.{p_enc}.{sig_enc}"

def decode_access_token(token: str, conn=None) -> Optional[User]:
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        h_enc, p_enc, sig_enc = parts
        signing_input = f"{h_enc}.{p_enc}".encode("utf-8")
        expected_sig = hmac.new(SECRET_KEY.encode("utf-8"), signing_input, hashlib.sha256).digest()
        actual_sig = b64url_decode(sig_enc)
        if not hmac.compare_digest(expected_sig, actual_sig):
            return None
        payload = json.loads(b64url_decode(p_enc).decode("utf-8"))
        if payload.get("exp", 0) < time.time():
            return None
        
        # Check if token is revoked in database
        if conn:
            from . import db
            if db.is_token_revoked(conn, token_hash(token)):
                return None
            user_row = conn.execute("SELECT id FROM users WHERE id=?", (payload["sub"],)).fetchone()
            default_ids = {u["id"] for u in SYSTEM_USERS.values()}
            if not user_row and payload["sub"] not in default_ids:
                return None
        
        return User(
            id=payload["sub"],
            username=payload["username"],
            name=payload["name"],
            role=payload["role"],
            organization=payload["organization"],
        )
    except Exception:
        return None

def authenticate_user(username: str, password: str, conn=None) -> Optional[User]:
    clean_uname = username.strip().lower()
    
    # 1. Check database users table
    if conn:
        from . import db
        user_row = conn.execute(
            "SELECT * FROM users WHERE LOWER(username)=? OR LOWER(email)=?",
            (clean_uname, clean_uname)
        ).fetchone()
        if user_row:
            u_dict = dict(user_row)
            pw_hash = u_dict.get("password_hash")
            salt = u_dict.get("salt")
            ok = False
            # Check argon2 hash if present
            if pw_hash and ("$argon2" in pw_hash):
                try:
                    from .security import verify_password as argon2_verify
                    ok = argon2_verify(password, pw_hash)
                except Exception:
                    pass
            # Legacy salt verify
            if not ok and pw_hash and salt:
                ok = verify_password(pw_hash, salt, password)
            if not ok and pw_hash and not salt:
                try:
                    from .security import verify_password as argon2_verify
                    ok = argon2_verify(password, pw_hash)
                except Exception:
                    pass

            if ok and u_dict.get("active", 1):
                return User(
                    id=u_dict["id"],
                    username=u_dict.get("username") or clean_uname.split("@")[0],
                    name=u_dict.get("name") or "User",
                    role=u_dict.get("role") or "ROLE_SCOUT",
                    organization=u_dict.get("org") or u_dict.get("organization") or "Logic Legend Esports",
                )
            return None
            
    # 2. Fallback to SYSTEM_USERS memory cache
    u = SYSTEM_USERS.get(clean_uname)
    if not u:
        return None
    if verify_password(u["hash"], u["salt"], password):
        return User(
            id=u["id"],
            username=u["username"],
            name=u["name"],
            role=u["role"],
            organization=u["organization"],
        )
    return None

def get_current_user(request: Request = None, authorization: Optional[str] = Header(None)) -> User:
    """Dependency that extracts user from Bearer token or session cookie, strictly rejecting unauthenticated requests."""
    token = None
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1].strip()
    elif request and request.cookies.get("gs_session"):
        token = request.cookies.get("gs_session")

    if token:
        from . import db
        conn = db.connect()
        user = decode_access_token(token, conn)
        conn.close()
        if user:
            return user
        # Also try JWT token from security.py
        try:
            from .security import read_token
            claims = read_token(token)
            conn = db.connect()
            u_dict = db.get_user(conn, claims.get("sub"))
            conn.close()
            if u_dict and u_dict.get("active", 1):
                return User(
                    id=u_dict["id"],
                    username=u_dict.get("username") or "user",
                    name=u_dict.get("name") or "User",
                    role=u_dict.get("role") or "ROLE_SCOUT",
                    organization=u_dict.get("org") or u_dict.get("organization") or "Logic Legend Esports",
                )
        except Exception:
            pass
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication credentials were not provided")

