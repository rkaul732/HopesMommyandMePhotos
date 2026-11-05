# HOPES Events

Bright Harbor Healthcare's public registration site for HOPES events at https://hopesevents.netlify.app.

## Public registration

- The homepage lists active events. Each event has its own registration link.
- Mommy & Me Photos remains on November 22, 2026 at Salt Bridge Farm, 1521 Silverton Road, Toms River, NJ, with fifteen 15-minute appointments and 3–5 photos per registration.
- Mommy & Me Music Class remains on November 25, 2026 at 9:30 a.m., hosted by The Harmony Nest, with ten total places.
- Registrants enter first name, last name, email, and phone. Full appointment times are unavailable; capped general events close at capacity. Deactivated events disappear from the homepage and their direct links stop accepting registrations.

## Admin

Tonya Molhem and Rebecca Kaul can sign in at `/admin` to view registrants by event. The **Create New Registration / Manage Events** link opens `/admin/events`, where they can create a registration link, deactivate an event, or reactivate one. Event creation asks for title, date, address, registration type, optional times for general attendance, required start/end times and appointment length for appointments, and an optional whole-number total registration cap. Each appointment time accepts one registration.

The existing photo and music registrations remain in their original tables. New events use `events` and `event_registrations`; the SQL migration seeds the original two events for management without moving their registrants. A row lock and unique appointment index enforce limits during simultaneous submissions.

The previous URL, https://hopesphotos.netlify.app, is a separate Netlify project that permanently redirects all paths to the matching path on the current site.

## Netlify setup

This Next.js application uses `npm run build` and `.next` as its publish directory in `netlify.toml`. Netlify Database applies SQL migrations from `netlify/database/migrations/` on production deploys.

The Netlify project needs these secret environment variables with Functions scope:

- `ADMIN_PASSWORD` — shared password for the two permitted admin emails.
- `SESSION_SECRET` — long, random secret for admin session signing.

Do not put the values in Git or `netlify.toml`.

## Local development

Requires Node.js 22.13 or newer. Install dependencies with `npm ci`, then run `netlify dev` for the full site and `netlify database migrations apply` for the local database. Run `npm run typecheck` and `npm run build` before deploying.
