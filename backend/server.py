from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import asyncio
import logging
import html
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Literal
import uuid
from datetime import datetime, timezone, timedelta
import resend
import bcrypt
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
NOTIFY_EMAIL = os.environ.get('NOTIFY_EMAIL', '')
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"
ADMIN_EMAIL = os.environ['ADMIN_EMAIL'].lower()
ADMIN_PASSWORD = os.environ['ADMIN_PASSWORD']

app = FastAPI(title="L&A Gebäudereinigung API")
api_router = APIRouter(prefix="/api")

StatusType = Literal["new", "contacted", "closed"]


# ---------------------------------------------------------------------------
# Auth (single admin password gate)
# ---------------------------------------------------------------------------
def create_access_token(email: str) -> str:
    payload = {
        "sub": email,
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(hours=12),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def require_admin(request: Request) -> str:
    auth_header = request.headers.get("Authorization", "")
    token = auth_header[7:] if auth_header.startswith("Bearer ") else None
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    if payload.get("sub", "").lower() != ADMIN_EMAIL:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload["sub"]


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    token: str
    email: str


_ADMIN_PASSWORD_HASH = bcrypt.hashpw(ADMIN_PASSWORD.encode("utf-8"), bcrypt.gensalt())
_DUMMY_HASH = bcrypt.hashpw(b"timing-attack-mitigation-dummy", bcrypt.gensalt())


def verify_password(plain: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), _ADMIN_PASSWORD_HASH)


class ContactCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    phone: str = Field(min_length=5, max_length=40)
    email: EmailStr
    location: str = Field(min_length=2, max_length=160)
    service: str = Field(min_length=2, max_length=80)
    message: str = Field(default="", max_length=2000)
    language: str = Field(default="DE", max_length=2)
    website: str = Field(default="", max_length=200)  # honeypot – must stay empty


class ContactSubmission(ContactCreate):
    model_config = ConfigDict(extra="ignore")
    website: str = Field(default="", exclude=True)  # never stored / returned
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: StatusType = "new"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class StatusUpdate(BaseModel):
    status: StatusType


class ContactResponse(BaseModel):
    submission: ContactSubmission
    email_sent: bool
    confirmation_sent: bool = False


def build_email_html(s: ContactSubmission) -> str:
    rows = [("Name", s.name), ("Telefon", s.phone), ("E-Mail", s.email), ("Standort", s.location),
            ("Leistung", s.service), ("Nachricht", s.message or "-"), ("Eingang", s.created_at)]
    tr = "".join(
        f'<tr><td style="padding:8px 12px;color:#475569;font-size:13px;border-bottom:1px solid #E2E8F0">{k}</td>'
        f'<td style="padding:8px 12px;color:#0F172A;font-size:14px;border-bottom:1px solid #E2E8F0">{html.escape(str(v))}</td></tr>'
        for k, v in rows)
    return (f'<table width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;max-width:600px">'
            f'<tr><td style="background:#0B2A6F;color:#fff;padding:20px 24px;font-size:18px;font-weight:bold">'
            f'L&amp;A Gebäudereinigung – Neue Anfrage</td></tr>'
            f'<tr><td style="padding:0"><table width="100%" cellpadding="0" cellspacing="0">{tr}</table></td></tr></table>')


async def send_notification(s: ContactSubmission) -> bool:
    if not RESEND_API_KEY or not NOTIFY_EMAIL:
        logger.info("Email notification skipped (RESEND_API_KEY / NOTIFY_EMAIL not configured)")
        return False
    params = {"from": SENDER_EMAIL, "to": [NOTIFY_EMAIL],
              "subject": f"Neue Anfrage: {s.service} – {s.name}", "html": build_email_html(s)}
    try:
        await asyncio.to_thread(resend.Emails.send, params)
        return True
    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        return False


