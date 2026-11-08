// LABRO BIOCORE — 3D jar (from the Claude Design export v3). Two packagings (current white / upcoming black), morph
// between them. The canvas is moved into whichever [data-jar] anchor is on screen (assets/js/jar3d.js controller).
// three is bundled from npm (three@0.160.0, tree-shaken by esbuild) — no CDN, CSP script-src 'self'.
import * as THREE from 'three';

const LW = 2560, LH = 896, CX = LW / 2, FW = 840; // FW = visible front width in px
const fx = v => CX - FW / 2 + v * FW, fy = v => v * LH;
const ls = (g, v) => { try { g.letterSpacing = v; } catch (e) {} };

function loadImg(src) {
  return new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
}
function tint(img, w, h, fill) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); g.drawImage(img, 0, 0, w, h);
  g.globalCompositeOperation = 'source-in'; g.fillStyle = fill; g.fillRect(0, 0, w, h);
  return c;
}
function smallCaps(g, text, x, y, big, small, font) {
  let cx = x;
  for (const word of text.split(' ')) {
    [...word].forEach((ch, i) => {
      const s = i === 0 || !/[A-ZА-Я]/i.test(ch) ? big : small;
      g.font = `${font} ${s}px Oswald, sans-serif`;
      g.fillText(ch, cx, y); cx += g.measureText(ch).width + 1;
    });
    cx += big * 0.28;
  }
}
function fakeText(g, x, y, w, lines, col, size = 17) {
  g.fillStyle = col; let s = 11;
  for (let i = 0; i < lines; i++) {
    let cx = x; const lw = i % 6 === 5 ? w * 0.5 : w;
    while (cx < x + lw) { s = (s * 9301 + 49297) % 233280; const ww = 10 + (s % 46); g.fillRect(cx, y + i * (size + 9), Math.min(ww, x + lw - cx), size * 0.5); cx += ww + 9; }
  }
}
function barcode(g, x, y, w, h, col) {
  g.fillStyle = col; let cx = x, s = 7;
  while (cx < x + w) { s = (s * 9301 + 49297) % 233280; const bw = 2 + (s % 7); g.fillRect(cx, y, bw, h); cx += bw + 2 + (s % 4); }
}

function labelCurrent(mark) {
  const c = document.createElement('canvas'); c.width = LW; c.height = LH;
  const g = c.getContext('2d');
  const grey = g.createLinearGradient(fx(0), 0, fx(0.9), LH);
  grey.addColorStop(0, '#F1F2F0'); grey.addColorStop(0.55, '#C9CDCA'); grey.addColorStop(1, '#A7ACA9');
  g.fillStyle = grey; g.fillRect(0, 0, LW, LH);
  const dark = new Path2D();
  dark.moveTo(fx(0.75), 0); dark.lineTo(LW + 10, 0); dark.lineTo(LW + 10, LH); dark.lineTo(fx(0.13), LH);
  dark.bezierCurveTo(fx(-0.02), fy(0.97), fx(-0.03), fy(0.6), fx(0.17), fy(0.585));
  dark.lineTo(fx(0.6), fy(0.565));
  dark.bezierCurveTo(fx(0.8), fy(0.55), fx(0.81), fy(0.34), fx(0.785), fy(0.2));
  dark.lineTo(fx(0.75), 0); dark.closePath();
  const dg = g.createLinearGradient(0, 0, 0, LH); dg.addColorStop(0, '#2E3130'); dg.addColorStop(1, '#151716');
  g.fillStyle = dg; g.fill(dark);
  g.save(); g.lineWidth = 7; g.strokeStyle = '#3E7F5C'; g.shadowColor = 'rgba(92,224,140,.5)'; g.shadowBlur = 8; g.stroke(dark); g.restore();
  // back panel wraps behind (left of front) — darker band with fine print
  g.fillStyle = '#1B1D1C'; g.fillRect(0, 0, fx(-0.16), LH);
  g.textBaseline = 'alphabetic';
  // front copy
  g.fillStyle = '#272A29'; smallCaps(g, 'ASHWAGANDHA', fx(0.09), fy(0.2), 78, 62, '600');
  smallCaps(g, 'L-THEANINE', fx(0.09), fy(0.33), 78, 62, '600');
  smallCaps(g, 'RHODIOLA', fx(0.09), fy(0.46), 78, 62, '600');
  g.fillStyle = '#F4F5F2'; g.font = '600 100px Oswald, sans-serif'; g.fillText('НЕЙРО-БАЛАНС', fx(0.09), fy(0.715));
  g.fillStyle = 'rgba(244,245,242,.45)'; g.fillRect(fx(0.09), fy(0.74), FW * 0.7, 3);
  g.fillStyle = '#E8EAE6'; g.font = 'italic 400 50px Oswald, sans-serif'; g.fillText('Добавка дієтична', fx(0.09), fy(0.81));
  g.font = 'italic 400 36px Oswald, sans-serif'; g.fillText('60 ВЕГ КАПСУЛ', fx(0.09), fy(0.862));
  g.font = '400 34px Oswald, sans-serif'; g.fillStyle = '#D6D9D5';
  g.fillText('ASHWAGANDHA · L-THEANINE · RHODIOLA', fx(0.09), fy(0.94));
  if (mark) g.drawImage(tint(mark, 120, 200, '#7BC67E'), fx(0.86), fy(0.08), 84, 140);
  fakeText(g, fx(0.92), fy(0.3), 300, 12, 'rgba(220,224,220,.55)');
  fakeText(g, fx(-0.62), fy(0.12), 360, 14, 'rgba(220,224,220,.5)');
  g.fillStyle = '#E8EAE6'; g.font = '500 30px Geologica, sans-serif'; g.fillText('Склад / Спосіб застосування', fx(-0.62), fy(0.08));
  g.fillStyle = '#F1F2F0'; g.fillRect(fx(-0.6), fy(0.66), 330, 170); barcode(g, fx(-0.58), fy(0.68), 290, 120, '#151716');
  g.fillStyle = '#D6D9D5'; g.font = '400 24px Geologica, sans-serif';
  g.fillText('Маса нетто: 34,2 г · Номінальна кількість: 60 шт.', fx(0.92), fy(0.82));
  g.fillText('PET пляшка · PE-HD кришка', fx(0.92), fy(0.87));
  return c;
}

