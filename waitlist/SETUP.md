# Google Sheets waitlist setup

1. Open the supplied Google Sheet, then Extensions → Apps Script. Paste `Code.gs` into the script editor.
2. In Project Settings → Script properties, add `WAITLIST_SECRET` with a long random value. Keep it private.
3. Deploy → New deployment → Web app. Execute as yourself and allow access to Anyone. Authorize access to the spreadsheet and copy the deployment URL ending in `/exec`. The endpoint checks the private secret before writing. The spreadsheet itself should remain private.
4. Set these server environment variables: `WAITLIST_URL` to that deployment URL, `WAITLIST_SECRET` to the same private value, and `SITE_ORIGIN` to your website origin (such as `https://notlinear.example`). Do not put the secret in HTML or commit it to source control.
5. For local development, copy `.env.example` to `.env` and enter the matching secret there. `.env` is ignored by Git and is read only by the server. Run `node server.mjs` with Node 22 or later. Open `http://localhost:3000` (omit SITE_ORIGIN locally). Deploy this Node server on your hosting service to use the same endpoint in production; static-only hosting needs an equivalent serverless route.

The target is tab gid=0 in the supplied sheet. An empty tab gets Datetime and Email headers automatically. A populated tab must already have those exact headers in A1:B1; other content is never overwritten. Datetime uses Asia/Kolkata. Duplicate emails return success without adding another row.

Verification after deployment: submit an email you control, confirm exactly one row in the sheet, then submit it again and confirm no additional row. Disconnect the endpoint and confirm the website displays an error. Live saving cannot be verified until the Apps Script is deployed and the server environment is configured.

Google deployment reference: https://developers.google.com/apps-script/guides/web
