# CCNDM — Columban College Nursing Discipline Monitoring

CCNDM is a React + Vite student discipline portal with a Node.js + Express API and Supabase Postgres storage.

## Security model

- Login, password verification, reset, and role checks run on the backend.
- Sessions use an `HttpOnly` cookie; the frontend does not treat browser storage as proof of authentication.
- Frontend database reads and writes go through authenticated backend APIs.
- Broadcast announcement read state is stored per student, so one student cannot mark an announcement read for everyone.
- Student achievement awards are validated against the student's server-side records before they are stored.
- The backend uses the Supabase service-role key. Keep it in `backend/.env` or the backend host's secret store only; never use a `VITE_` prefix for it.
- Student registration is limited to existing profiles provisioned by an administrator. The registering student must provide the provisioned Student ID, name, and email.
- Password reset emails require SMTP settings in the backend environment.

## Prerequisites

- Node.js 20.19+ or 22.12+
- npm
- A Supabase project

## Local setup

1. Install dependencies:

   ```bash
   npm install
   npm install --prefix backend
   ```

2. Configure the backend by copying `backend/.env.example` to `backend/.env`. Set the Supabase URL and **service-role key**, generate a strong `AUTH_JWT_SECRET` (at least 32 bytes), and set `FRONTEND_URL` and `CORS_ORIGINS` to the frontend origin. To send confirmation and password-reset emails, set `BREVO_API_KEY` and the verified sender address in `BREVO_SENDER_EMAIL`; `BREVO_SENDER_NAME` is optional.

3. In development, the Vite server proxies `/api` requests to `http://localhost:5000`. Keep the frontend and backend running on localhost; no `VITE_API_URL` is needed for local development. This keeps the HttpOnly session cookie on the frontend's origin and allows it to survive page reloads.

4. Apply every SQL migration in `supabase/migrations` to the project, in filename order, before starting or publishing the backend. `202610160002_backend_only_database_access.sql` removes direct table/function access from browser roles, so apply it before exposing the backend APIs. The migrations are not run automatically by the app.

   The connected Supabase project was inspected before implementation. Row-level security was disabled on the core `students`, `admins`, `penalties`, and `notifications` tables at that time. The migrations have only been added to this repository; they have not been applied to the live database. Until they are applied, the database is not yet protected by the new backend-only access policy.

5. Start the frontend and backend in separate terminals:

   ```bash
   npm run dev
   npm run dev:backend
   ```

For Vercel, configure `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `AUTH_JWT_SECRET`, `FRONTEND_URL`, `BREVO_API_KEY`, and `BREVO_SENDER_EMAIL` in the project's environment variables. `AUTH_JWT_SECRET` must be at least 32 bytes and `BREVO_SENDER_EMAIL` must be verified with Brevo. For other production deployments, set `VITE_API_URL` to the deployed backend URL, configure the exact frontend origin in the backend's `FRONTEND_URL`/`CORS_ORIGINS`, and serve both over HTTPS so the session cookie is secure.

## Build and lint

```bash
npm run lint
npm run build
```
