# FixWheel — Web app & database setup

FixWheel is a **Next.js web app** backed by **Supabase PostgreSQL** (free tier).

```
Web browser  ──HTTP──►  Next.js API (Vercel)  ──►  Supabase PostgreSQL
```

**Live site:** [https://fixwheel-black.vercel.app](https://fixwheel-black.vercel.app)

---

## Step 1: Create Supabase project (free)

1. Go to [https://supabase.com](https://supabase.com) and sign up.
2. **New project** → choose a name, password, region (e.g. Singapore closest to Pakistan).
3. Wait until the project is ready.

---

## Step 2: Get connection strings

1. In Supabase: **Project Settings → Database**.
2. Under **Connection string**, choose **URI**.
3. Copy **Transaction pooler** (port **6543**) → this is `DATABASE_URL`.
4. Copy **Direct connection** (port **5432**) → this is `DIRECT_URL`.
5. Replace `[YOUR-PASSWORD]` with your database password.

---

## Step 3: Configure the web app locally

Create `web/.env.local`:

```env
DATABASE_URL="postgresql://postgres.xxxx:YOUR_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxxx:YOUR_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

Then run:

```bash
cd web
npm install
npm run db:push
npm run dev
```

- `db:push` creates `Customer`, `Mechanic`, and `Booking` tables in Supabase.
- `npm run db:wipe` — delete all customers, mechanics, and bookings (use with care).

---

## Step 4: Deploy to Vercel

1. Push this repo to GitHub.
2. In [Vercel](https://vercel.com) → **Add New Project** → import the repo.
3. Set **Root Directory** to `web`.
4. Add environment variables: `DATABASE_URL` and `DIRECT_URL` (same values as `.env.local`).
5. Deploy. Each push to `main` triggers a new production deployment.

---

## Free tier notes (Supabase)

- 500 MB database — enough for development and small production.
- Project may pause after inactivity on free tier; wake it from the Supabase dashboard.
