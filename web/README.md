# FixWheel Web

Web app for FixWheel — shares **Supabase PostgreSQL** with the Android app via REST API.

## Setup (first time)

See **[../DATABASE_SETUP.md](../DATABASE_SETUP.md)** for Supabase (free cloud DB) setup.

```bash
cd web
cp .env.example .env.local
# Edit .env.local with Supabase DATABASE_URL and DIRECT_URL

npm install
npm run db:push
npm run db:import   # optional: migrate old CSV data
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (API + UI) |
| `npm run db:push` | Create/update tables in Supabase |
| `npm run db:import` | Import `data/*.csv` into Supabase |

## Architecture

- **Database:** Supabase PostgreSQL (cloud)
- **ORM:** Prisma
- **API:** `/api/customers`, `/api/mechanics`, `/api/auth/login`, `/api/mechanics/nearby`, etc.
- **Android:** `ApiClient.java` calls the same API endpoints

Local CSV files in `data/` are **no longer used at runtime** — only for optional one-time import.
