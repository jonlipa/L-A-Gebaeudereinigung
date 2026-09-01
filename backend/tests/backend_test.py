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
        r = requests.post(f"{API}/contact", json=_payload())
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["email_sent"] is False  # RESEND_API_KEY empty
        sub = d["submission"]
        assert sub["name"] == "TEST_John"
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
