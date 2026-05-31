# FixWheel — Shared cloud database setup

Web and Android now use **one database**: **Supabase PostgreSQL** (free tier).

```
Android app  ──HTTP──►  Web API (Next.js)  ──►  Supabase PostgreSQL
Web browser  ──HTTP──►  Web API (Next.js)  ──►  Supabase PostgreSQL
```

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

## Step 3: Configure the web app

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
npm run db:import
npm run dev
```

- `db:push` creates `Customer` and `Mechanic` tables in Supabase.
- `db:import` (optional) copies existing rows from `web/data/*.csv` into the cloud DB.

---

## Step 4: Configure the Android app

1. Open `APP/FixWheelConfig.java`.
2. Set `API_BASE_URL` to your web server:
   - **Emulator + PC running `npm run dev`:** `http://10.0.2.2:3000`
   - **Physical phone (same Wi‑Fi):** `http://YOUR_PC_LAN_IP:3000` (e.g. `http://192.168.1.5:3000`)
   - **Deployed web app:** `https://your-app.vercel.app`

3. In **AndroidManifest.xml** (your full Android Studio project), add:

```xml
<uses-permission android:name="android.permission.INTERNET" />

<application
    android:networkSecurityConfig="@xml/network_security_config"
    ...>
```

`APP/res/xml/network_security_config.xml` is included for local HTTP during development.

4. Register activities in **AndroidManifest.xml** (inside `<application>`):

```xml
<activity android:name=".MechanicHomeActivity" />
<activity android:name=".MechanicPickLocationActivity" />
<activity android:name=".MapActivity" />
<activity android:name=".ServiceSelectionActivity" />
```

Mechanic login opens **MechanicHomeActivity** (bookings inbox). Customer login opens **MapActivity**.

The Android app uses the same booking APIs as the web app (`/api/bookings`, accept/counter/complete/cancel).

---

## Step 5: Verify

1. Register a **customer on web** → log in on **Android** with same name + CNIC → should work.
2. Register a **mechanic on Android** → appear in web map / nearby search.

---

## Free tier notes (Supabase)

- 500 MB database, 50k monthly active users — enough for development and small production.
- Project pauses after ~1 week of inactivity on free tier; wake it from the Supabase dashboard.

---

## Deploy web API (optional, for Android without PC)

Deploy `web/` to [Vercel](https://vercel.com):

1. Push repo to GitHub.
2. Import project in Vercel, set root to `web`.
3. Add `DATABASE_URL` and `DIRECT_URL` in Vercel **Environment Variables**.
4. Set Android `API_BASE_URL` to your Vercel URL (`https://...`).
