-- Run in Supabase SQL Editor if npm run db:push fails
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "mechanicCompleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "customerCompleted" BOOLEAN NOT NULL DEFAULT false;
