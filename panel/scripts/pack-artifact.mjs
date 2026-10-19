// Turns dist/index.html into page content for a claude.ai artifact, which supplies its own <html>/<head>/<body>.
// usage: npm run build && node scripts/pack-artifact.mjs dist/index.html out.html
import fs from 'node:fs';

const [src, out] = process.argv.slice(2);
const html = fs.readFileSync(src, 'utf8');
const head = html.match(/<head>([\s\S]*)<\/head>/)[1]
  .replace(/<meta[^>]*>/g, '').replace(/<link rel="icon"[^>]*>/g, '').replace(/<title>[\s\S]*?<\/title>/, '');
const body = html.match(/<body>([\s\S]*)<\/body>/)[1];
fs.writeFileSync(out, `<title>GabiTrainer Panel</title>\n${head.trim()}\n${body.trim()}\n`);
console.log(out, (fs.statSync(out).size / 1e6).toFixed(2) + ' MB');
