# CCNDM — Columban College Nursing Discipline Monitoring

CCNDM is a React + Vite student discipline portal with a Node.js + Express API and Supabase Postgres storage.

## Security model

- Login, password verification, reset, and role checks run on the backend.
- Sessions use an `HttpOnly` cookie; the frontend does not treat browser storage as proof of authentication.
- Frontend database reads and writes go through authenticated backend APIs.
- Broadcast announcement read state is stored per student, so one student cannot mark an announcement read for everyone.
- Student achievement awards are validated against the student's server-side records before they are stored.
- The backend uses the Supabase service-role key. Keep it in `backend/.env` or the backend host's secret store only; never use a `VITE_` prefix for it.
- Student accounts are created by authenticated administrators in the admin dashboard; there is no public student registration.
- Each new account receives a one-time email invitation to set its password. Invitation links expire after 24 hours and can only be used once; students see their Student ID and password on their own screen before signing in.
- Active administrators can invite another administrator from the dashboard. The invited administrator sets her own password through a one-time, 24-hour link; the account remains inactive until setup is complete.
- Invitation and password-reset email delivery requires a configured provider in the backend environment.

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

2. Configure the backend by copying `backend/.env.example` to `backend/.env`. Set the Supabase URL and **service-role key**, generate a strong `AUTH_JWT_SECRET` (at least 32 bytes), and set `FRONTEND_URL` and `CORS_ORIGINS` to the frontend origin. To send account invitations and password-reset emails, configure Brevo's API (`BREVO_API_KEY` + verified `BREVO_SENDER_EMAIL`), Brevo SMTP (`BREVO_SMTP_LOGIN` + `BREVO_SMTP_KEY` + verified `BREVO_SENDER_EMAIL`), or Gmail SMTP (`GMAIL_USER` + `GMAIL_APP_PASSWORD`). In Brevo's SMTP settings, use the SMTP login and SMTP key—not the API key. `BREVO_SENDER_NAME` and `GMAIL_FROM_NAME` are optional.

3. In development, the Vite server proxies `/api` requests to `http://localhost:5050`. Keep the frontend and backend on localhost; no `VITE_API_URL` is needed for local development. This keeps the HttpOnly session cookie on the frontend's origin and allows it to survive page reloads.

4. Verify the migration history and security policies on the exact Supabase project before exposing the backend. Apply only reviewed migrations, in filename order, after taking a backup. `202610160002_backend_only_database_access.sql` removes direct table/function access from browser roles; migrations are not run automatically by the app. Repository files do not establish which migrations have been applied to a live project.

5. Start both the frontend and backend:

   ```bash
   npm run dev
   ```

   Alternatively, run `npm run dev:frontend` and `npm run dev:backend` in separate terminals.

## Production deployment

The repository is configured for Vercel: the frontend is built as a static Vite site and `/api/*` is handled by the Express function in `api/index.mjs`. For a same-origin Vercel deployment, leave `VITE_API_URL` unset so the frontend calls `/api` on its own origin.

Before deploying:

1. Select the correct Columban College production Supabase project and confirm its region, backup/restore coverage, and institutional data-protection requirements with the College.
2. Back up the database and review every migration in filename order. In particular, `202611050001_drop_unused_admin_logs.sql` drops `public.admin_logs` and permanently deletes its contents; do not apply it until the College has confirmed those records are no longer required or have been archived.
3. Apply and verify the approved migrations before publishing the matching backend. The app does not apply schema changes automatically. `202611080001_actionable_notifications.sql` adds the appeal links and per-administrator notification recipients required by actionable notifications.
4. Add these Vercel environment variables for the production environment:
   - `NODE_ENV=production`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-side only; never use a `VITE_` prefix)
   - `AUTH_JWT_SECRET` (at least 32 random bytes)
   - `FRONTEND_URL` (the canonical HTTPS site origin, with no path)
   - `CORS_ORIGINS` (comma-separated allowed HTTPS origins, with no paths)
   - One verified email provider configuration if invitations and password resets must be delivered.
5. If the `suggest-caption` Supabase Edge Function is used, configure `GEMINI_API_KEY` as a Supabase function secret. Do not put it in frontend or Vercel `VITE_` variables.
6. Deploy, then verify the public login pages, a direct page refresh, `/api/health`, administrator/student authentication, invitation and password-reset email delivery, and the College-approved database backup/restore process. `/api/health` confirms the API process and reports whether Supabase credentials are configured; it does not prove a live database connection. Do not use real student records for smoke tests.

For a separately hosted backend, set `VITE_API_URL` to its HTTPS URL and set `FRONTEND_URL`/`CORS_ORIGINS` to the exact HTTPS frontend origin(s). Ensure both services use HTTPS so the session cookie is secure. Preview deployments need their own approved origin and environment configuration; do not allow arbitrary preview domains in production CORS.

The additive `202611010001_preserve_data_relationships.sql` migration adds stable foreign-key columns and indexes for student-linked records without dropping tables or records. It backfills references that match current profiles and leaves unmatched historical rows in place with a null new reference. Apply this migration before deploying backend code that reads and writes the new relationship columns; keep a database backup and review the migration output first.

The `202611030001_admin_student_provisioning.sql` migration adds the student first-login password-change flag and the private invitation-token table. Apply it before deploying the account provisioning flow. In the admin dashboard, open **Students → Register Account** and provide the student's details. They will receive a one-time, 24-hour invitation email to choose a password.

The `202611030002_admin_invitations.sql` migration adds the private admin invitation-token table and pending-invitation flag. Apply it before deploying admin invitations. Signed-in active administrators can use **Dashboard → Invite Admin** to send a one-time invitation; the invitee sets her own password, and her account is activated only after setup.

The `202611080001_actionable_notifications.sql` migration adds appeal references to notifications and administrator-specific recipients. Apply it before deploying the linked notification workflow. Students can open their own appeal details from an appeal decision notification; administrators can open an appeal from its new-submission notification.

## Build and lint

```bash
npm run lint
npm run build
```
