import http from 'node:http';
import {readFile} from 'node:fs/promises';

try { process.loadEnvFile(new URL('./.env', import.meta.url)); }
catch (error) { if (error.code !== 'ENOENT') throw error; }

const {default: waitlist} = await import('./lib/waitlist.mjs');
const html = new URL('./public/index.html', import.meta.url);
http.createServer(async (req, res) => {
  if (req.method === 'GET' && ['/', '/notlinear-v2-standalone.html'].includes(req.url)) {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(await readFile(html));
    return;
  }
  if (req.method === 'GET' && /^\/assets\/[a-f0-9-]+\.(js|woff2|woff|ttf)$/.test(req.url)) {
    try {
      const bytes = await readFile(new URL('./public' + req.url, import.meta.url));
      const ext = req.url.split('.').pop();
      res.writeHead(200, {'Content-Type': {js:'application/javascript',woff2:'font/woff2',woff:'font/woff',ttf:'font/ttf'}[ext]});
      res.end(bytes);
    } catch { res.writeHead(404); res.end(); }
    return;
  }
  if (req.url === '/api/waitlist') return waitlist(req, res);
  res.writeHead(404);
  res.end();
}).listen(Number(process.env.PORT || 3000));
