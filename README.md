# Portfolio — Next.js + Express + MongoDB

```
backend/   Express API, MongoDB (Mongoose), JWT admin auth
frontend/  Next.js 14 (App Router) site + /admin panel
```

## Run locally
**1. Backend**
```bash
cd backend && cp .env.example .env     # set MONGODB_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm install && npm run seed && npm run dev   # http://localhost:5000
```
**2. Frontend**
```bash
cd frontend && cp .env.local.example .env.local
npm install && npm run dev                   # http://localhost:3000
```
Sign in at `/admin/login` with the email/password from `.env`.

## What the admin can manage
Notes (upcoming / in-progress / published, markdown), Case studies, Interview questions, Skills.
Public pages: `/`, `/notes`, `/notes/:slug`, `/case-studies`, `/case-studies/:slug`, `/interview-prep`.
Public pages revalidate every 30 seconds, so changes appear without a rebuild.

## Deploy
- Backend: Render / Railway / VPS. Set env vars; `FRONTEND_URL` = your Vercel URL (comma-separate multiple).
- Database: MongoDB Atlas.
- Frontend: Vercel, with `NEXT_PUBLIC_API_URL=https://<your-api>/api`.
- Add your resume at `frontend/public/resume.pdf` and your email in `frontend/lib/content.js`.
