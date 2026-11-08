import { chromium } from 'playwright';
import fs from 'fs';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome', headless: true });
const p = await b.newPage();
await p.goto('http://127.0.0.1:8791/bake.html'); await p.waitForFunction(() => window.ready);
const files = await p.evaluate(() => window.bake());
for (const [n, d] of Object.entries(files)) { fs.writeFileSync(`${out}/${n}`, Buffer.from(d.split(',')[1], 'base64')); console.log(n, Math.round(fs.statSync(`${out}/${n}`).size / 1024) + 'KB'); }
await b.close();