def build_customer_email_html(s: ContactSubmission) -> str:
    de = (s.language or "DE").upper() == "DE"
    if de:
        greeting = f"Guten Tag {html.escape(s.name)},"
        intro = ("vielen Dank für Ihr Interesse an L&A Gebäudereinigung. Wir haben Ihre Anfrage "
                 "erhalten und melden uns innerhalb von 24 Stunden persönlich bei Ihnen.")
        summary_label = "Ihre Angaben im Überblick"
        rows = [("Leistung", s.service), ("Standort", s.location), ("Telefon", s.phone)]
        closing = "Mit freundlichen Grüßen"
        team = "Ihr Team der L&A Gebäudereinigung"
        note = "Dies ist eine automatische Empfangsbestätigung. Bitte antworten Sie nicht direkt auf diese E-Mail."
    else:
        greeting = f"Hello {html.escape(s.name)},"
        intro = ("thank you for your interest in L&A Gebäudereinigung. We have received your request "
                 "and will get back to you personally within 24 hours.")
        summary_label = "Summary of your request"
        rows = [("Service", s.service), ("Location", s.location), ("Phone", s.phone)]
        closing = "Best regards"
        team = "Your L&A Gebäudereinigung team"
        note = "This is an automatic confirmation. Please do not reply directly to this email."
    tr = "".join(
        f'<tr><td style="padding:8px 12px;color:#475569;font-size:13px;border-bottom:1px solid #E2E8F0">{k}</td>'
        f'<td style="padding:8px 12px;color:#0F172A;font-size:14px;border-bottom:1px solid #E2E8F0">{html.escape(str(v))}</td></tr>'
        for k, v in rows)
    return (f'<table width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;max-width:600px">'
            f'<tr><td style="background:#0B2A6F;color:#fff;padding:22px 24px;font-size:18px;font-weight:bold">'
            f'L&amp;A Gebäudereinigung</td></tr>'
            f'<tr><td style="padding:24px">'
            f'<p style="color:#0F172A;font-size:16px;font-weight:bold;margin:0 0 12px">{greeting}</p>'
            f'<p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 20px">{intro}</p>'
            f'<p style="color:#0F172A;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px">{summary_label}</p>'
            f'<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E2E8F0;border-radius:8px;overflow:hidden">{tr}</table>'
            f'<p style="color:#475569;font-size:14px;margin:24px 0 2px">{closing},</p>'
            f'<p style="color:#0F172A;font-size:14px;font-weight:bold;margin:0">{team}</p>'
            f'</td></tr>'
            f'<tr><td style="padding:14px 24px;background:#F1F5F9;color:#94A3B8;font-size:11px">{note}</td></tr>'
            f'</table>')


async def send_customer_confirmation(s: ContactSubmission) -> bool:
    if not RESEND_API_KEY:
        logger.info("Customer confirmation skipped (RESEND_API_KEY not configured)")
        return False
    de = (s.language or "DE").upper() == "DE"
    subject = ("Ihre Anfrage bei L&A Gebäudereinigung – wir haben sie erhalten"
               if de else "Your inquiry at L&A Gebäudereinigung – we've received it")
    params = {"from": SENDER_EMAIL, "to": [s.email], "subject": subject, "html": build_customer_email_html(s)}
    try:
        await asyncio.to_thread(resend.Emails.send, params)
        return True
    except Exception as e:
        logger.error(f"Failed to send customer confirmation: {e}")
        return False


@api_router.get("/")
async def root():
    return {"message": "L&A Gebäudereinigung API", "status": "ok"}


MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_MINUTES = 15
TRUSTED_PROXY_HOPS = int(os.environ.get("TRUSTED_PROXY_HOPS", "1"))
CONTACT_MAX_PER_HOUR = 10
CONTACT_DAILY_EMAIL_CAP = 500


def client_ip(request: Request) -> str:
    # Take the IP added by our own trusted proxy hop, not the leftmost client-controlled value.
    fwd = [p.strip() for p in request.headers.get("X-Forwarded-For", "").split(",") if p.strip()]
    if fwd:
        idx = min(TRUSTED_PROXY_HOPS, len(fwd))
        return fwd[-idx]
    return request.client.host if request.client else "unknown"


async def check_lockout(identifier: str) -> None:
    rec = await db.login_attempts.find_one({"identifier": identifier}, {"_id": 0})
    if not rec or rec.get("count", 0) < MAX_LOGIN_ATTEMPTS:
        return
    locked_until = datetime.fromisoformat(rec["locked_until"])
    now = datetime.now(timezone.utc)
    if now >= locked_until:
        await db.login_attempts.delete_one({"identifier": identifier})
        return
    retry_after = int((locked_until - now).total_seconds())
    raise HTTPException(
        status_code=429,
        detail=f"Too many failed attempts. Try again in {max(1, retry_after // 60 + 1)} min.",
        headers={"Retry-After": str(retry_after)},
    )


