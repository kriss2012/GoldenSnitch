import os
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel, EmailStr
from slowapi import Limiter
from slowapi.util import get_remote_address

from .security import verify_password, make_token, read_token, TTL, DUMMY_HASH
from . import db

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(prefix="/api/auth", tags=["auth"])
COOKIE = "gs_session"
SECURE = os.getenv("ENV", "prod") != "dev"

class LoginIn(BaseModel):
    email: str
    password: str

def csrf_guard(req: Request):
    # Blocks cross-site form posts
    x_req = req.headers.get("x-requested-with")
    if x_req != "golden-snitch":
        raise HTTPException(
            status_code=403,
            detail={"error": {"code": "CSRF", "message": "Forbidden"}}
        )

def get_db():
    conn = db.connect()
    try:
        yield conn
    finally:
        conn.close()

def current_user(req: Request, db_conn=Depends(get_db)):
    tok = req.cookies.get(COOKIE)
    if not tok:
        # Check Authorization header as fallback if present
        auth_hdr = req.headers.get("authorization")
        if auth_hdr and auth_hdr.lower().startswith("bearer "):
            tok = auth_hdr.split(" ", 1)[1]
    if not tok:
        raise HTTPException(
            status_code=401,
            detail={"error": {"code": "UNAUTHENTICATED", "message": "Sign in required"}}
        )
    try:
        claims = read_token(tok)
    except Exception:
        raise HTTPException(
            status_code=401,
            detail={"error": {"code": "UNAUTHENTICATED", "message": "Sign in required"}}
        )
    user = db.get_user(db_conn, claims.get("sub"))
    if not user or not user.get("active", 1):
        raise HTTPException(
            status_code=401,
            detail={"error": {"code": "UNAUTHENTICATED", "message": "Sign in required"}}
        )
    return user

def require_roles(*roles):
    def dep(u=Depends(current_user)):
        if u.get("role") not in roles:
            raise HTTPException(
                status_code=403,
                detail={"error": {"code": "FORBIDDEN", "message": "Not allowed"}}
            )
        return u
    return dep

@router.post("/login")
@limiter.limit("5/minute")
def login(request: Request, body: LoginIn, res: Response, db_conn=Depends(get_db), _=Depends(csrf_guard)):
    email_clean = body.email.strip().lower()
    u = db.get_user_by_email(db_conn, email_clean)
    
    # Constant-time comparison preventing timing attacks
    if u and u.get("password_hash"):
        ok = verify_password(body.password, u["password_hash"])
        # Also support legacy salt hashes for existing accounts
        if not ok and u.get("salt"):
            from .auth import verify_password as legacy_verify
            ok = legacy_verify(u["password_hash"], u["salt"], body.password)
    else:
        ok = verify_password(body.password, DUMMY_HASH)

    if not (u and ok and u.get("active", 1)):
        raise HTTPException(
            status_code=401,
            detail={"error": {"code": "BAD_CREDENTIALS", "message": "Incorrect email or password"}}
        )
    
    tok = make_token(u["id"], u.get("role", "ROLE_SCOUT"))
    res.set_cookie(
        COOKIE,
        tok,
        httponly=True,
        secure=SECURE,
        samesite="lax",
        max_age=TTL,
        path="/"
    )
    return {
        "id": u["id"],
        "name": u["name"],
        "email": u.get("email") or f"{u.get('username', 'user')}@goldensnitch.gg",
        "role": u.get("role", "ROLE_SCOUT"),
        "org": u.get("org") or u.get("organization") or "Logic Legend Esports"
    }

@router.post("/logout")
def logout(res: Response, _=Depends(csrf_guard)):
    res.delete_cookie(COOKIE, path="/")
    return {"ok": True}

@router.get("/me")
def me(u=Depends(current_user)):
    return {
        "id": u["id"],
        "name": u["name"],
        "email": u.get("email") or f"{u.get('username', 'user')}@goldensnitch.gg",
        "role": u.get("role", "ROLE_SCOUT"),
        "org": u.get("org") or u.get("organization") or "Logic Legend Esports"
    }