function brain(g, ox, oy, w, h, glow) {
  let s = 42; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const pts = [];
  while (pts.length < 150) {
    const x = rnd() * 2 - 1, y = rnd() * 2 - 1;
    const inA = (x + 0.05) ** 2 / 1 + (y + 0.08) ** 2 / 0.62 < 1, notch = y > 0.35 && x > 0.1 && x < 0.6;
    if (inA && !notch) pts.push([ox + (x * 0.5 + 0.5) * w, oy + (y * 0.5 + 0.5) * h]);
  }
  g.save(); g.lineCap = 'round';
  g.shadowColor = glow; g.shadowBlur = 14;
  // gyri — wavy contour strokes
  for (let k = 0; k < 9; k++) {
    g.beginPath(); g.lineWidth = 2.4; g.strokeStyle = `rgba(222,196,128,${0.35 + rnd() * 0.4})`;
    const r = 0.25 + k * 0.08;
    for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.06) {
      const wob = 1 + Math.sin(a * (7 + k)) * 0.06;
      const x = ox + w / 2 + Math.cos(a) * w * 0.5 * r * wob, y = oy + h * 0.46 + Math.sin(a) * h * 0.4 * r * wob;
      a === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
    }
    g.stroke();
  }
  g.lineWidth = 1.4;
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
    const d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]);
    if (d < 62) { g.strokeStyle = `rgba(150,230,170,${0.5 - d / 140})`; g.beginPath(); g.moveTo(...pts[i]); g.lineTo(...pts[j]); g.stroke(); }
  }
  g.fillStyle = '#F3E2B0';
  pts.forEach(p => { g.beginPath(); g.arc(p[0], p[1], 2.6, 0, 6.3); g.fill(); });
  g.restore();
}
function labelNew(mark) {
  const c = document.createElement('canvas'); c.width = LW; c.height = LH;
  const g = c.getContext('2d');
  const bg = g.createLinearGradient(0, 0, 0, LH); bg.addColorStop(0, '#121413'); bg.addColorStop(1, '#070808');
  g.fillStyle = bg; g.fillRect(0, 0, LW, LH);
  const e = document.createElement('canvas'); e.width = LW; e.height = LH;
  const eg = e.getContext('2d'); eg.fillStyle = '#000'; eg.fillRect(0, 0, LW, LH);
  brain(g, fx(0.6), fy(0.16), 480, 420, 'rgba(214,180,100,.8)');
  brain(eg, fx(0.6), fy(0.16), 480, 420, 'rgba(214,180,100,.8)');
  const gold = g.createLinearGradient(fx(0.05), 0, fx(0.5), 0); gold.addColorStop(0, '#E9CF8E'); gold.addColorStop(1, '#B8914A');
  if (mark) g.drawImage(tint(mark, 120, 200, '#D9B66E'), fx(0.07), fy(0.07), 60, 100);
  g.fillStyle = gold; g.font = '500 30px Geologica, sans-serif'; ls(g, '10px'); g.fillText('BIOCORE', fx(0.15), fy(0.12)); ls(g, '0px');
  g.font = 'italic 500 54px "Cormorant Garamond", serif'; g.fillText('LaBro', fx(0.15), fy(0.19));
  g.fillStyle = '#F2EFE6'; g.font = '600 84px Geologica, sans-serif'; g.fillText('Нейро-Баланс', fx(0.07), fy(0.43));
  g.fillStyle = '#BDB6A6'; g.font = '400 36px Geologica, sans-serif';
  g.fillText('Добавка дієтична', fx(0.07), fy(0.51)); g.fillText('в веганських капсулах', fx(0.07), fy(0.565));
  g.fillStyle = gold; g.fillRect(fx(0.07), fy(0.61), 260, 3);
  g.font = '500 36px Oswald, sans-serif'; ls(g, '4px');
  g.fillText('ASHWAGANDHA', fx(0.07), fy(0.7)); g.fillText('L-THEANINE', fx(0.07), fy(0.76)); g.fillText('RHODIOLA', fx(0.07), fy(0.82)); ls(g, '0px');
  fakeText(g, fx(-0.62), fy(0.12), 360, 14, 'rgba(201,169,98,.45)');
  fakeText(g, fx(1.0), fy(0.3), 300, 12, 'rgba(201,169,98,.45)');
  g.fillStyle = '#E9E3D3'; g.fillRect(fx(-0.6), fy(0.66), 330, 170); barcode(g, fx(-0.58), fy(0.68), 290, 120, '#0A0B0B');
  return { map: c, emissive: e };
}

