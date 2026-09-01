"""Backend tests for L&A Gebäudereinigung API - auth + contact endpoints."""
import os
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


@pytest.fixture(scope="session")
def token():
    r = requests.post(f"{API}/auth/login",
                      json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="session")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


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


# --- Auth ---
class TestAuth:
    def test_login_success(self):
        r = requests.post(f"{API}/auth/login",
                          json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        d = r.json()
        assert d["email"].lower() == ADMIN_EMAIL
        assert isinstance(d["token"], str) and len(d["token"]) > 20

    def test_login_wrong_password(self):
        r = requests.post(f"{API}/auth/login",
                          json={"email": ADMIN_EMAIL, "password": "wrong"})
        assert r.status_code == 401

    def test_login_wrong_email(self):
        r = requests.post(f"{API}/auth/login",
                          json={"email": "nope@example.com", "password": ADMIN_PASSWORD})
        assert r.status_code == 401

    def test_me_with_token(self, auth_headers):
        r = requests.get(f"{API}/auth/me", headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["email"].lower() == ADMIN_EMAIL

    def test_me_no_token(self):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_me_bad_token(self):
        r = requests.get(f"{API}/auth/me",
                         headers={"Authorization": "Bearer garbage.token.here"})
        assert r.status_code == 401


# --- Contact (public POST, protected list/update/delete) ---
class TestContact:
    created_id = None

    def test_create_contact_public(self):
        r = requests.post(f"{API}/contact", json=_payload(name="QA Test"))
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["email_sent"] is True  # RESEND_API_KEY is live now
        sub = d["submission"]
        assert sub["name"] == "QA Test"
        assert sub["email"] == "test_john@example.com"
        assert sub["status"] == "new"
        assert "id" in sub
        TestContact.created_id = sub["id"]

    def test_create_invalid_email(self):
        r = requests.post(f"{API}/contact", json=_payload(email="not-an-email"))
        assert r.status_code == 422

    def test_create_missing_field(self):
        p = _payload()
        del p["name"]
        r = requests.post(f"{API}/contact", json=p)
        assert r.status_code == 422

    def test_list_no_auth(self):
        r = requests.get(f"{API}/contact")
        assert r.status_code == 401

    def test_list_with_auth(self, auth_headers):
        r = requests.get(f"{API}/contact", headers=auth_headers)
        assert r.status_code == 200
        lst = r.json()
        assert isinstance(lst, list)
        assert any(x["id"] == TestContact.created_id for x in lst)
        # sorted desc
        dates = [i["created_at"] for i in lst]
        assert dates == sorted(dates, reverse=True)

    def test_patch_status_no_auth(self):
        r = requests.patch(f"{API}/contact/{TestContact.created_id}/status",
                           json={"status": "contacted"})
        assert r.status_code == 401

    def test_patch_status_with_auth(self, auth_headers):
        r = requests.patch(f"{API}/contact/{TestContact.created_id}/status",
                           json={"status": "contacted"}, headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["status"] == "contacted"

    def test_patch_status_invalid_value(self, auth_headers):
        r = requests.patch(f"{API}/contact/{TestContact.created_id}/status",
                           json={"status": "bogus"}, headers=auth_headers)
        assert r.status_code == 422

    def test_patch_status_unknown_id(self, auth_headers):
        r = requests.patch(f"{API}/contact/nonexistent-xyz/status",
                           json={"status": "closed"}, headers=auth_headers)
        assert r.status_code == 404

    def test_delete_no_auth(self):
        r = requests.delete(f"{API}/contact/{TestContact.created_id}")
        assert r.status_code == 401

    def test_delete_with_auth(self, auth_headers):
        r = requests.delete(f"{API}/contact/{TestContact.created_id}",
                            headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["deleted"] is True

        # verify gone
        r2 = requests.get(f"{API}/contact", headers=auth_headers)
        assert not any(x["id"] == TestContact.created_id for x in r2.json())

    def test_delete_unknown_id(self, auth_headers):
        r = requests.delete(f"{API}/contact/does-not-exist-xyz",
                            headers=auth_headers)
        assert r.status_code == 404


# --- Throttle / Lockout ---
# NOTE: identifier is IP+email. Ingress may append/override X-Forwarded-For,
# but distinct emails guarantee distinct identifiers. We use "invalid" emails so
# no real admin account is locked (they still count toward the counter).
import uuid as _uuid


def _locktest_email():
    return f"locktest-{_uuid.uuid4().hex[:8]}@example.com"


class TestLoginThrottle:
    def test_401_shows_remaining_then_429_on_5th(self):
        email = _locktest_email()
        # 4 failed attempts -> 401 with remaining counts 4,3,2,1
        for expected_remaining in [4, 3, 2, 1]:
            r = requests.post(f"{API}/auth/login",
                              json={"email": email, "password": "wrong"})
            assert r.status_code == 401, r.text
            detail = r.json().get("detail", "")
            assert f"{expected_remaining} attempt" in detail, detail
        # 5th attempt -> 429 with Retry-After
        r = requests.post(f"{API}/auth/login",
                          json={"email": email, "password": "wrong"})
        assert r.status_code == 429, r.text
        assert "Retry-After" in r.headers
        assert int(r.headers["Retry-After"]) > 0
        assert "Too many failed attempts" in r.json().get("detail", "")

        # 6th attempt with CORRECT password (same identifier) still locked
        r = requests.post(f"{API}/auth/login",
                          json={"email": email, "password": ADMIN_PASSWORD})
        # since email != ADMIN_EMAIL it would 401, but lockout runs first -> 429
        assert r.status_code == 429, r.text

    def test_successful_login_resets_counter(self):
        # 2 failed logins for real admin (they count against IP+admin_email identifier)
        # To avoid locking real admin: use a fresh email that is invalid email address on server
        # but ALSO test the reset: perform 2 fails on ADMIN_EMAIL with wrong pw, then success,
        # then 4 more wrongs -> should still be 401 (not 429).
        # Ensure we start clean by clearing any prior attempts for admin via successful login first.
        r0 = requests.post(f"{API}/auth/login",
                           json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r0.status_code == 200, r0.text  # resets counter

        for expected_remaining in [4, 3]:
            r = requests.post(f"{API}/auth/login",
                              json={"email": ADMIN_EMAIL, "password": "wrong"})
            assert r.status_code == 401, r.text
            assert f"{expected_remaining} attempt" in r.json().get("detail", "")

        # Successful login -> resets
        r = requests.post(f"{API}/auth/login",
                          json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200, r.text

        # 4 more failures should all be 401 (not 429) since counter reset
        for expected_remaining in [4, 3, 2, 1]:
            r = requests.post(f"{API}/auth/login",
                              json={"email": ADMIN_EMAIL, "password": "wrong"})
            assert r.status_code == 401, r.text
            assert f"{expected_remaining} attempt" in r.json().get("detail", "")

        # Reset counter again with a successful login so we don't leave admin near lockout
        r = requests.post(f"{API}/auth/login",
                          json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200, r.text
