const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.resolve(__dirname);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.ico': 'image/x-icon'
};

function send404(res) {
  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end('404 Not Found');
}

function serveFile(filePath, res) {
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) return send404(res);
    const ext = path.extname(filePath).toLowerCase();
    const type = MIME[ext] || 'application/octet-stream';
    res.statusCode = 200;
    res.setHeader('Content-Type', type);
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
    stream.on('error', () => send404(res));
  });
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url || '/');
  let pathname = decodeURIComponent(parsed.pathname);
  if (pathname.includes('..')) return send404(res);
  if (pathname === '/' || pathname.endsWith('/')) pathname = path.join(pathname, 'index.html');

  const filePath = path.join(PUBLIC_DIR, pathname);

  // If path has no extension, try to serve index.html (SPA-friendly)
  if (!path.extname(filePath)) {
    const tryIndex = path.join(PUBLIC_DIR, pathname, 'index.html');
    fs.stat(tryIndex, (err, stats) => {
      if (!err && stats.isFile()) return serveFile(tryIndex, res);
      serveFile(filePath + '.html', res);
    });
  } else {
    serveFile(filePath, res);
  }
});

server.listen(PORT, () => {
  console.log(`Static server running at http://localhost:${PORT}/`);
});

process.on('uncaughtException', (err) => {
  console.error('Server error:', err && err.stack ? err.stack : err);
});
