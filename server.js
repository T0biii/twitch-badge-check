// Twitch Badge Check – Node ohne Abhängigkeiten.
// Liefert die Seite und einen gecachten Proxy für die streamdatabase-Events.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
let evCache = { t: 0, body: '[]' };

async function events() {
  if (Date.now() - evCache.t > 5 * 60e3) {
    const r = await fetch('https://api.streamdatabase.com/events');
    if (!r.ok) throw new Error('streamdatabase ' + r.status);
    const data = (await r.json()).data || [];
    const slim = data.filter(e => !e.hidden && e.twitch_global_badges?.length).map(e => ({
      title: e.title, start_at_date: e.start_at_date, start_at_time: e.start_at_time,
      end_at_date: e.end_at_date, end_at_time: e.end_at_time,
      badges: e.twitch_global_badges.map(b => ({
        set_id: b.current.set_id, version: b.current.version.id,
        title: b.current.version.title, description: b.current.version.description,
        image: b.current.version.image_url_4x,
        cost: b.availability?.some(a => a.cost === 'paid') ? 'paid'
          : b.availability?.some(a => a.cost === 'free') ? 'free' : null,
      })),
    }));
    evCache = { t: Date.now(), body: JSON.stringify(slim) };
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
    if (pathname === '/api/events') return json(res, 200, await events());
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