async def record_failed_attempt(identifier: str) -> int:
    now = datetime.now(timezone.utc)
    rec = await db.login_attempts.find_one_and_update(
        {"identifier": identifier},
        {"$inc": {"count": 1}, "$set": {"last_attempt": now.isoformat()},
         "$setOnInsert": {"locked_until": now.isoformat()}},
        upsert=True, return_document=True)
    count = rec["count"]
    if count >= MAX_LOGIN_ATTEMPTS:
        await db.login_attempts.update_one(
            {"identifier": identifier},
            {"$set": {"locked_until": (now + timedelta(minutes=LOCKOUT_MINUTES)).isoformat()}})
    return count


@api_router.post("/auth/login", response_model=LoginResponse)
async def login(body: LoginRequest, request: Request):
    email = body.email.lower()
    identifier = f"{client_ip(request)}:{email}"
    await check_lockout(identifier)
    email_ok = email == ADMIN_EMAIL
    if email_ok:
        password_ok = verify_password(body.password)
    else:
        bcrypt.checkpw(body.password.encode("utf-8"), _DUMMY_HASH)  # constant-time: run bcrypt on wrong-email path too
        password_ok = False
    if not (email_ok and password_ok):
        count = await record_failed_attempt(identifier)
        remaining = MAX_LOGIN_ATTEMPTS - count
        if remaining <= 0:
            raise HTTPException(status_code=429,
                                detail=f"Too many failed attempts. Account locked for {LOCKOUT_MINUTES} min.",
                                headers={"Retry-After": str(LOCKOUT_MINUTES * 60)})
        raise HTTPException(status_code=401, detail=f"Invalid email or password. {remaining} attempt(s) left.")
    await db.login_attempts.delete_one({"identifier": identifier})
    return LoginResponse(token=create_access_token(ADMIN_EMAIL), email=ADMIN_EMAIL)


@api_router.get("/auth/me")
async def me(admin: str = Depends(require_admin)):
    return {"email": admin}


async def contact_rate_check(ip: str) -> None:
    hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)
    count = await db.contact_events.count_documents({"ip": ip, "ts": {"$gte": hour_ago}})
    if count >= CONTACT_MAX_PER_HOUR:
        raise HTTPException(status_code=429, detail="Too many requests. Please try again later.",
                            headers={"Retry-After": "3600"})


async def daily_send_allowed() -> bool:
    start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    return await db.contact_events.count_documents({"ts": {"$gte": start}}) <= CONTACT_DAILY_EMAIL_CAP


@api_router.post("/contact", response_model=ContactResponse)
async def create_contact(payload: ContactCreate, request: Request):
    if payload.website.strip():  # honeypot filled → bot; silently drop
        logger.info("Contact honeypot triggered; submission dropped")
        dummy = ContactSubmission(**payload.model_dump(exclude={"website"}))
        return ContactResponse(submission=dummy, email_sent=False, confirmation_sent=False)
    ip = client_ip(request)
    await contact_rate_check(ip)
    await db.contact_events.insert_one({"ip": ip, "ts": datetime.now(timezone.utc)})
    submission = ContactSubmission(**payload.model_dump(exclude={"website"}))
    await db.contact_submissions.insert_one(submission.model_dump())
    if await daily_send_allowed():
        sent = await send_notification(submission)
        confirmation = await send_customer_confirmation(submission)
    else:
        logger.warning("Daily contact email cap reached; skipping email dispatch")
        sent = confirmation = False
    return ContactResponse(submission=submission, email_sent=sent, confirmation_sent=confirmation)


@api_router.get("/contact", response_model=List[ContactSubmission])
async def list_contacts(admin: str = Depends(require_admin)):
    docs = await db.contact_submissions.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return [ContactSubmission(**d) for d in docs]


@api_router.patch("/contact/{submission_id}/status", response_model=ContactSubmission)
async def update_status(submission_id: str, body: StatusUpdate, admin: str = Depends(require_admin)):
    res = await db.contact_submissions.find_one_and_update(
        {"id": submission_id}, {"$set": {"status": body.status}}, projection={"_id": 0}, return_document=True)
    if not res:
        raise HTTPException(status_code=404, detail="Submission not found")
    return ContactSubmission(**res)


@api_router.delete("/contact/{submission_id}")
async def delete_contact(submission_id: str, admin: str = Depends(require_admin)):
    res = await db.contact_submissions.delete_one({"id": submission_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Submission not found")
    return {"deleted": True, "id": submission_id}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=False,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def create_indexes():
    await db.login_attempts.create_index("identifier", unique=True)
    await db.contact_submissions.create_index("created_at")
    await db.contact_events.create_index("ip")
    await db.contact_events.create_index("ts", expireAfterSeconds=86400)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
