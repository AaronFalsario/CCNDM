# CCNDM — Columban College Nursing Discipline Monitoring

A React + Vite web app for tracking student disciplinary records and community service hours.

## Features

- **Student portal** — login, view penalties, submit appeals, service schedule, progress tracking, achievements
- **Admin dashboard** — manage students, penalties, appeals, announcements, activity log, analytics, and reports
- **AI-assisted announcements** — auto-generated captions via Supabase Edge Function
- **Dark mode** with independent preferences for student and admin portals
- **Responsive layout** — works on desktop, tablet, and mobile

## Tech Stack

**Frontend**
- React 18 + Vite
- Tailwind CSS
- React Router
- Supabase (auth + database + storage)

**Backend**
- Node.js + Express (see [`/backend`](./backend))
- Supabase (Postgres)
- Supabase Edge Functions (AI captioning)

## Prerequisites

- Node.js **18 or newer**
- A Supabase project ([create one free](https://supabase.com))
- npm or yarn

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/AaronFalsario/CCNDM.git
cd CCNDM
