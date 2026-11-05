# HOPES Events

Bright Harbor Healthcare's public registration site for HOPES events at https://hopesevents.netlify.app.

## Events

- **Mommy & Me Photos:** Sunday, November 22, 2026, at Salt Bridge Farm, 1521 Silverton Road, Toms River, NJ. Fifteen 15-minute photo sessions start every 15 minutes from 9:00 a.m. through 12:30 p.m. Each registration receives 3–5 photos. A unique slot constraint prevents double booking.
- **Mommy & Me Music Class:** Wednesday, November 25, 2026, at 9:30 a.m. Ten registrations for one class, without individual appointment times. A unique spot constraint caps registrations at ten.

The homepage lists both events and shows current availability. Event pages collect first name, last name, email, and phone. Full photo times are disabled; music registration closes when all ten spots fill. The `/admin` page lets the two authorized staff members view registrants by event.

The previous URL, https://hopesphotos.netlify.app, is a separate Netlify project that permanently redirects all paths to the matching path on the current site.

## Netlify setup

This Next.js application uses `npm run build` and `.next` as its publish directory in `netlify.toml`. Netlify Database applies SQL migrations from `netlify/database/migrations/` on production deploys. The existing photo table is preserved when adding the music table.

The Netlify project needs these secret environment variables with Functions scope:

- `ADMIN_PASSWORD` — shared password for the two permitted admin emails.
- `SESSION_SECRET` — long, random secret for admin session signing.

Do not put the values in Git or `netlify.toml`.

## Local development

Requires Node.js 22.13 or newer. Install dependencies with `npm ci`, then run `npm run dev` for the frontend. Use `netlify dev` and `netlify database migrations apply` for local database-backed routes. Run `npm run typecheck` and `npm run build` before deploying.
