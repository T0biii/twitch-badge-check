// Twitch Badge Check – Node ohne Abhängigkeiten.
// Liefert die Seite und die gecachten Events von streamdatabase (als /events.json, wie bei GitHub Pages).
const http = require('http');
const fs = require('fs');
const path = require('path');
const fetchEvents = require('./events');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
let evCache = { t: 0, body: '[]' };

async function events() {
  if (Date.now() - evCache.t > 5 * 60e3) {
    evCache = { t: Date.now(), body: JSON.stringify(await fetchEvents()) };
  }
  return evCache.body;
}

const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml' };
const json = (res, code, body) => {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(body);
};

http.createServer(async (req, res) => {
  const pathname = new URL(req.url, 'http://x').pathname;
  try {
    if (pathname === '/events.json' || pathname === '/api/events') return json(res, 200, await events());
    const file = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : path.normalize(pathname));
    if (!file.startsWith(PUBLIC_DIR) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      return json(res, 404, '{"error":"not found"}');
    }
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  } catch (e) {
    console.error(e);
    json(res, 500, '{"error":"Serverfehler"}');
  }
}).listen(PORT, () => console.log('Läuft auf Port ' + PORT));
