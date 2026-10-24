"""Authentication, JWT Token handling, and Role-Based Access Control (RBAC) (SEC-001).
Uses standard library hashlib and hmac for zero-dependency robust cryptographic authentication.
"""
import base64, hashlib, hmac, json, os, secrets, time
from typing import Optional
from fastapi import Header, HTTPException, status
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
    username: str
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

# In-memory default users for demonstration & seeding
DEFAULT_USERS = {
    "maya": {
        "id": "USR-001",
        "username": "maya",
        "name": "Maya Lin",
        "role": "ROLE_GM",
        "organization": "Logic Legend Esports",
        "salt": "d4a8e6f1a9b2c3d4",
        "hash": "cb2411e72e0bf32a5dfae70b80ba8d2bcfbf5fec0db6a54101e4ecba0bb51fc9",  # admin123
    },
    "dev": {
        "id": "USR-002",
        "username": "dev",
        "name": "Dev Sharma",
        "role": "ROLE_COACH",
        "organization": "Logic Legend Esports",
        "salt": "e1f2a3b4c5d6e7f8",
        "hash": "3e9b068da6c1e309cb936ea4aaae7e35bcfbeab9f6f6630f9a5d45d8b2d4fef6",  # coach123
    },
    "arjun": {
        "id": "USR-003",
        "username": "arjun",
        "name": "Arjun Patel",
        "role": "ROLE_SCOUT",
        "organization": "Logic Legend Esports",
        "salt": "a9b8c7d6e5f4a3b2",
        "hash": "310344d2d46e3e1be22a6113b5a19ef47e452145bfeae21262d989f6b9ce0552",  # scout123
    },
}

def hash_password(password: str, salt: Optional[str] = None) -> tuple[str, str]:
    if salt is None:
        salt = secrets.token_hex(8)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100_000)
    return key.hex(), salt

def verify_password(stored_hash: str, salt: str, password: str) -> bool:
    h, _ = hash_password(password, salt)
    return hmac.compare_digest(stored_hash, h)

# Pre-compute & set hashes for default users at initialization
for u, data in DEFAULT_USERS.items():
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
        user_row = db.get_user_by_username(conn, clean_uname)
        if user_row:
            if verify_password(user_row["password_hash"], user_row["salt"], password):
                return User(
                    id=user_row["id"],
                    username=user_row["username"],
                    name=user_row["name"],
                    role=user_row["role"],
                    organization=user_row["organization"],
                )
            return None
            
    # 2. Fallback to DEFAULT_USERS memory cache
    u = DEFAULT_USERS.get(clean_uname)
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

def get_current_user(authorization: Optional[str] = Header(None)) -> User:
    """Dependency that extracts user from Bearer token, or defaults to Maya (GM) for testing convenience."""
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1].strip()
        from . import db
        conn = db.connect()
        user = decode_access_token(token, conn)
        conn.close()
        if user:
            return user
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    # Demo default user: Maya Lin (GM)
    return User(
        id="USR-001",
        username="maya",
        name="Maya Lin",
        role="ROLE_GM",
        organization="Logic Legend Esports",
    )

