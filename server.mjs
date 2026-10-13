import http from 'node:http';
import {readFile} from 'node:fs/promises';

try { process.loadEnvFile(new URL('./.env', import.meta.url)); }
catch (error) { if (error.code !== 'ENOENT') throw error; }

const {default: waitlist} = await import('./lib/waitlist.mjs');
const html = new URL('./notlinear-v2-standalone.html', import.meta.url);
http.createServer(async (req, res) => {
  if (req.method === 'GET' && ['/', '/notlinear-v2-standalone.html'].includes(req.url)) {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(await readFile(html));
    return;
  }
  if (req.url === '/api/waitlist') return waitlist(req, res);
  res.writeHead(404);
  res.end();
}).listen(Number(process.env.PORT || 3000));
