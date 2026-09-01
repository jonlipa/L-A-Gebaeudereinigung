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

## Backlog
- P0: Add real Resend API key + NOTIFY_EMAIL to enable email notifications
- P1: Replace placeholder data in `src/config/site.js`; add Impressum/Datenschutz pages
- P1: Protect /admin with a simple password
- P2: Service detail modals, testimonials, before/after gallery
