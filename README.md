# notlinear website

Animated landing page with Google Sheets waitlist storage.

## Run locally

Use Node 22 or later. Copy `.env.example` to `.env`, add the private `WAITLIST_SECRET` matching the Apps Script property, and run `npm start`. Open http://localhost:3000.

## Production

Deploy this repository to a Node hosting service. Start command: `npm start`. Set `NODE_ENV=production`, `SITE_ORIGIN=https://notlinear.lol`, `WAITLIST_URL` (see `.env.example`), and `WAITLIST_SECRET` in the host's private environment settings. The host provides `PORT`.

Point notlinear.lol to that host using its domain/DNS instructions and enable HTTPS. Both https://notlinear.lol and https://www.notlinear.lol are allowed by the waitlist backend.

GitHub Pages serves static files and cannot run this Node backend. Publishing this repository does not itself deploy the website.

## Waitlist

See [Apps Script setup](waitlist/SETUP.md). The configured Google Sheet records Datetime (Asia/Kolkata) and Email, with duplicates prevented. Success replaces the signup form only after Google confirms the save.

Never upload `.env` or put the secret in browser JavaScript.
