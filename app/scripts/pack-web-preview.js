// Packs the Expo web export into one self-contained artifact page.
// usage: npx expo export --platform web --output-dir dist && node scripts/pack-web-preview.js dist . preview.html
const fs = require('fs');
const path = require('path');
const [dist, app, out] = process.argv.slice(2);

const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]);

const FONTS = {
  Caprasimo_400Regular: '@expo-google-fonts/caprasimo/400Regular/Caprasimo_400Regular.ttf',
  Figtree_400Regular: '@expo-google-fonts/figtree/400Regular/Figtree_400Regular.ttf',
  Figtree_600SemiBold: '@expo-google-fonts/figtree/600SemiBold/Figtree_600SemiBold.ttf',
  Figtree_700Bold: '@expo-google-fonts/figtree/700Bold/Figtree_700Bold.ttf',
  Fraunces_900Black: '@expo-google-fonts/fraunces/900Black/Fraunces_900Black.ttf',
};
// expo-font treats a family as loaded when a rule for it already sits in this style element.
const fontCss = Object.entries(FONTS).map(([family, file]) => {
  const b64 = fs.readFileSync(path.join(app, 'node_modules', file)).toString('base64');
  return `@font-face{font-family:"${family}";src:url(data:font/ttf;base64,${b64}) format("truetype");font-display:block}`;
}).join('\n');

const js = scripts.map(src => fs.readFileSync(path.join(dist, src), 'utf8').replace(/<\/script/gi, '<\\/script'));

const page = `<title>GabiTrainer</title>
<meta name="theme-color" content="#f5ead8">
<style>
  :root { --page: #eee7db; --app: #f5ead8; color-scheme: light; }
  html, body { height: 100%; }
  body { overflow: hidden; background: var(--page); }
  /* Phone-width column; on a laptop it sits centered like a phone screen. */
  #root { display: flex; height: 100%; max-width: 440px; margin: 0 auto; background: var(--app); }
  @media (min-width: 480px) { #root { box-shadow: 0 12px 32px rgba(46,43,37,0.22); } }
</style>
<style id="expo-generated-fonts">
${fontCss}
</style>
<div id="root"></div>
<script>
  // Expo Router reads the page path; the app's home screen lives at "/".
  try { history.replaceState(null, '', '/'); } catch (e) {}
</script>
${js.map(s => `<script>${s}</script>`).join('\n')}
`;
fs.writeFileSync(out, page);
console.log(out, (page.length / 1e6).toFixed(2) + ' MB');
