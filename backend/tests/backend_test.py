"""Backend tests for L&A Gebäudereinigung API - cookie-session auth + contact endpoints."""
import os
import uuid as _uuid
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
if not BASE_URL:
    with open('/app/frontend/.env') as f:
        for line in f:
            if line.startswith('REACT_APP_BACKEND_URL='):
                BASE_URL = line.split('=', 1)[1].strip().rstrip('/')
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "jonlipaj23@gmail.com"
ADMIN_PASSWORD = "LAClean2026!"
COOKIE_NAME = "la_session"


@pytest.fixture(scope="session")
def admin_session():
    """Return a requests.Session with the la_session HttpOnly cookie set."""
    s = requests.Session()
    r = s.post(f"{API}/auth/login",
               json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    assert COOKIE_NAME in s.cookies, f"Session cookie not set. Cookies: {s.cookies}"
    return s


def _payload(**overrides):
    p = {
        "name": "TEST_John",
        "phone": "+49 170 1234567",
        "email": "test_john@example.com",
        "location": "Berlin",
        "service": "Office Cleaning",
        "message": "TEST submission",
        "language": "DE",
    }
    p.update(overrides)
    return p


# --- Health ---
def test_root():
    r = requests.get(f"{API}/")
    assert r.status_code == 200
    assert r.json().get("status") == "ok"


# --- Auth (cookie-based) ---
class TestAuth:
    def test_login_success_sets_httponly_cookie(self):
        s = requests.Session()
        r = s.post(f"{API}/auth/login",
                   json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200, r.text
        d = r.json()
        # Response body: only {email}, NO token key
        assert d["email"].lower() == ADMIN_EMAIL
        assert "token" not in d, "Login response must not include token in body"
        # Cookie set
        assert COOKIE_NAME in s.cookies
        # Verify Set-Cookie attributes: HttpOnly, Secure, SameSite=None
        set_cookie = r.headers.get("set-cookie", "")
        lc = set_cookie.lower()
        assert "httponly" in lc, f"Set-Cookie missing HttpOnly: {set_cookie}"
        assert "secure" in lc, f"Set-Cookie missing Secure: {set_cookie}"
        assert "samesite=none" in lc, f"Set-Cookie missing SameSite=None: {set_cookie}"

    def test_login_wrong_password(self):
        r = requests.post(f"{API}/auth/login",
                          json={"email": ADMIN_EMAIL, "password": "wrong"})
        assert r.status_code == 401

    def test_login_wrong_email(self):
        r = requests.post(f"{API}/auth/login",
                          json={"email": "nope@example.com", "password": ADMIN_PASSWORD})
        assert r.status_code == 401

    def test_me_with_cookie(self, admin_session):
        r = admin_session.get(f"{API}/auth/me")
        assert r.status_code == 200
        assert r.json()["email"].lower() == ADMIN_EMAIL

    def test_me_no_cookie(self):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_me_bad_cookie(self):
        r = requests.get(f"{API}/auth/me", cookies={COOKIE_NAME: "garbage.token.here"})
        assert r.status_code == 401

    def test_bearer_token_fallback_rejected_without_valid_token(self):
        # Bearer path still exists but garbage should 401.
        r = requests.get(f"{API}/auth/me",
                         headers={"Authorization": "Bearer garbage.token.here"})
        assert r.status_code == 401

    def test_logout_clears_cookie(self):
        s = requests.Session()
        r = s.post(f"{API}/auth/login",
                   json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        assert COOKIE_NAME in s.cookies

        # /auth/me works while cookied
        r2 = s.get(f"{API}/auth/me")
        assert r2.status_code == 200

        # logout
        r3 = s.post(f"{API}/auth/logout")
        assert r3.status_code == 200
        assert r3.json().get("ok") is True

        # Cookie should be cleared server-side; session cookie jar removed too
        # (server sent Set-Cookie with expiry in the past)
        assert COOKIE_NAME not in s.cookies or not s.cookies.get(COOKIE_NAME)

        # /auth/me now 401
        r4 = s.get(f"{API}/auth/me")
        assert r4.status_code == 401


# --- Contact (public POST, protected list/update/delete via cookie) ---
class TestContact:
    created_id = None

    def test_create_contact_public(self):
        r = requests.post(f"{API}/contact", json=_payload(name="QA Test"))
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["email_sent"] is True
        sub = d["submission"]
        assert sub["name"] == "QA Test"
        assert sub["status"] == "new"
        assert "id" in sub
        TestContact.created_id = sub["id"]

    def test_create_invalid_email(self):
        r = requests.post(f"{API}/contact", json=_payload(email="not-an-email"))
        assert r.status_code == 422

    def test_list_no_auth(self):
        r = requests.get(f"{API}/contact")
        assert r.status_code == 401

    def test_list_with_cookie(self, admin_session):
        r = admin_session.get(f"{API}/contact")
        assert r.status_code == 200
        lst = r.json()
        assert isinstance(lst, list)
        assert any(x["id"] == TestContact.created_id for x in lst)

    def test_patch_status_no_auth(self):
        r = requests.patch(f"{API}/contact/{TestContact.created_id}/status",
                           json={"status": "contacted"})
        assert r.status_code == 401

    def test_patch_status_with_cookie(self, admin_session):
        r = admin_session.patch(f"{API}/contact/{TestContact.created_id}/status",
                                json={"status": "contacted"})
        assert r.status_code == 200
        assert r.json()["status"] == "contacted"

    def test_patch_status_unknown_id(self, admin_session):
        r = admin_session.patch(f"{API}/contact/nonexistent-xyz/status",
                                json={"status": "closed"})
        assert r.status_code == 404

    def test_delete_no_auth(self):
        r = requests.delete(f"{API}/contact/{TestContact.created_id}")
        assert r.status_code == 401

    def test_delete_with_cookie(self, admin_session):
        r = admin_session.delete(f"{API}/contact/{TestContact.created_id}")
        assert r.status_code == 200
        assert r.json()["deleted"] is True
        # verify gone
        r2 = admin_session.get(f"{API}/contact")
        assert not any(x["id"] == TestContact.created_id for x in r2.json())


# --- Throttle / Lockout ---
def _locktest_email():
    return f"locktest-{_uuid.uuid4().hex[:8]}@example.com"


class TestLoginThrottle:
    def test_5_failed_attempts_lockout(self):
        email = _locktest_email()
        for expected_remaining in [4, 3, 2, 1]:
            r = requests.post(f"{API}/auth/login",
                              json={"email": email, "password": "wrong"})
            assert r.status_code == 401, r.text
            assert f"{expected_remaining} attempt" in r.json().get("detail", "")
        # 5th -> 429
        r = requests.post(f"{API}/auth/login",
                          json={"email": email, "password": "wrong"})
        assert r.status_code == 429
        assert "Retry-After" in r.headers


# --- SEC-001 Honeypot + per-IP contact rate limit ---
class TestSecurityHardening:
    def test_honeypot_silent_drop(self, admin_session):
        r0 = admin_session.get(f"{API}/contact")
        before_ids = {x["id"] for x in r0.json()}

        r = requests.post(f"{API}/contact",
                          json=_payload(name="HP_BOT", email="delivered@resend.dev",
                                        website="http://spam.example.com/"))
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["email_sent"] is False
        assert d["confirmation_sent"] is False
        assert "website" not in d["submission"]

        r2 = admin_session.get(f"{API}/contact")
        after_ids = {x["id"] for x in r2.json()}
        assert after_ids == before_ids

    def test_contact_rate_limit_10_per_hour(self, admin_session):
        import subprocess
        subprocess.run(
            ["mongosh", "--quiet", "test_database", "--eval",
             'db.contact_events.deleteMany({})'],
            capture_output=True, check=False)

        ok_count = 0
        rate_limited = False
        for i in range(12):
            r = requests.post(f"{API}/contact",
                              json=_payload(name=f"HP_RL_{i}",
                                            email="delivered@resend.dev"))
            if r.status_code == 200:
                ok_count += 1
                sid = r.json()["submission"]["id"]
                admin_session.delete(f"{API}/contact/{sid}")
            elif r.status_code == 429:
                rate_limited = True
                assert "Retry-After" in r.headers
                break

        assert ok_count == 10
        assert rate_limited

        subprocess.run(
            ["mongosh", "--quiet", "test_database", "--eval",
             'db.contact_events.deleteMany({})'],
            capture_output=True, check=False)
