# PRD – L&A Gebäudereinigung Demo Website

## Original Problem Statement
Create a professional demo website for a cleaning company based on its logo (L&A Gebäudereinigung – Clean Service). Homepage sections: About/Intro, Services, How It Works, Advantages, FAQ, Contact. Include a form with demo data (phone, email, location) and placeholders to replace with real data. Awwwards-level craft: kinetic hero with masked line reveal, treated photography, numbered manifesto chapters, editorial marquee, framer-motion reveals, Lenis smooth scroll, parallax/3D hero moment.

## User Choices
- Bilingual DE/EN toggle
- Contact form: save to DB + email notification (Resend)
- Light, clean & corporate theme
- Landing page + simple submissions list at /admin

## Architecture
- Frontend: React 19 + Tailwind + shadcn/ui, framer-motion, lenis, sonner, react-router
  - `src/config/site.js` – ALL placeholder company data (phone, email, address, hours, demo form data, images)
  - `src/i18n/translations.js` + `LanguageContext.jsx` – DE/EN dictionary, persisted in localStorage
  - `src/components/*` – Navbar, Hero (3D tilt + squeegee wipe), Marquee, About (chapters + counters), Services (bento), HowItWorks, Advantages, FAQ, Contact, Footer
  - `src/pages/Home.jsx`, `src/pages/Admin.jsx`
- Backend: FastAPI + MongoDB (motor), Resend (optional)
  - `POST /api/contact`, `GET /api/contact`, `PATCH /api/contact/{id}/status`, `DELETE /api/contact/{id}`
  - Env: `RESEND_API_KEY`, `SENDER_EMAIL`, `NOTIFY_EMAIL` (empty → email skipped, `email_sent: false`)

## User Personas
- Facility manager / property owner requesting a cleaning quote
- L&A staff reviewing leads at /admin

## Implemented (2026-06)
- Full bilingual landing page with all requested sections & animations
- Contact form with demo-data fill, validation, DB persistence, toast feedback
- Admin dashboard: stats, search, service filter, status change, delete, CSV export
- Tested end-to-end (iteration_1: all pass)

## Implemented (2026-09)
- **Admin Login gate**: `/admin` now requires JWT auth. Backend `POST /api/auth/login` + `GET /api/auth/me`; contact GET/PATCH/DELETE protected via `require_admin` (Bearer). POST /api/contact stays public. Password bcrypt-hashed at runtime from `ADMIN_PASSWORD` env; token in localStorage `la_admin_token`. Creds: jonlipaj23@gmail.com / LAClean2026! (see test_credentials.md).
- **Email notifications wired ON**: `NOTIFY_EMAIL=jonlipaj23@gmail.com`. `RESEND_API_KEY` still empty → live sending OFF (email_sent=false), form submission unaffected. Add a `re_...` key to go live.
- **Legal pages**: bilingual `/impressum`, `/datenschutz`, `/agb` (`pages/Legal.jsx`, content in translations `legal`), linked from footer via router Links. Contains demo placeholder legal text.
- **Before/After gallery**: `components/BeforeAfter.jsx` — draggable comparison slider + 3 tabs (office/glass/stairwell), AI-generated demo photos in `config/site.js` BEFORE_AFTER.
- Tested end-to-end (iteration_2: backend 19/19, frontend 100%, no issues). Backend pytest at `/app/backend/tests/backend_test.py`.

## Backlog
- P0: Add real Resend API key to `/app/backend/.env` to enable live email sending
- P1: Replace placeholder data in `src/config/site.js` and demo legal text with real content
- P2: Add brute-force throttle / rate limit on `/api/auth/login`; service detail modals; testimonials
