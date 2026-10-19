// After `expo export --platform web`: fills in the base path in index.html and adds
// 404.html so GitHub Pages opens the app on deep links like /trening.
// usage: node scripts/finish-web.mjs <dist dir>   (reads EXPO_BASE_URL like app.config.js)
import fs from 'node:fs';
import path from 'node:path';

const dist = process.argv[2];
const base = process.env.EXPO_BASE_URL || '';
const file = path.join(dist, 'index.html');
const html = fs.readFileSync(file, 'utf8').replaceAll('__BASE__', base);
fs.writeFileSync(file, html);
fs.writeFileSync(path.join(dist, '404.html'), html);
console.log(`index.html + 404.html ready (base "${base || '/'}")`);