function radialTex(stops, size = 256, ring) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'); const r = size / 2;
  const gr = g.createRadialGradient(r, r, 0, r, r, r);
  stops.forEach(([o, col]) => gr.addColorStop(o, col));
  g.fillStyle = gr; g.fillRect(0, 0, size, size);
  if (ring) { g.strokeStyle = ring; g.lineWidth = size * 0.012; g.beginPath(); g.arc(r, r, r * 0.72, 0, 6.3); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const lerpC = (a, b, t) => a.clone().lerp(b, t);
const ease = x => 1 - Math.pow(1 - x, 3);
const back = x => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };

const PR_STEPS = [0.75, 1, 1.25, 1.5, 1.75, 2];
// seeded: the static poster (rendered from this scene) and the live jar start from the same frame
let seed = 20261108;
const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
export function detectTier() {
  const coarse = matchMedia('(pointer: coarse)').matches;
  const cores = navigator.hardwareConcurrency || 4, mem = navigator.deviceMemory || 4;
  if (cores <= 4 || mem <= 2) return 0;
  return coarse ? 1 : 2;
}
function downscale(c, k) {
  if (k >= 1) return c;
  const d = document.createElement('canvas'); d.width = Math.round(c.width * k); d.height = Math.round(c.height * k);
  d.getContext('2d').drawImage(c, 0, 0, d.width, d.height); return d;
}

