# HOPES Mommy & Me Photos

Registration site for Bright Harbor Healthcare's HOPES Mommy & Me photo sessions.

## What it does

- Offers 15 appointments from 9:00 a.m. to 1:00 p.m. Eastern Time, spaced 16 minutes apart.
- Collects first name, last name, email, and phone number.
- Stores registrations in Cloudflare D1. A unique database index prevents two registrations for the same time, including simultaneous requests.
- Shows occupied times as **Full**.
- Gives Tonya Molhem and Rebecca Kaul an admin sign-in and a view of registrations.

The event date is displayed as **To be announced** until the HOPES program confirms it. Update the date in `app/page.tsx` and redeploy when known.

## Local development

Requires Node.js 22.13 or newer.

```sh
npm ci
npm run db:generate
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_cooing_sentinel.sql
npm run dev
```

The published site uses Sites D1 and two secret runtime variables: `ADMIN_PASSWORD` and `SESSION_SECRET`. Set those in the Sites runtime configuration. Never commit their values to this repository.

## Deployment

This repository is a source copy. The running site is deployed through OpenAI Sites using the configuration in `.openai/hosting.json`. Source changes need to be published through the Sites workflow.
