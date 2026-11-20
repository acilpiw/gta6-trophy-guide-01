// serve.ts — tiny static server for previewing the guide locally.
//
//   node serve.ts               serves app/ at http://localhost:8080
//   node serve.ts --port 9000   serves app/ at http://localhost:9000
//
// Node 22 standard library only. Behaviour, briefly: URL paths resolve to
// files inside app/ (a trailing slash means index.html), anything resolving
// outside app/ is refused, replies carry the content type a browser expects
// for the file's extension, and caching is disabled so edits appear on a
// plain reload. This is a development convenience, not a production server.

import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = resolve(fileURLToPath(new URL('./app', import.meta.url)));

function portFromArgs(argv: string[]): number {
  const flagAt = argv.indexOf('--port');
  const parsed = flagAt >= 0 ? Number(argv[flagAt + 1]) : 8080;
  const usable = Number.isInteger(parsed) && parsed > 0 && parsed < 65536;
  return usable ? parsed : 8080;
}

const MIME: Record<string, string> = {
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

function resolveInsideApp(urlPath: string): string | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    return null;
  }
  if (decoded.endsWith('/')) decoded += 'index.html';
  const candidate = resolve(join(appDir, normalize(decoded)));
  const inside = candidate === appDir || candidate.startsWith(appDir + sep);
  return inside ? candidate : null;
}

const server = createServer((req, res) => {
  const pathname = new URL(req.url ?? '/', 'http://localhost').pathname;
  const target = resolveInsideApp(pathname);
  if (target === null) {
    res.writeHead(403).end('forbidden');
    return;
  }

  let size: number;
  try {
    const info = statSync(target);
    if (!info.isFile()) throw new Error('not a file');
    size = info.size;
  } catch {
    res.writeHead(404).end('not found');
    return;
  }

  res.writeHead(200, {
    'content-type': MIME[extname(target).toLowerCase()] ?? 'application/octet-stream',
    'content-length': size,
    'cache-control': 'no-store',
  });
  createReadStream(target).pipe(res);
});

const port = portFromArgs(process.argv.slice(2));
server.listen(port, '127.0.0.1', () => {
  console.log(`Serving app/ at http://localhost:${port}`);
});
