"""Backend tests for L&A Gebäudereinigung API - contact submissions CRUD."""
import os
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://shine-solutions-demo.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def created_ids():
    return []


def _payload(**overrides):
    p = {
        "name": "TEST_John Doe",
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
def test_root(session):
    r = session.get(f"{API}/")
    assert r.status_code == 200
    assert r.json().get("status") == "ok"


# --- Create ---
def test_create_contact_valid(session, created_ids):
    r = session.post(f"{API}/contact", json=_payload())
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["email_sent"] is False  # no RESEND key
    sub = data["submission"]
    assert sub["name"] == "TEST_John Doe"
    assert sub["email"] == "test_john@example.com"
    assert sub["status"] == "new"
    assert "id" in sub and len(sub["id"]) > 10
    assert "created_at" in sub
    created_ids.append(sub["id"])


def test_create_contact_invalid_email(session):
    r = session.post(f"{API}/contact", json=_payload(email="not-an-email"))
    assert r.status_code == 422


def test_create_contact_missing_field(session):
    p = _payload()
    del p["name"]
    r = session.post(f"{API}/contact", json=p)
    assert r.status_code == 422


# --- List ---
def test_list_contacts_sorted(session, created_ids):
    # create a 2nd to verify order
    r2 = session.post(f"{API}/contact", json=_payload(name="TEST_Second", email="test_second@example.com"))
    assert r2.status_code == 200
    created_ids.append(r2.json()["submission"]["id"])

    r = session.get(f"{API}/contact")
    assert r.status_code == 200
    items = r.json()
    assert isinstance(items, list)
    assert len(items) >= 2
    # sorted desc by created_at
    dates = [i["created_at"] for i in items]
    assert dates == sorted(dates, reverse=True)
    # newest is our latest
    assert items[0]["id"] == created_ids[-1]


# --- Update status ---
def test_update_status(session, created_ids):
    sid = created_ids[0]
    r = session.patch(f"{API}/contact/{sid}/status", json={"status": "contacted"})
    assert r.status_code == 200, r.text
    assert r.json()["status"] == "contacted"

    # verify persisted
    lr = session.get(f"{API}/contact")
    match = [i for i in lr.json() if i["id"] == sid][0]
    assert match["status"] == "contacted"


def test_update_status_invalid_value(session, created_ids):
    r = session.patch(f"{API}/contact/{created_ids[0]}/status", json={"status": "bogus"})
    assert r.status_code == 422


def test_update_status_unknown_id(session):
    r = session.patch(f"{API}/contact/nonexistent-id/status", json={"status": "closed"})
    assert r.status_code == 404


# --- Delete ---
def test_delete_contact(session, created_ids):
    for sid in list(created_ids):
        r = session.delete(f"{API}/contact/{sid}")
        assert r.status_code == 200, r.text
        assert r.json()["deleted"] is True
        created_ids.remove(sid)


def test_delete_unknown_id(session):
    r = session.delete(f"{API}/contact/does-not-exist-xyz")
    assert r.status_code == 404
