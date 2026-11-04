# HOPES Mommy & Me Photos

Bright Harbor Healthcare's registration site for the HOPES Mommy & Me photo sessions.

## Features

- Fifteen 15-minute appointments starting every 15 minutes from 9:00 a.m. to 12:30 p.m. Eastern Time. The last session ends at 12:45 p.m.
- Photo day is Sunday, November 22, 2026, at Salt Bridge Farm, 1521 Silverton Road, Toms River, NJ. Everyone who registers receives 3–5 photos.
- Registration with first name, last name, email, and phone.
- Netlify Database stores reservations. A unique database constraint prevents two bookings for one slot.
- Occupied slots show as **Full**.
- Tonya Molhem and Rebecca Kaul can sign in to view registrants.

## Netlify setup

The site is a Next.js application with `npm run build` and `.next` as its publish directory, configured in `netlify.toml`. Netlify Database uses the SQL migration in `netlify/database/migrations/`.

Set these secret environment variables in the Netlify project, with scope including Functions:

- `ADMIN_PASSWORD` — the shared password for the two permitted admin emails.
- `SESSION_SECRET` — a long, random secret used to sign admin sessions.

Do not put their values in Git or `netlify.toml`. Netlify must apply the database migration before registration can accept bookings.

## Local development

Requires Node.js 22.13 or newer. Install dependencies with `npm ci`, then run `npm run dev` for the frontend. To exercise database-backed routes locally, use Netlify CLI's `netlify dev` and `netlify database migrations apply`.

Run `npm run build` and `npm run typecheck` before deploying.
