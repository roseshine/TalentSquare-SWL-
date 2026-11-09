/** Loopback-only frontend host. Real account and competition APIs belong to Django. */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = fs.realpathSync(__dirname);
const PORT = Number(process.env.PORT || 8000);
const assets = new Map([
  ['/index.html', 'text/html; charset=utf-8'], ['/app.js', 'application/javascript; charset=utf-8'],
  ['/data.js', 'application/javascript; charset=utf-8'], ['/pages.js', 'application/javascript; charset=utf-8'],
  ['/workspaces.js', 'application/javascript; charset=utf-8'], ['/styles.css', 'text/css; charset=utf-8']
]);
const pages = new Set(['/', '/login', '/signup', '/forgot-password', '/competitions', '/job-fairs', '/rankings', '/workspace', '/admin', '/help', '/privacy', '/terms', '/organizer/competitions/new', '/preview/access-denied', '/preview/loading']);
const retired = {success: false, code: 'django_api_required', detail: 'Legacy account and competition APIs are disabled. Real account operations and competition submissions are handled by Django on the configured backend. No account action was performed.'};

function safePath(raw) {
  if (!raw.startsWith('/') || raw.startsWith('//') || /[\x00-\x1f\x7f]/.test(raw)) return null;
  let value;
  try { value = decodeURIComponent(raw.split('?')[0]); } catch { return null; }
  if (/[\x00-\x1f\x7f\\%]/.test(value) || value.includes('//') || value.split('/').some(p => p === '.' || p === '..')) return null;
  return value;
}
const server = http.createServer((req, res) => {
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Cache-Control', 'no-store');
  // No frontend cross-origin API is needed. Do not reflect Origin or allow '*'.
  const json = (status, data, allow) => {
    // None of these routes read password-bearing request bodies or write storage.
    req.resume();
    res.shouldKeepAlive = false;
    res.setHeader('Connection', 'close');
    if (allow) res.setHeader('Allow', allow);
    const body = status === 204 ? '' : JSON.stringify(data);
    res.writeHead(status, {'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(body)});
    res.end(req.method === 'HEAD' ? undefined : body);
  };
  if (!/^(127\.0\.0\.1|localhost)(:[0-9]+)?$/i.test(req.headers.host || '')) return json(421, {detail: 'Use the loopback frontend address.'});
  const pathname = safePath(req.url);
  if (pathname === null) return json(404, {detail: 'Not found.'});
  if (pathname === '/api/auth' || pathname.startsWith('/api/auth/') || pathname === '/api/competitions' || pathname.startsWith('/api/competitions/')) return json(410, retired);
  if (pathname.startsWith('/api/')) {
    const previews = {
      '/api/health': {status: 'online', service: 'Talent Square local frontend', authentication: 'Django only'},
      '/api/job-fairs': {success: true, demo: true, detail: 'Job fairs are sample previews only.', totalFairs: 4},
      '/api/rankings': {success: true, demo: true, detail: 'Rankings are sample previews only.', categories: ['Global', 'Algorithm', 'Hackathon', 'UI/UX & Design', 'AI & Data Science']}
    };
    if (!Object.hasOwn(previews, pathname)) return json(404, {detail: 'Unknown frontend API. Real APIs are served by Django.'});
    if (!['GET', 'HEAD'].includes(req.method)) return json(405, {detail: 'Read-only frontend endpoint.'}, 'GET, HEAD');
    return json(200, previews[pathname]);
  }
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return json(405, {detail: 'Frontend pages are read-only.'}, 'GET, HEAD, OPTIONS');
  if (req.method === 'OPTIONS') return json(204, {}, 'GET, HEAD, OPTIONS');
  const page = pathname.replace(/\/+$/, '') || '/';
  const asset = pages.has(page) || /^\/(?:(?:competitions|job-fairs)\/[A-Za-z0-9_-]+|profiles\/[0-9]+)$/.test(page) ? '/index.html' : pathname;
  if (!assets.has(asset)) return json(404, {detail: 'Not found.'});
  const file = path.join(ROOT, asset.slice(1));
  fs.realpath(file, (err, real) => {
    if (err || path.dirname(real) !== ROOT) return json(404, {detail: 'Not found.'});
    fs.readFile(real, (error, content) => {
      if (error) return json(404, {detail: 'Not found.'});
      res.writeHead(200, {'Content-Type': assets.get(asset), 'Content-Length': content.length});
      res.end(req.method === 'HEAD' ? undefined : content);
    });
  });
});
server.requestTimeout = 15000;
server.headersTimeout = 10000;
server.listen(PORT, '127.0.0.1', () => console.log(`Talent Square frontend: http://127.0.0.1:${server.address().port} (Django API required)`));
