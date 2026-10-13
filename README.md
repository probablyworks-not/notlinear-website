# notlinear website

Animated landing page with Google Sheets waitlist storage. The build extracts the standalone bundle into direct-render HTML and static assets, eliminating browser-side unpacking and the loading splash.

## Run locally

Use Node 22 or later. Copy `.env.example` to `.env`, add the private `WAITLIST_SECRET` matching the Apps Script property, and run `npm start`. Open http://localhost:3000.

## Deploy on Vercel

1. In Vercel, add a new project and import `probablyworks-not/notlinear-website`.
2. Use framework preset **Other**, root directory **.**, and the repository's build settings (`npm run build`, output `public`). The waitlist endpoint is a Node function at `/api/waitlist`.
3. Add private environment variables for Production (and Preview if you want preview signups):
   - `WAITLIST_SECRET`: the same value as the Apps Script property. Do not prefix with NEXT_PUBLIC_.
   - `WAITLIST_URL`: the deployment URL in `.env.example` (also configured as the server default).
   - `SITE_ORIGIN`: `https://notlinear.lol`.
4. Deploy. Under project Settings → Domains, add `notlinear.lol` and `www.notlinear.lol`.
5. Apply the exact DNS records shown by Vercel in BigRock. Wait for Vercel to verify both domains and provision HTTPS. Use Vercel's displayed values rather than guessing DNS targets.
6. Test a signup on the deployed site and confirm its row in Google Sheets. Repeating the email should not add another row.

Both custom domain origins and this project's Vercel deployment/production URLs are allowed by the API. Localhost is allowed only outside production. The static build contains only the landing page; `.env` and server files are not copied into public output.

For other Node hosting, use `npm start` and set `NODE_ENV=production`. GitHub Pages cannot run the waitlist backend.

## Waitlist

See [Apps Script setup](waitlist/SETUP.md). The configured Google Sheet records Datetime (Asia/Kolkata) and Email, with duplicates prevented. Success replaces the signup form only after Google confirms the save.

Never upload `.env` or put the secret in browser JavaScript.
