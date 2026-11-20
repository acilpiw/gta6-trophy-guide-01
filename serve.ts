// serve.ts — minimal static file server for local development.
//
// Usage:
//   node serve.ts              -> serves app/ at http://localhost:8080
//   node serve.ts --port 9000  -> same, on port 9000
//
// Node 22 standard library only. The server maps URL paths onto files inside
// app/, answers with the content types a browser needs for HTML/CSS/JS/JSON
// and images, refuses anything that resolves outside app/, and sends
// no-store caching headers so edits show up on reload. It is a development
// convenience for previewing the guide, not a production web server.

import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = resolve(fileURLToPath(new URL('./app', import.meta.url)));

function pickPort(argv: string[]): number {
  const at = argv.indexOf('--port');
  const candidate = at >= 0 ? Number(argv[at + 1]) : 8080;
  const valid = Number.isInteger(candidate) && candidate > 0 && candidate < 65536;
  return valid ? candidate : 8080;
}

const CONTENT_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
};

const server = createServer((req, res) => {
  let pathPart: string;
  try {
    pathPart = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
  } catch {
    res.writeHead(400).end('bad request');
    return;
  }
  if (pathPart.endsWith('/')) pathPart += 'index.html';

  const target = resolve(join(appRoot, normalize(pathPart)));
  const inside = target === appRoot || target.startsWith(appRoot + sep);
  if (!inside) {
    res.writeHead(403).end('forbidden');
    return;
  }

  let length: number;
  try {
    const info = statSync(target);
    if (!info.isFile()) throw new Error('directory');
    length = info.size;
  } catch {
    res.writeHead(404).end('not found');
    return;
  }

  res.writeHead(200, {
    'content-type': CONTENT_TYPES[extname(target).toLowerCase()] ?? 'application/octet-stream',
    'content-length': length,
    'cache-control': 'no-store',
  });
  createReadStream(target).pipe(res);
});

const port = pickPort(process.argv.slice(2));
server.listen(port, '127.0.0.1', () => {
  console.log(`Serving app/ at http://localhost:${port}`);
});
