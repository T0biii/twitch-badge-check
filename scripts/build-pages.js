// Baut das statische GitHub-Pages-Paket: public/ + events.json
const fs = require('fs');
const path = require('path');
const fetchEvents = require('../events');

(async () => {
  const out = path.join(__dirname, '..', 'dist');
  fs.rmSync(out, { recursive: true, force: true });
  fs.cpSync(path.join(__dirname, '..', 'public'), out, { recursive: true });
  const events = await fetchEvents();
  fs.writeFileSync(path.join(out, 'events.json'), JSON.stringify(events));
  console.log(`dist/ erstellt, ${events.length} Events`);
})().catch(e => { console.error(e); process.exit(1); });
