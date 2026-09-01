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

## Implemented (2026-09, iteration 3)
- **Login throttle**: 5 failed logins per IP+email → 15-min lockout (429 + Retry-After, `login_attempts` Mongo collection, unique index). 401 messages include attempts left; success clears counter. Admin UI shows red locked banner.
- **Google Reviews strip**: `components/Testimonials.jsx` — auto-scrolling review-card marquee + Google rating badge; data in `config/site.js` REVIEWS (6 DEMO quotes, bilingual). Nav/footer link "Referenzen/Reviews" (#reviews).
- **Real-website readiness**: `SITE.isDemo` flag hides all demo badges/fill-demo button when false; legal pages (Impressum/Datenschutz) now pull address/phone/email/owner/VAT from `SITE`; SEO meta/og tags + favicon in `public/index.html`.
- **Live email ON**: real `RESEND_API_KEY` in backend `.env` → `POST /api/contact` returns `email_sent: true`; sender `onboarding@resend.dev` → only delivers to the Resend account owner's inbox until a domain is verified.
- Tested end-to-end (iteration_3: backend 21/21, frontend all pass).

## Backlog
- P0: User still needs to supply REAL phone/email/address/owner/VAT → edit `src/config/site.js`, then set `isDemo: false`
- P1: Verify own domain on Resend and set `SENDER_EMAIL` to e.g. `anfrage@la-gebaeudereinigung.de`; replace demo REVIEWS with real Google quotes
- P2: service-area map

## Security Hardening (2026-06, iteration 4 — post audit)
Security audit verdict was CONDITIONAL PASS. Applied & verified (backend 24/24, frontend 100%, iteration_4.json):
- **SEC-001 contact-form abuse (was MEDIUM)**: `POST /api/contact` now rate-limited to 10 submissions/hour per client IP (`contact_events` Mongo collection, 24h TTL index) → 429 + Retry-After beyond that. Added a **honeypot** field (`website`) — non-empty ⇒ silently dropped (not stored, no email). Added a **daily email cap** (500/day) that skips dispatch when exceeded. Honeypot `website` never stored/returned (`exclude=True` on ContactSubmission).
- **Login throttle bypass (LOW)**: `client_ip()` now derives the client IP from the trusted-proxy hop count (`TRUSTED_PROXY_HOPS` env, default 1) taken from the right of `X-Forwarded-For`, instead of the raw spoofable header.
- **Timing side channel (LOW)**: login now runs a bcrypt comparison against a dummy hash on the wrong-email path → constant-time, no longer reveals a valid admin email.
- **CORS (LOW)**: `allow_credentials=False` (app uses bearer tokens, not cookies) → removes the wildcard-origin-with-credentials misconfig.
- NOT done (deferred, needs user input / bigger change): CAPTCHA (needs a site key), moving JWT out of localStorage into an HttpOnly cookie, rotating secrets to a managed store.

## Implemented (2026-06, iteration 4)
- **Customer auto-reply email**: `POST /api/contact` now also sends a branded, bilingual (DE/EN by `language`) confirmation email to the requester via Resend (`send_customer_confirmation` + `build_customer_email_html`). Response gains `confirmation_sent: bool`. NOTE: with sender `onboarding@resend.dev` the confirmation only actually reaches the Resend account owner's inbox (and Resend test addresses) until a domain is verified — same limitation as the admin notification.
- **Service detail modals**: clicking any service card opens a shadcn Dialog (`ServiceModal` in `Services.jsx`) showing scope of work, pricing model and typical properties, plus a CTA that scrolls to the contact form. Bilingual content lives in `translations.js` under `services.details[key]` + `services.modal_*` labels. Cards no longer scroll straight to contact.
- Self-tested: curl → `email_sent:true, confirmation_sent:true`; screenshot confirmed modal renders and CTA present.