// Canvas is NOT attached here — the page moves scene.canvas into whichever [data-jar] anchor is on screen,
// so the jar scrolls natively with its section and only that box is rendered.
export async function createScene(markUrl) {
  seed = 20261108;
  try {
    await Promise.race([Promise.all([
      document.fonts.load('600 100px Oswald'), document.fonts.load('italic 400 40px Oswald'),
      document.fonts.load('600 100px Geologica'), document.fonts.load('italic 500 50px "Cormorant Garamond"'),
    ]), new Promise(r => setTimeout(r, 1500))]);
  } catch (e) {}
  const mark = await loadImg(markUrl);
  const tier = detectTier();
  const cap = Math.min(window.devicePixelRatio || 1, [1, 1.5, 2][tier]);
  let prIdx = 0; PR_STEPS.forEach((p, i) => { if (p <= cap + 1e-3) prIdx = i; });
  const maxIdx = prIdx;
  const renderer = new THREE.WebGLRenderer({ antialias: tier === 2, alpha: true, powerPreference: tier === 2 ? 'high-performance' : 'default', preserveDrawingBuffer: false, stencil: false });
  renderer.setPixelRatio(PR_STEPS[prIdx]);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  const cv = renderer.domElement;
  cv.setAttribute('aria-hidden', 'true');
  cv.className = 'jar-canvas';  // sized by CSS (no inline style: strict CSP)

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 60);
  camera.position.set(0, 0, 7); camera.lookAt(0, 0, 0);
  const halfH = Math.tan(THREE.MathUtils.degToRad(17.5)) * 7;

  const env = new THREE.Scene();
  env.add(new THREE.Mesh(new THREE.BoxGeometry(12, 12, 12), new THREE.MeshBasicMaterial({ color: 0x0d1210, side: THREE.BackSide })));
  const panel = (w, h, hex, k, x, y, z) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k), side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m); };
  panel(3, 7, '#ffffff', 6, -5, 1, 3); panel(2, 6, '#fff6e6', 3, 5, 0.5, 2); panel(8, 2.5, '#ffffff', 2.5, 0, 5.5, 0);
  panel(5, 5, '#5CE08C', 1.8, 2, -1, -5.5); panel(4, 4, '#E2B76A', 1.2, -4, -2, -4);
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(env, 0.04).texture; pm.dispose();
  scene.add(new THREE.AmbientLight(0xffffff, 0.15));
  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(-3, 4, 5); scene.add(key);
  const rimG = new THREE.PointLight(0x5CE08C, 22, 10, 2); scene.add(rimG);
  const rimW = new THREE.PointLight(0xE2B76A, 10, 10, 2); scene.add(rimW);

  const V = (x, y) => new THREE.Vector2(x, y);
  const bodyGeo = new THREE.LatheGeometry([V(0.001, -1.12), V(0.5, -1.12), V(0.6, -1.1), V(0.645, -1.05), V(0.655, -0.97), V(0.655, 0.6), V(0.645, 0.7), V(0.61, 0.8), V(0.56, 0.87), V(0.5, 0.92), V(0.47, 0.95), V(0.47, 1.02)], tier ? 128 : 80);
  const capGeo = new THREE.LatheGeometry([V(0.001, 0.98), V(0.5, 0.98), V(0.535, 1.0), V(0.535, 1.04), V(0.535, 1.5), V(0.53, 1.535), V(0.505, 1.56), V(0.45, 1.57), V(0.001, 1.57)], tier ? 240 : 144);
  const cp = capGeo.attributes.position;
  for (let i = 0; i < cp.count; i++) {
    const px = cp.getX(i), pz = cp.getZ(i), py = cp.getY(i);
    if (Math.hypot(px, pz) > 0.52 && py > 1.03 && py < 1.51) { const f = 1 - 0.02 * (0.5 + 0.5 * Math.cos(Math.atan2(px, pz) * 72)); cp.setX(i, px * f); cp.setZ(i, pz * f); }
  }
  capGeo.computeVertexNormals();
  const W0 = { body: new THREE.Color('#F4F4F0'), cap: new THREE.Color('#EEEEEA') }, B0 = { body: new THREE.Color('#0F1110'), cap: new THREE.Color('#121413') };
  const bodyMat = new THREE.MeshPhysicalMaterial({ color: W0.body, roughness: 0.3, clearcoat: tier ? 1 : 0, clearcoatRoughness: 0.18, side: THREE.DoubleSide });
  const capMat = new THREE.MeshPhysicalMaterial({ color: W0.cap, roughness: 0.48, clearcoat: tier ? 0.3 : 0, side: THREE.DoubleSide });
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const tex = c => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = aniso; return t; };
  const k = [0.5, 0.75, 1][tier];
  const nl = labelNew(mark);
  const labelGeo = r => new THREE.CylinderGeometry(r, r, 1.46, tier ? 160 : 96, 1, true, -Math.PI, Math.PI * 2);
  const labelAMat = new THREE.MeshPhysicalMaterial({ map: tex(downscale(labelCurrent(mark), k)), roughness: 0.4, clearcoat: tier ? 0.7 : 0, clearcoatRoughness: 0.22 });
  const labelA = new THREE.Mesh(labelGeo(0.66), labelAMat);
  const labelBMat = new THREE.MeshPhysicalMaterial({ map: tex(downscale(nl.map, k)), emissiveMap: tex(downscale(nl.emissive, k)), emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.9, roughness: 0.55, clearcoat: tier ? 0.25 : 0, transparent: true, opacity: 0 });
  const labelB = new THREE.Mesh(labelGeo(0.662), labelBMat);
  labelA.position.y = labelB.position.y = -0.2;
  const inner = new THREE.Group();
  inner.add(new THREE.Mesh(bodyGeo, bodyMat), new THREE.Mesh(capGeo, capMat), labelA, labelB);
  inner.position.y = -0.22;
  const bottle = new THREE.Group(); bottle.add(inner); bottle.rotation.order = 'ZYX'; scene.add(bottle);

  const aura = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: radialTex([[0, 'rgba(92,224,140,0.42)'], [0.42, 'rgba(60,199,190,0.12)'], [1, 'rgba(0,0,0,0)']]), transparent: true, depthWrite: false }));
  const auraGold = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: radialTex([[0, 'rgba(226,183,106,0.42)'], [0.45, 'rgba(226,183,106,0.1)'], [1, 'rgba(0,0,0,0)']]), transparent: true, depthWrite: false, opacity: 0 }));
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: radialTex([[0, 'rgba(92,224,140,0.55)'], [0.5, 'rgba(92,224,140,0.12)'], [1, 'rgba(0,0,0,0)']], 256, 'rgba(160,255,200,0.55)'), transparent: true, depthWrite: false }));
  scene.add(aura, auraGold, floor);

  const r = 0.085, L = 0.21, r2 = r * 1.05, pts = [];
  for (let i = 0; i <= 8; i++) { const a = -Math.PI / 2 + (i / 8) * Math.PI / 2; pts.push(V(Math.max(0.001, r * Math.cos(a)), -L / 2 + r * Math.sin(a))); }
  pts.push(V(r, -0.003), V(r2, -0.001));
  for (let i = 0; i <= 8; i++) { const a = (i / 8) * Math.PI / 2; pts.push(V(Math.max(0.001, r2 * Math.cos(a)), L / 2 + r2 * Math.sin(a))); }
  const capsGeo = new THREE.LatheGeometry(pts, tier ? 28 : 18);
  const pc = capsGeo.attributes.position.count, col = new Float32Array(pc * 3);
  const cA = new THREE.Color('#E9DCBC'), cB = new THREE.Color('#F6F1E4');
  for (let i = 0; i < pc; i++) { const c = capsGeo.attributes.position.getY(i) > -0.002 ? cA : cB; col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
  capsGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const capsMat = new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.28, clearcoat: tier ? 1 : 0, clearcoatRoughness: 0.12, side: THREE.DoubleSide });
  const caps = [], N = [6, 10, 14][tier];
  for (let i = 0; i < N; i++) {
    const m = new THREE.Mesh(capsGeo, capsMat); m.rotation.set(rand() * 6, rand() * 6, rand() * 6); scene.add(m);
    caps.push({ m, r: 1.25 + rand() * 0.85, a: (i / N) * Math.PI * 2, sp: 0.1 + rand() * 0.12, y: (rand() - 0.5) * 2.2, ph: rand() * 6.28, f: 0.5 + rand() * 0.6, rs: (rand() - 0.5) * 1.4, sx: (rand() - 0.5) * 2.6, sz: (rand() - 0.5) * 1.6 + 0.3, sc: 0.85 + rand() * 0.4 });
  }
  const DN = [60, 120, 220][tier], dp = new Float32Array(DN * 3);
  for (let i = 0; i < DN; i++) { const a = rand() * 6.28, rr = 0.9 + rand() * 2.2; dp[i * 3] = Math.cos(a) * rr; dp[i * 3 + 1] = (rand() - 0.5) * 3.2; dp[i * 3 + 2] = Math.sin(a) * rr - 0.6; }
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  const dustMat = new THREE.PointsMaterial({ size: 0.04, map: radialTex([[0, 'rgba(255,255,255,1)'], [1, 'rgba(255,255,255,0)']], 64), color: 0xb8f5cc, transparent: true, opacity: 0.6, depthWrite: false });
  const dust = new THREE.Points(dg, dustMat); dust.visible = tier > 0; scene.add(dust);

  // ── adaptive quality governor: holds ≥55 fps by trading resolution → dust → capsules → clearcoat ──
  let W = 0, H = 0;
  const base = { body: bodyMat.clearcoat, caps: capsMat.clearcoat, label: labelAMat.clearcoat };
  const gov = { acc: 0, n: 0, t: 0, start: -1, good: 0, level: 0, lastUp: -99, locked: false, fps: 0 };
  const setPr = i => { prIdx = i; renderer.setPixelRatio(PR_STEPS[i]); if (W) renderer.setSize(W, H, false); };
  const applyLevel = () => {
    dust.visible = tier > 0 && gov.level < 1;
    const n = gov.level >= 2 ? Math.ceil(caps.length / 2) : caps.length;
    caps.forEach((c, i) => { c.m.visible = i < n; });
    const cc = gov.level >= 3 ? 0 : 1;
    bodyMat.clearcoat = base.body * cc; capsMat.clearcoat = base.caps * cc; labelAMat.clearcoat = base.label * cc;
  };
  const govern = (dt, t) => {
    if (gov.start < 0) gov.start = t;
    if (dt <= 0 || dt > 0.1 || t - gov.start < 2.5) return;
    gov.acc += dt; gov.n++;
    if (gov.n < 24) return;
    const avg = gov.acc / gov.n; gov.acc = 0; gov.n = 0; gov.fps = Math.round(1 / avg);
    if (t - gov.t < 1) return;
    if (avg > 1 / 55) {
      gov.good = 0; gov.t = t;
      if (t - gov.lastUp < 4) gov.locked = true;
      if (prIdx > 0 && PR_STEPS[prIdx] > 1) setPr(prIdx - 1);
      else if (gov.level < 3) { gov.level++; applyLevel(); }
      else if (prIdx > 0) setPr(prIdx - 1);
    } else if (avg < 1 / 58 && !gov.locked && (prIdx < maxIdx || gov.level > 0)) {
      if (++gov.good >= 6) { gov.good = 0; gov.t = t; gov.lastUp = t; if (gov.level > 0) { gov.level--; applyLevel(); } else setPr(prIdx + 1); }
    } else gov.good = 0;
  };

  const st = { ry: 0, rz: 0, spill: 0, mix: 0, appear: 0, key: -1, drag: 0, spin: 0, spinT: 0, packT: -1 };
  let lastSig = '';
  return {
    canvas: cv, tier,
    setSize(w, h) {
      if (!w || !h || (w === W && h === H)) return;
      W = w; H = h; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); lastSig = '';
    },
    stats() { return { fps: gov.fps, pr: PR_STEPS[prIdx], level: gov.level, tier }; },
    // I: { key, sf, ry, rz, spill, pack(0|1), reduced, nx, ny, drag, dragging }
    tick(dtRaw, t, I) {
      if (!W || !H) return;
      govern(dtRaw, t);
      const dt = Math.min(dtRaw, 0.05), R = I.reduced;
      if (I.key !== st.key) { st.key = I.key; st.appear = R ? 1 : 0; st.ry = I.ry; st.rz = I.rz; st.spill = I.spill; gov.acc = 0; gov.n = 0; gov.t = t; }
      if (st.packT === -1) { st.packT = I.pack; st.mix = I.pack; }
      if (I.pack !== st.packT) { st.packT = I.pack; if (!R) st.spinT += Math.PI * 2; }
      const kk = R ? 1 : 1 - Math.exp(-dt * 3);
      st.appear = Math.min(1, st.appear + dt / 1.2);
      st.ry += (I.ry - st.ry) * kk; st.rz += (I.rz - st.rz) * kk; st.spill += (I.spill - st.spill) * kk;
      st.spin += (st.spinT - st.spin) * (R ? 1 : 1 - Math.exp(-dt * 2.2));
      const spinP = st.spinT ? 1 - Math.abs(st.spinT - st.spin) / (Math.PI * 2) : 1;
      st.mix += ((R || spinP > 0.45 ? st.packT : st.mix) - st.mix) * (R ? 1 : 1 - Math.exp(-dt * 6));
      if (I.dragging) st.drag += I.drag; else st.drag *= R ? 0 : Math.pow(0.12, dt);
      if (R) {
        const sig = [W, H, I.sf, st.ry, st.rz, st.spin, st.drag, st.mix, st.spill].map(v => (+v).toFixed(3)).join('|');
        if (sig === lastSig) return; lastSig = sig;
      }
      const halfW = halfH * camera.aspect;
      const s = (I.sf || 0.62) * 2 * halfH / 2.7;
      const ap = R ? 1 : back(st.appear), apE = R ? 1 : ease(st.appear);
      const free = 1 - st.spill;
      bottle.position.set(0, R ? 0 : Math.sin(t * 0.9) * 0.05 * free * s, 0);
      bottle.scale.setScalar(Math.max(0.0001, s * (0.6 + 0.4 * ap)));
      const idle = R ? 0 : Math.sin(t * 0.45) * 0.32 * free;
      bottle.rotation.set(0.04 + (R ? 0 : I.ny * 0.1 * free), st.ry + idle + st.spin + st.drag - (1 - apE) * 2.4, st.rz - (R ? 0 : I.nx * 0.06 * free));
      const m = st.mix;
      bodyMat.color.copy(lerpC(W0.body, B0.body, m)); bodyMat.roughness = 0.3 + m * 0.22;
      capMat.color.copy(lerpC(W0.cap, B0.cap, m)); capMat.roughness = 0.48 + m * 0.1;
      labelBMat.opacity = m; labelB.visible = m > 0.002; labelA.visible = m < 0.998;
      const auraS = Math.min(s * 4.6, halfW * 2, halfH * 2) * apE;
      aura.position.set(0, 0, -1.6); aura.scale.setScalar(auraS * (1 + (R ? 0 : Math.sin(t * 1.2) * 0.03))); aura.material.opacity = 1 - m * 0.7;
      auraGold.position.set(0, 0, -1.55); auraGold.scale.setScalar(auraS * 0.95); auraGold.material.opacity = m;
      floor.position.set(0, -1.16 * s, -0.2); floor.scale.set(Math.min(s * 3, halfW * 1.9) * apE, s * 0.55 * apE, 1); floor.material.opacity = free * (0.9 - m * 0.4);
      rimG.position.set(2.2 * s, 1.2 * s, -2); rimG.intensity = 22 * (1 - m * 0.6);
      rimW.position.set(-2.4 * s, -0.6 * s, -1.4); rimW.intensity = 6 + m * 18;
      const spread = Math.min(1, (halfW * 0.92) / (2.15 * s));
      for (const c of caps) {
        if (!c.m.visible) continue;
        if (!R) { c.a += c.sp * dt * free; c.m.rotation.x += c.rs * dt * free; c.m.rotation.y += c.rs * 0.7 * dt * free; }
        const rr = c.r * s * spread * apE;
        const ox = Math.cos(c.a) * rr, oy = c.y * s * 0.85 + (R ? 0 : Math.sin(t * c.f + c.ph) * 0.08 * s), oz = Math.sin(c.a) * rr * 0.8;
        const px = c.sx * s * 1.2, py = -0.55 * s, pz = c.sz * s, sp = st.spill;
        c.m.position.set(ox + (px - ox) * sp, oy + (py - oy) * sp, oz + (pz - oz) * sp);
        c.m.scale.setScalar(Math.max(0.0001, apE * c.sc * s * 0.85));
      }
      if (dust.visible) { dust.scale.setScalar(s * apE); dust.rotation.y = t * 0.03; dustMat.color.set(m > 0.5 ? 0xf0d9a0 : 0xb8f5cc); }
      renderer.render(scene, camera);
    },
    resize() { lastSig = ''; },
    // frees every GPU resource (geometries, materials, textures) — no leaks when the controller tears the scene down
    dispose() {
      scene.traverse(o => {
        if (o.geometry) o.geometry.dispose();
        const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
        ms.forEach(mt => { Object.values(mt).forEach(v => { if (v && v.isTexture) v.dispose(); }); mt.dispose(); });
      });
      if (scene.environment) scene.environment.dispose();
      renderer.dispose(); renderer.forceContextLoss(); cv.remove();
    },
  };
}
