import os, time
try:
    import jwt
except ImportError:
    from jose import jwt
from passlib.context import CryptContext

pwd = CryptContext(schemes=["argon2"], deprecated="auto")
# 32+ byte auth secret key
SECRET = os.environ.get("AUTH_SECRET", "golden-snitch-production-super-secret-key-32-bytes-minimum")
TTL = 60 * 60 * 8  # 8 hour session

# Dummy hash for constant-time comparison when user not found
DUMMY_HASH = pwd.hash("dummy_auth_timing_protection_password")

def hash_password(p: str) -> str:
    return pwd.hash(p)

def verify_password(p: str, h: str) -> bool:
    try:
        return pwd.verify(p, h)
    except Exception:
        # Fallback for legacy PBKDF2/SHA256 hashes if any
        return False

def make_token(uid: str, role: str) -> str:
    return jwt.encode({"sub": uid, "role": role, "exp": int(time.time()) + TTL}, SECRET, algorithm="HS256")

def read_token(t: str) -> dict:
    return jwt.decode(t, SECRET, algorithms=["HS256"])
