// Bakes the 3D jar's label textures and static posters from the live scene (see README.md).
//   node tools/bake/bake.mjs labels    → assets/img/jar/label-{current,new,new-emissive}-{4096,2560}.webp
//   node tools/bake/bake.mjs posters   → assets/img/jar/<key>-{560,800,1100,1400,1600}.{avif,webp}
// Needs: playwright, Google Chrome (a real GPU: full anisotropic filtering), ImageMagick with AVIF, the repo root served
// at http://127.0.0.1:8791 and tools/bake/scene.js bundled (README).
import { chromium } from 'playwright';
import { execFileSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const JAR = 'assets/img/jar';
// must match the [data-jar] anchors in tools/site_data.py (jar(...) calls): key, data-ry, data-s, data-rz, data-spill
const ANCHORS = [
  { key: 'hero-m', ry: -0.1, s: 0.7 }, { key: 'hero-d', ry: -0.15, s: 0.58 },
  { key: 'pack-m', ry: 0.2, s: 0.7 }, { key: 'pack-d', ry: 0.2, s: 0.66 },
  { key: 'order', ry: -0.3, s: 0.62 },
  { key: 'product-m', ry: 0, s: 0.72 }, { key: 'product-d', ry: 0, s: 0.6 },
  { key: 'thanks-m', ry: 0, s: 0.72 }, { key: 'thanks-d', ry: -0.2, s: 0.6 },
  { key: 'nf', ry: 0, s: 0.56, rz: 1.42, spill: true },
];
const WITH_NEW_PACK = /^(pack|product)/;          // these anchors also have a "-new" poster (the black pack)
const WIDTHS = [1600, 1400, 1100, 800, 560];

const what = process.argv[2];
const b = await chromium.launch({ channel: 'chrome', headless: false, args: ['--window-position=-2400,0', '--ignore-gpu-blocklist'] });
const p = await b.newPage();
p.on('console', m => m.type() === 'error' && console.error('page:', m.text()));
await p.goto('http://127.0.0.1:8791/tools/bake/bake.html'); await p.waitForFunction(() => window.ready);
const save = (name, dataUrl) => { const f = path.join(JAR, name); fs.writeFileSync(f, Buffer.from(dataUrl.split(',')[1], 'base64')); return f; };

if (what === 'labels') {
  for (const [n, d] of Object.entries(await p.evaluate(() => window.bakeLabels()))) console.log(n, Math.round(fs.statSync(save(n, d)).size / 1024) + ' KB');
} else if (what === 'posters') {
  const specs = ANCHORS.flatMap(a => (WITH_NEW_PACK.test(a.key) ? [a, { ...a, key: a.key + '-new', pack: true }] : [a]));
  const { out, stats } = await p.evaluate(sp => window.bakePosters(sp), specs);
  console.log('scene', JSON.stringify(stats));
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'jar-'));
  for (const [n, d] of Object.entries(out)) {
    const png = path.join(tmp, n); fs.writeFileSync(png, Buffer.from(d.split(',')[1], 'base64'));
    const key = n.replace(/-1600\.png$/, '');
    for (const w of WIDTHS) {
      const base = path.join(JAR, `${key}-${w}`);
      // Lanczos from the 1600 px supersampled master; alpha kept; quality high (no visible compression on the label)
      // q64 up to 1100 (indistinguishable from q74 at 3× zoom, ~25 % lighter: the LCP image), q68 for the 3× retina sizes
      execFileSync('magick', [png, '-filter', 'Lanczos', '-resize', `${w}x${w}`, '-strip', '-quality', w > 1100 ? '68' : '64', base + '.avif']);
      execFileSync('magick', [png, '-filter', 'Lanczos', '-resize', `${w}x${w}`, '-strip', '-quality', '90', '-define', 'webp:alpha-quality=100', '-define', 'webp:method=6', base + '.webp']);
    }
    console.log(key, WIDTHS.map(w => `${w}:${Math.round(fs.statSync(path.join(JAR, `${key}-${w}.avif`)).size / 1024)}K`).join(' '));
  }
} else console.log('usage: node tools/bake/bake.mjs labels|posters');
await b.close();
