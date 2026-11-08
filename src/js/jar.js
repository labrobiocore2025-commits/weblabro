// 3D jar controller — bundled with labro-3d.js and three into assets/js/jar3d.js (tools/build-3d.sh).
// Loaded by site.js with import() only after the page has loaded, never with reduced motion or on a weak device.
//
// * one WebGL canvas for the whole page: it is moved into the [data-jar] anchor that is most visible right now;
// * the render loop runs only while a jar anchor is on screen and the tab is visible — otherwise no frames at all;
// * every anchor keeps its static poster underneath until the live jar has drawn its first frame (.has-3d fades it);
// * a lost WebGL context or any error tears the scene down and leaves the posters — the page never breaks.
import { createScene } from './labro-3d.js';

export async function start({ labelBase, labelQuery = '' }) {
  const anchors = [...document.querySelectorAll('[data-jar]')];
  if (!anchors.length) return null;

  let scene = null, raf = 0, last = 0, key = 0, current = null, dead = false;
  const visible = new Map();          // anchor -> intersection ratio
  const ptr = { nx: 0, ny: 0 };
  const drag = { on: false, x: 0, d: 0 };
  const root = document.documentElement;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) visible.set(e.target, e.intersectionRatio); else visible.delete(e.target); });
    wake();
  }, { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] });
  anchors.forEach(a => io.observe(a));

  const onMove = e => { ptr.nx = e.clientX / innerWidth * 2 - 1; ptr.ny = e.clientY / innerHeight * 2 - 1; };
  addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('visibilitychange', wake);
  document.addEventListener('labro:jar', wake);       // menu / modal / page transition toggled

  // drag to rotate ([data-drag3d] wraps the anchor)
  document.querySelectorAll('[data-drag3d]').forEach(el => {
    el.addEventListener('pointerdown', e => { drag.on = true; drag.x = e.clientX; try { el.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ } });
    el.addEventListener('pointermove', e => { if (!drag.on) return; drag.d += (e.clientX - drag.x) * 0.012; drag.x = e.clientX; });
    const end = () => { drag.on = false; };
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
  });

  function pick() {
    let best = null, area = 40;
    for (const a of visible.keys()) {
      const r = a.getBoundingClientRect();
      if (!r.height || !r.width) continue;                 // display:none variant (mobile/desktop)
      const v = Math.min(r.bottom, innerHeight) - Math.max(r.top, 0);
      if (v > area) { area = v; best = a; }
    }
    return best;
  }

  const blocked = () => document.hidden || root.classList.contains('is-locked') || root.classList.contains('is-leaving');

  function wake() {
    if (dead) return;
    if (!raf && pick() && !blocked()) { last = performance.now(); raf = requestAnimationFrame(frame); }
  }

  async function ensure() {
    if (scene || dead) return scene;
    scene = await createScene(name => labelBase + name + labelQuery);
    scene.canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); stop(); }, { once: true });
    return scene;
  }

  function frame(now) {
    raf = 0;
    const a = pick();
    if (!a || blocked() || dead) { if (current) current.classList.remove('has-3d'); return; }   // sleep until wake()
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    if (!scene) { ensure().then(wake, stop); return; }
    if (a !== current) {
      if (current) current.classList.remove('has-3d');
      current = a; key++;
      a.appendChild(scene.canvas);
    }
    const r = a.getBoundingClientRect();
    scene.setSize(Math.round(r.width), Math.round(r.height));
    scene.tick(dt, now / 1000, {
      key, sf: +a.dataset.s || 0.62, ry: +a.dataset.ry || 0, rz: +a.dataset.rz || 0, spill: 'spill' in a.dataset ? 1 : 0,
      pack: root.dataset.pack === 'new' ? 1 : 0, reduced: false, nx: ptr.nx, ny: ptr.ny, drag: drag.d, dragging: drag.on,
    });
    drag.d = 0;
    if (!a.classList.contains('has-3d')) a.classList.add('has-3d');
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    dead = true;
    cancelAnimationFrame(raf); raf = 0;
    io.disconnect();
    removeEventListener('pointermove', onMove);
    document.removeEventListener('visibilitychange', wake);
    document.removeEventListener('labro:jar', wake);
    anchors.forEach(a => a.classList.remove('has-3d'));
    if (scene) { try { scene.dispose(); } catch (_) { /* ignore */ } scene = null; }
  }
  addEventListener('pagehide', e => { if (!e.persisted) stop(); });

  wake();
  return { stop };
}
