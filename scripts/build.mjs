import {mkdir, readFile, writeFile, rm} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';

const source = await readFile('notlinear-v2-standalone.html', 'utf8');
const readBundle = name => {
  const match = source.match(new RegExp(`<script type="__bundler/${name}">\\s*([\\s\\S]*?)\\s*</script>`));
  if (!match) throw new Error(`Missing ${name} bundle`);
  return JSON.parse(match[1]);
};
const manifest = readBundle('manifest');
let html = readBundle('template');
if (/<iframe\b/i.test(html)) throw new Error('Nested pages require explicit extraction');
await rm('public', {recursive: true, force: true});
await mkdir('public/assets', {recursive: true});
const extensions = {'application/javascript':'js', 'font/woff2':'woff2', 'font/woff':'woff', 'font/ttf':'ttf'};
for (const [id, entry] of Object.entries(manifest)) {
  if (!/^[a-f0-9-]+$/.test(id) || !extensions[entry.mime]) throw new Error('Unsupported bundle asset');
  const filename = `${id}.${extensions[entry.mime]}`;
  let bytes = Buffer.from(entry.data, 'base64');
  if (entry.compressed) bytes = gunzipSync(bytes);
  await writeFile(`public/assets/${filename}`, bytes);
  html = html.split(id).join(`/assets/${filename}`);
}
html = html.replace(/\s+integrity="[^"]*"/gi, '').replace(/\s+crossorigin="[^"]*"/gi, '');
html = html.replace(/<script src="(\/assets\/[^\"]+)"/g, '<script defer src="$1"');
if (html.includes('__bundler') || html.includes('Unpacking...')) throw new Error('Loader remains in output');
await writeFile('public/index.html', html);
console.log(`Built direct-render HTML (${Buffer.byteLength(html)} bytes) and ${Object.keys(manifest).length} static assets.`);
