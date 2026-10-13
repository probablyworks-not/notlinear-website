import http from 'node:http';
import {readFile} from 'node:fs/promises';

// Load local configuration without placing private values in browser code.
try { process.loadEnvFile(new URL('./.env', import.meta.url)); }
catch (error) { if (error.code !== 'ENOENT') throw error; }

const waitlistUrl = process.env.WAITLIST_URL || 'https://script.google.com/macros/s/AKfycbztZfinAVgGd_vibAqmrsg14XCDd3KQbDKRkrdbB0TKuH9RmSNo2FTOKj81s1_Z_hLP/exec';
const allowedOrigins = new Set([
  'https://notlinear.lol',
  'https://www.notlinear.lol',
  ...(process.env.SITE_ORIGIN ? [process.env.SITE_ORIGIN] : []),
]);
const html = new URL('./notlinear-v2-standalone.html', import.meta.url);
const send = (res, status, data) => {
  res.writeHead(status, {'Content-Type': 'application/json', 'Cache-Control': 'no-store'});
  res.end(JSON.stringify(data));
};
http.createServer(async (req, res) => {
  if (req.method === 'GET' && ['/', '/notlinear-v2-standalone.html'].includes(req.url)) {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(await readFile(html));
    return;
  }
  if (req.method !== 'POST' || req.url !== '/api/waitlist') return send(res, 404, {ok: false});
  const origin = req.headers.origin;
  const localOrigin = `http://localhost:${process.env.PORT || 3000}`;
  const allowLocal = process.env.NODE_ENV !== 'production' && origin === localOrigin;
  if (origin && !allowedOrigins.has(origin) && !allowLocal) return send(res, 403, {ok: false});
  if (!process.env.WAITLIST_SECRET) return send(res, 503, {ok: false});
  try {
    let raw = '';
    for await (const chunk of req) {
      raw += chunk;
      if (Buffer.byteLength(raw) > 2048) return send(res, 413, {ok: false});
    }
    let body;
    try { body = JSON.parse(raw); } catch { return send(res, 400, {ok: false}); }
    const email = String(body.email || '').trim().toLowerCase();
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || /^[=+\-@]/.test(email)) return send(res, 400, {ok: false});
    const upstream = await fetch(waitlistUrl, {
      method: 'POST', headers: {'Content-Type': 'text/plain;charset=utf-8'},
      body: JSON.stringify({email, secret: process.env.WAITLIST_SECRET}),
      signal: AbortSignal.timeout(20000),
    });
    const result = await upstream.json();
    if (!upstream.ok || result.ok !== true) throw new Error('Save failed');
    send(res, 200, {ok: true});
  } catch (_) { send(res, 502, {ok: false}); }
}).listen(Number(process.env.PORT || 3000));
