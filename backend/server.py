from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import asyncio
import logging
import html
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Literal, Optional
import uuid
from datetime import datetime, timezone
import resend

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

app = FastAPI(title="L&A Gebäudereinigung API")
api_router = APIRouter(prefix="/api")

StatusType = Literal["new", "contacted", "closed"]


class ContactCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    phone: str = Field(min_length=5, max_length=40)
    email: EmailStr
    location: str = Field(min_length=2, max_length=160)
    service: str = Field(min_length=2, max_length=80)
    message: str = Field(default="", max_length=2000)
    language: str = Field(default="DE", max_length=2)


class ContactSubmission(ContactCreate):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: StatusType = "new"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class StatusUpdate(BaseModel):
    status: StatusType


class ContactResponse(BaseModel):
    submission: ContactSubmission
    email_sent: bool


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


@api_router.get("/")
async def root():
    return {"message": "L&A Gebäudereinigung API", "status": "ok"}


@api_router.post("/contact", response_model=ContactResponse)
async def create_contact(payload: ContactCreate):
    submission = ContactSubmission(**payload.model_dump())
    await db.contact_submissions.insert_one(submission.model_dump())
    sent = await send_notification(submission)
    return ContactResponse(submission=submission, email_sent=sent)


@api_router.get("/contact", response_model=List[ContactSubmission])
async def list_contacts():
    docs = await db.contact_submissions.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return [ContactSubmission(**d) for d in docs]


@api_router.patch("/contact/{submission_id}/status", response_model=ContactSubmission)
async def update_status(submission_id: str, body: StatusUpdate):
    res = await db.contact_submissions.find_one_and_update(
        {"id": submission_id}, {"$set": {"status": body.status}}, projection={"_id": 0}, return_document=True)
    if not res:
        raise HTTPException(status_code=404, detail="Submission not found")
    return ContactSubmission(**res)


@api_router.delete("/contact/{submission_id}")
async def delete_contact(submission_id: str):
    res = await db.contact_submissions.delete_one({"id": submission_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Submission not found")
    return {"deleted": True, "id": submission_id}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
