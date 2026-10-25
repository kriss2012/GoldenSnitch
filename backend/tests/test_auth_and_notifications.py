from fastapi.testclient import TestClient
try:
    from app.main import app
except ModuleNotFoundError:
    from backend.app.main import app

client = TestClient(app)

import uuid

def test_auth_registration_and_duplicate():
    username = f"test_scout_{uuid.uuid4().hex[:8]}"
    payload = {
        "username": username,
        "name": "Test Scout",
        "password": "Password123!",
        "role": "ROLE_SCOUT",
        "organization": "Test Org"
    }
    # 1. Register new user
    r1 = client.post("/api/v1/auth/register", json=payload)
    assert r1.status_code == 201
    data = r1.json()
    assert "access_token" in data
    assert data["user"]["username"] == username
    assert data["user"]["role"] == "ROLE_SCOUT"

    # 2. Duplicate registration should be rejected with 409
    r2 = client.post("/api/v1/auth/register", json=payload)
    assert r2.status_code == 409
    assert r2.json()["error"]["code"] == "DUPLICATE_USERNAME"

def test_auth_login_invalid_and_valid():
    # Invalid credentials
    r_bad = client.post("/api/v1/auth/login", json={"username": "maya", "password": "wrongpassword"})
    assert r_bad.status_code == 401

    # Valid login for default user Maya (GM)
    r_ok = client.post("/api/v1/auth/login", json={"username": "maya", "password": "admin123"})
    assert r_ok.status_code == 200
    token = r_ok.json()["access_token"]
    assert token

    # Check /api/v1/auth/me with Bearer token
    r_me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r_me.status_code == 200
    assert r_me.json()["user"]["username"] == "maya"
    assert r_me.json()["permissions"]["can_approve_signings"] is True

def test_auth_logout_and_revocation():
    # Login as dev
    r_login = client.post("/api/v1/auth/login", json={"username": "dev", "password": "coach123"})
    token = r_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Verify token works
    r_me1 = client.get("/api/v1/auth/me", headers=headers)
    assert r_me1.status_code == 200

    # Logout
    r_logout = client.post("/api/v1/auth/logout", headers=headers)
    assert r_logout.status_code == 200

    # Token must now be rejected
    r_me2 = client.get("/api/v1/auth/me", headers=headers)
    assert r_me2.status_code == 401

def test_cookie_session_persistence_and_logout():
    """Verify session cookie persistence without Authorization header and clean logout."""
    session_client = TestClient(app)
    r_login = session_client.post("/api/auth/login", json={"username": "maya", "password": "admin123"})
    assert r_login.status_code == 200
    assert "gs_session" in session_client.cookies
    assert "access_token" in r_login.json()

    # 2. Check /api/auth/me WITHOUT Authorization header (pure cookie session)
    r_me = session_client.get("/api/auth/me")
    assert r_me.status_code == 200
    me_data = r_me.json()
    assert me_data["username"] == "maya"
    assert me_data["role"] == "ROLE_GM"
    assert me_data["permissions"]["can_approve_signings"] is True

    # 3. Calling /api/auth/logout clears the session cookie
    r_logout = session_client.post("/api/auth/logout")
    assert r_logout.status_code == 200

    # 4. Subsequent call to /api/auth/me returns 401 Unauthorized
    r_me_after = session_client.get("/api/auth/me")
    assert r_me_after.status_code == 401
    assert r_me_after.json()["detail"] == "Authentication credentials were not provided"

def test_password_reset_flow():
    # 1. Request reset
    r_forgot = client.post("/api/v1/auth/forgot-password", json={"username_or_email": "arjun"})
    assert r_forgot.status_code == 200
    reset_token = r_forgot.json()["dev_reset_token"]
    assert reset_token

    # 2. Reset password
    r_reset = client.post("/api/v1/auth/reset-password", json={"token": reset_token, "new_password": "NewScoutPassword456!"})
    assert r_reset.status_code == 200

    # 3. Old password should fail
    r_old = client.post("/api/v1/auth/login", json={"username": "arjun", "password": "scout123"})
    assert r_old.status_code == 401

    # 4. New password should succeed
    r_new = client.post("/api/v1/auth/login", json={"username": "arjun", "password": "NewScoutPassword456!"})
    assert r_new.status_code == 200

    # 5. Token reuse must fail
    r_reuse = client.post("/api/v1/auth/reset-password", json={"token": reset_token, "new_password": "AnotherPassword"})
    assert r_reuse.status_code == 400

def test_notification_lifecycle_and_read_state():
    # Login as Maya
    r_login = client.post("/api/v1/auth/login", json={"username": "maya", "password": "admin123"})
    token = r_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Ensure an unread notification exists for this test run (Mirage)
    res_post = client.post("/api/v1/watchlist", json={"player_id": "VAL-002", "stage": "Screening"}, headers=headers)
    assert res_post.status_code == 200

    # 1. Fetch unread count
    r_count = client.get("/api/v1/notifications/unread-count", headers=headers)
    assert r_count.status_code == 200
    initial_unread = r_count.json()["unread_count"]
    assert initial_unread >= 1

    # 2. Fetch notifications list
    r_list = client.get("/api/v1/notifications", headers=headers)
    assert r_list.status_code == 200
    notifs = r_list.json()["notifications"]
    assert len(notifs) >= 1

    # Pick an unread notification
    unread_target = next((n for n in notifs if n["is_read"] == 0), None)
    if unread_target:
        # Mark as read
        r_read = client.patch(f"/api/v1/notifications/{unread_target['id']}/read", headers=headers)
        assert r_read.status_code == 200
        assert r_read.json()["is_read"] is True

        # Verify count decreased
        r_count2 = client.get("/api/v1/notifications/unread-count", headers=headers)
        assert r_count2.json()["unread_count"] == initial_unread - 1

    # 3. Mark all as read
    r_all = client.post("/api/v1/notifications/mark-all-read", headers=headers)
    assert r_all.status_code == 200
    r_count_final = client.get("/api/v1/notifications/unread-count", headers=headers)
    assert r_count_final.json()["unread_count"] == 0

def test_watchlist_action_generates_notification():
    # Login as Maya
    r_login = client.post("/api/v1/auth/login", json={"username": "maya", "password": "admin123"})
    token = r_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Add candidate to watchlist (Mirage)
    r_add = client.post("/api/v1/watchlist", json={"player_id": "VAL-002", "stage": "Trial Requested", "notes": "Controller gap priority"}, headers=headers)
    assert r_add.status_code == 200

    # Verify a new notification was generated!
    r_notifs = client.get("/api/v1/notifications", headers=headers)
    assert r_notifs.status_code == 200
    top_notif = r_notifs.json()["notifications"][0]
    assert "Candidate Shortlisted" in top_notif["title"]
    assert "Mirage" in top_notif["message"]
    assert top_notif["resource_id"] == "VAL-002"

def test_login_rate_limiting():
    # Attempt 10 failed logins
    for _ in range(10):
        client.post("/api/v1/auth/login", json={"username": "maya", "password": "wrong_password"})
    
    # 11th failed attempt should trigger 429
    r_limit = client.post("/api/v1/auth/login", json={"username": "maya", "password": "wrong_password"})
    assert r_limit.status_code == 429
    assert r_limit.json()["error"]["code"] == "RATE_LIMIT_EXCEEDED"

    # Reset attempts for test environment so subsequent tests are not throttled
    try:
        from app.main import clear_failed_logins
        clear_failed_logins("testclient")
    except Exception:
        pass
