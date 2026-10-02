// usage: node serve.mjs [port] [outDir]
// Serves the Next.js static export while honoring next.config's production
// basePath "/thecollab": requests to /thecollab/* are mapped to the same path
// without the prefix, exactly like GitHub Pages serves the repo subpath.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const port = Number(process.argv[2] ?? 3999);
const outDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', process.argv[3] ?? 'out');
const BASE = '/thecollab';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.glb': 'model/gltf-binary',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent((req.url ?? '/').split('?')[0]);
  if (urlPath.startsWith(BASE)) urlPath = urlPath.slice(BASE.length) || '/';
  if (urlPath === '/') urlPath = '/index.html';
  const file = path.join(outDir, path.normalize(urlPath).replace(/^(\.\.[/\\])+/, ''));
  if (!file.startsWith(outDir)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('404'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  });
});

server.listen(port, () => console.log(`Serving ${outDir} at http://localhost:${port} (basePath ${BASE} -> /)`));
