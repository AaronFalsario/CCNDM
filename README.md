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

2. Configure the backend by copying `backend/.env.example` to `backend/.env`. Set the Supabase URL and **service-role key**, generate a strong `AUTH_JWT_SECRET` (at least 32 bytes), and set `FRONTEND_URL` and `CORS_ORIGINS` to the frontend origin. To send account invitations and password-reset emails, configure Brevo's API (`BREVO_API_KEY` + verified `BREVO_SENDER_EMAIL`), Brevo SMTP (`BREVO_SMTP_LOGIN` + `BREVO_SMTP_KEY` + verified `BREVO_SENDER_EMAIL`), or Gmail SMTP (`GMAIL_USER` + `GMAIL_APP_PASSWORD`). In Brevo's SMTP settings, use the SMTP login and SMTP key—not the API key. `BREVO_SENDER_NAME` and `GMAIL_FROM_NAME` are optional.

3. In development, the Vite server proxies `/api` requests to `http://localhost:5000`. Keep the frontend and backend running on localhost; no `VITE_API_URL` is needed for local development. This keeps the HttpOnly session cookie on the frontend's origin and allows it to survive page reloads.

4. Apply every SQL migration in `supabase/migrations` to the project, in filename order, before starting or publishing the backend. `202610160002_backend_only_database_access.sql` removes direct table/function access from browser roles, so apply it before exposing the backend APIs. The migrations are not run automatically by the app.

   The connected Supabase project was inspected before implementation. Row-level security was disabled on the core `students`, `admins`, `penalties`, and `notifications` tables at that time. The migrations have only been added to this repository; they have not been applied to the live database. Until they are applied, the database is not yet protected by the new backend-only access policy.

5. Start the frontend and backend in separate terminals:

   ```bash
   npm run dev
   npm run dev:backend
   ```

For Vercel, configure `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `AUTH_JWT_SECRET`, `FRONTEND_URL`, and one of the email provider configurations described above in the project's environment variables. For Brevo SMTP use `BREVO_SMTP_LOGIN`, `BREVO_SMTP_KEY`, and `BREVO_SENDER_EMAIL`. `AUTH_JWT_SECRET` must be at least 32 bytes. For other production deployments, set `VITE_API_URL` to the deployed backend URL, configure the exact frontend origin in the backend's `FRONTEND_URL`/`CORS_ORIGINS`, and serve both over HTTPS so the session cookie is secure.

The additive `202611010001_preserve_data_relationships.sql` migration adds stable foreign-key columns and indexes for student-linked records without dropping tables or records. It backfills references that match current profiles and leaves unmatched historical rows in place with a null new reference. Apply this migration before deploying backend code that reads and writes the new relationship columns; keep a database backup and review the migration output first.

The `202611030001_admin_student_provisioning.sql` migration adds the student first-login password-change flag and the private invitation-token table. Apply it before deploying the account provisioning flow. In the admin dashboard, open **Students → Register Account** and provide the student's details. They will receive a one-time, 24-hour invitation email to choose a password.

The `202611030002_admin_invitations.sql` migration adds the private admin invitation-token table and pending-invitation flag. Apply it before deploying admin invitations. Signed-in active administrators can use **Dashboard → Invite Admin** to send a one-time invitation; the invitee sets her own password, and her account is activated only after setup.

## Build and lint

```bash
npm run lint
npm run build
```
