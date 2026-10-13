const waitlistUrl = process.env.WAITLIST_URL || 'https://script.google.com/macros/s/AKfycbztZfinAVgGd_vibAqmrsg14XCDd3KQbDKRkrdbB0TKuH9RmSNo2FTOKj81s1_Z_hLP/exec';
const allowedOrigins = new Set([
  'https://notlinear.lol',
  'https://www.notlinear.lol',
  ...(process.env.SITE_ORIGIN ? [process.env.SITE_ORIGIN] : []),
  ...[process.env.VERCEL_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL]
    .filter(Boolean).map(host => `https://${host}`),
]);
const send = (res, status, data) => {
  res.writeHead(status, {'Content-Type': 'application/json', 'Cache-Control': 'no-store'});
  res.end(JSON.stringify(data));
};
export default async function waitlist(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return send(res, 405, {ok: false});
  }
  const origin = req.headers.origin;
  const localOrigin = `http://localhost:${process.env.PORT || 3000}`;
  const allowLocal = process.env.NODE_ENV !== 'production' && origin === localOrigin;
  if (origin && !allowedOrigins.has(origin) && !allowLocal) return send(res, 403, {ok: false});
  if (!process.env.WAITLIST_SECRET) return send(res, 503, {ok: false});
  try {
    let body = req.body;
    if (body === undefined) {
      let raw = '';
      for await (const chunk of req) {
        raw += chunk;
        if (Buffer.byteLength(raw) > 2048) return send(res, 413, {ok: false});
      }
      body = raw;
    }
    if (typeof body === 'string') {
      if (Buffer.byteLength(body) > 2048) return send(res, 413, {ok: false});
      try { body = JSON.parse(body); } catch { return send(res, 400, {ok: false}); }
    }
    if (!body || typeof body !== 'object' || Array.isArray(body)) return send(res, 400, {ok: false});
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
}
