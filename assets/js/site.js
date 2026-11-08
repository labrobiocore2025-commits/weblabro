'use strict';
// LABRO BIOCORE — interface and motion (ported from the Claude Design export v3, without its React runtime).
// Loaded with `defer`. No inline code: strict CSP. Animations use transform/opacity (Web Animations API);
// with prefers-reduced-motion everything is shown in its final state at once and nothing moves.
(function () {
  const root = document.documentElement;
  const R = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const LITE = !FINE || (navigator.hardwareConcurrency || 4) <= 4;   // per-word instead of per-letter splits
  const PAGE = document.body.dataset.page || '';
  const E = 'cubic-bezier(.16,1,.3,1)';
  const EIO = 'cubic-bezier(.76,0,.24,1)';
  const $$ = (s, el) => [...(el || document).querySelectorAll(s)];
  const anim = (el, kf, opt) => (el && el.animate && !R ? el.animate(kf, opt) : null);
  const LABELS = { '': 'Головна', 'index.html': 'Головна', 'product.html': 'Нейро-Баланс', 'about.html': 'Про нас',
    'blog.html': 'Блог', 'delivery.html': 'Доставка й оплата', 'contacts.html': 'Контакти', 'faq.html': 'FAQ',
    'privacy.html': 'Документи', 'offer.html': 'Документи', 'thanks.html': 'Дякуємо' };

  root.classList.remove('js-pending');
  root.classList.add('js');
  if (!root.dataset.pack) root.dataset.pack = 'current';
  if (FINE && !R) root.classList.add('has-cursor');
  const jarSignal = () => document.dispatchEvent(new Event('labro:jar'));

  // ═══ curtains: intro on the first page of a visit, a short lift after an internal navigation ═══
  const curA = document.querySelector('[data-cur-a]'), curB = document.querySelector('[data-cur-b]');
  const curNum = document.querySelector('[data-cur-num]'), curBar = document.querySelector('[data-cur-bar]');
  const curLabel = document.querySelector('[data-cur-label]');
  let navLabel = null, firstVisit = true;
  try { navLabel = sessionStorage.getItem('labro_nav'); sessionStorage.removeItem('labro_nav'); firstVisit = !sessionStorage.getItem('labro_seen'); sessionStorage.setItem('labro_seen', '1'); } catch (_) { /* storage blocked */ }
  const t0 = performance.now();

  function liftCurtains() {
    if (root.classList.contains('is-ready')) return;
    const done = () => { root.classList.add('is-ready'); root.classList.remove('is-entering'); jarSignal(); startReveals(); };
    if (R || !curA || !curB) { done(); return; }
    [curA, curB].forEach(el => el.getAnimations().forEach(a => a.cancel()));
    const up = [{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }];
    curB.animate(up, { duration: 1000, easing: EIO, fill: 'forwards' });
    const a = curA.animate(up, { duration: 1000, delay: 120, easing: EIO, fill: 'forwards' });
    setTimeout(startReveals, 250);                              // content animates in while the curtains rise
    a.finished.then(() => { [curA, curB].forEach(el => el.getAnimations().forEach(x => x.cancel())); done(); }, done);
  }
  if (curLabel) curLabel.textContent = navLabel || '';
  const touch = innerWidth < 900 || !window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (R || touch) { root.classList.add('is-ready'); }   // phones/tablets: page shown at once (curtain only on leaving)
  else if (navLabel !== null || !firstVisit) {
    if (curNum) curNum.textContent = '→';
    if (curBar) curBar.style.transform = 'scaleX(1)';
    requestAnimationFrame(() => setTimeout(liftCurtains, 180));
  } else {
    // first page of the visit: counter 0 → 100, curtains lift after ≥ 1.3 s (never waits for the 3D)
    const step = now => {
      const p = Math.min(1, (now - t0) / 1600), v = 1 - Math.pow(1 - p, 3);
      if (curNum) curNum.textContent = String(Math.round(99 * v));
      if (curBar) curBar.style.transform = `scaleX(${v * 0.99})`;
      if (p < 1 && !root.classList.contains('is-ready')) requestAnimationFrame(step);
      else if (curNum) curNum.textContent = '100';
    };
    requestAnimationFrame(step);
    setTimeout(liftCurtains, Math.max(0, 1300 - (performance.now() - t0)));
  }

  // internal links: curtains fall, then the browser navigates (the next page lifts them)
  function leave(url, label) {
    if (R || !curA || !curB || root.classList.contains('is-leaving')) { location.href = url; return; }
    root.classList.add('is-leaving'); jarSignal();
    try { sessionStorage.setItem('labro_nav', label || ''); } catch (_) { /* ignore */ }
    if (curNum) curNum.textContent = '→';
    if (curLabel) { curLabel.textContent = label || ''; curLabel.animate([{ opacity: 0, translate: '0 80px' }, { opacity: 1, translate: '0 0' }], { duration: 800, delay: 380, easing: E, fill: 'both' }); }
    if (curBar) curBar.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 1000, delay: 300, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'both' });
    const down = [{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }];
    [curA, curB].forEach(el => el.getAnimations().forEach(a => a.cancel()));
    curA.animate(down, { duration: 620, easing: EIO, fill: 'forwards' });
    curB.animate(down, { duration: 620, delay: 110, easing: EIO, fill: 'forwards' }).finished.then(() => { location.href = url; });
  }
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target && a.target !== '_self' || a.hasAttribute('download') || a.hasAttribute('data-checkout')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !/^https?:$/.test(url.protocol)) return;
    if (url.pathname === location.pathname && url.search === location.search) return;   // same page: anchors scroll
    e.preventDefault();
    const file = url.pathname.split('/').pop();
    leave(url.href, LABELS[file] !== undefined ? LABELS[file] : (url.pathname.includes('/blog/') ? 'Стаття' : ''));
  });
  addEventListener('pageshow', e => {                          // back/forward cache: never come back to a covered page
    if (!e.persisted) return;
    root.classList.remove('is-leaving');
    [curA, curB].forEach(el => el && el.getAnimations().forEach(a => a.cancel()));
    root.classList.add('is-ready'); jarSignal();
  });

  // ═══ text & reveal system ═══
  function split(el, mode) {
    if (el.__split) return; el.__split = true;
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        if (!n.nodeValue.trim()) return;
        const frag = document.createDocumentFragment();
        n.nodeValue.split(/(\s+)/).forEach(w => {
          if (!w) return;
          if (!w.trim()) { frag.appendChild(document.createTextNode(' ')); return; }
          const ws = document.createElement('span'); ws.className = 'w';
          if (mode === 'ch') [...w].forEach(ch => { const c = document.createElement('span'); c.className = 'ch'; c.textContent = ch; ws.appendChild(c); });
          else ws.textContent = w;
          frag.appendChild(ws);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && !n.classList.contains('w') && n.tagName !== 'svg') walk(n);
    });
    walk(el);
    el.__units = $$(mode === 'ch' ? '.ch' : '.w', el);
  }
  function buildOdo(el) {
    if (el.__odo) return;
    const txt = el.textContent.trim(); el.textContent = '';
    el.classList.add('odo');
    const sr = document.createElement('span'); sr.className = 'sr-only'; sr.textContent = txt; el.appendChild(sr);
    el.__odo = [...txt].map(ch => {
      const col = document.createElement('span'); col.setAttribute('aria-hidden', 'true'); col.className = 'odo-col';
      el.appendChild(col);
      if (!/\d/.test(ch)) { col.textContent = ch; return null; }
      const strip = document.createElement('span'); strip.className = 'odo-strip';
      for (let i = 0; i < 20; i++) { const s = document.createElement('span'); s.textContent = String(i % 10); strip.appendChild(s); }
      col.appendChild(strip);
      return { strip, target: 10 + (+ch) };
    }).filter(Boolean);
  }
  const setText = (el, v) => { const tn = [...el.childNodes].find(n => n.nodeType === 3); if (tn) tn.nodeValue = v; else el.textContent = v; };
  function prep(el) {
    if (el.hasAttribute('data-reveal')) el.style.opacity = '0';
    if (el.__units && (el.hasAttribute('data-chars') || el.hasAttribute('data-words'))) el.__units.forEach(c => { c.style.opacity = '0'; });
    if (el.hasAttribute('data-rule')) el.style.transform = 'scaleX(0)';
  }
  function showNow(el) {
    el.__done = true; el.style.opacity = '';
    if (el.hasAttribute('data-rule')) el.style.transform = '';
    $$('.ch,.w', el).forEach(c => { c.style.opacity = ''; });
    if (el.hasAttribute('data-mark')) el.classList.add('is-marked');
    if (el.hasAttribute('data-count')) setText(el, el.getAttribute('data-count'));
    if (el.__odo) el.__odo.forEach(o => { o.strip.style.transform = `translateY(${-o.target * 1.12}em)`; });
  }
  function scramble(el, d) {
    const tn = [...el.childNodes].find(n => n.nodeType === 3 && n.nodeValue.trim()); if (!tn) return;
    const txt = tn.nodeValue, pool = 'АБВГДЕЄЖЗИІКЛМНОПРСТУФХЦЧШЮЯ0123456789/#+';
    const start = performance.now() + d, dur = 900;
    const step = now => {
      const p = (now - start) / dur;
      if (p < 0) { requestAnimationFrame(step); return; }
      if (p >= 1) { tn.nodeValue = txt; return; }
      const n = Math.floor(p * txt.length);
      tn.nodeValue = txt.slice(0, n) + [...txt.slice(n)].map(c => (c === ' ' ? ' ' : pool[(Math.random() * pool.length) | 0])).join('');
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  function play(el) {
    if (el.__done) return;
    if (R) { showNow(el); return; }
    el.__done = true;
    const d = (+el.getAttribute('data-delay') || 0) + (el.__base || 0);
    if (el.hasAttribute('data-reveal')) { el.style.opacity = ''; anim(el, [{ opacity: 0, translate: '0 44px' }, { opacity: 1, translate: '0 0' }], { duration: 1050, delay: d, easing: E, fill: 'backwards' }); }
    if (el.hasAttribute('data-chars')) {
      const cs = el.__units || [], isW = !!(cs[0] && cs[0].classList.contains('w'));
      const step = Math.min(isW ? 70 : 30, (isW ? 700 : 1000) / Math.max(1, cs.length));
      cs.forEach((c, i) => { c.style.opacity = ''; anim(c, [{ opacity: 0, transform: 'perspective(600px) translateY(.6em) rotateX(-88deg)' }, { opacity: 1, transform: 'none' }], { duration: 1100, delay: d + i * step, easing: E, fill: 'backwards' }); });
    }
    if (el.hasAttribute('data-words')) {
      const ws = $$('.w', el), step = Math.min(22, 800 / Math.max(1, ws.length));
      ws.forEach((w, i) => { w.style.opacity = ''; anim(w, [{ opacity: 0, translate: '0 .7em' }, { opacity: 1, translate: '0 0' }], { duration: 850, delay: d + i * step, easing: E, fill: 'backwards' }); });
    }
    if (el.hasAttribute('data-rule')) { el.style.transform = ''; anim(el, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 1300, delay: d, easing: E, fill: 'backwards' }); }
    if (el.hasAttribute('data-mark')) setTimeout(() => el.classList.add('is-marked'), d + 350);
    if (el.hasAttribute('data-scramble')) scramble(el, d);
    if (el.hasAttribute('data-count')) {
      const to = +el.getAttribute('data-count'), dur = 1700, start = performance.now() + d;
      setText(el, '0');
      const step = now => { const p = Math.min(1, Math.max(0, (now - start) / dur)); setText(el, String(Math.round(to * (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p))))); if (p < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    }
    if (el.__odo) el.__odo.forEach((o, i) => { o.strip.style.transform = `translateY(${-o.target * 1.12}em)`; anim(o.strip, [{ transform: 'translateY(0em)' }, { transform: `translateY(${-o.target * 1.12}em)` }], { duration: 1800 + i * 300, delay: d, easing: E, fill: 'backwards' }); });
  }

  const REVEAL = '[data-reveal],[data-chars],[data-words],[data-count],[data-mark],[data-odo],[data-rule],[data-scramble]';
  $$('[data-chars]').forEach(el => split(el, LITE ? 'w' : 'ch'));
  $$('[data-words],[data-fill]').forEach(el => split(el, 'w'));
  $$('[data-odo]').forEach(buildOdo);
  const pending = $$(REVEAL);
  if (R) pending.forEach(showNow);
  else pending.forEach(el => { prep(el); el.__base = el.getBoundingClientRect().top < innerHeight ? (root.classList.contains('is-ready') ? 0 : 450) : 0; });

  let io = null, revealsStarted = false;
  function startReveals() {
    if (revealsStarted || R) return; revealsStarted = true;
    io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { io.unobserve(en.target); play(en.target); } }), { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    pending.forEach(el => { if (!el.__done) io.observe(el); });
    $$('[data-marquee]').forEach(el => { const d = +el.getAttribute('data-dir') || 1; el.animate(d > 0 ? [{ translate: '0 0' }, { translate: '-50% 0' }] : [{ translate: '-50% 0' }, { translate: '0 0' }], { duration: d > 0 ? 34000 : 42000, iterations: Infinity }); });
    $$('[data-rotate]').forEach(el => el.animate([{ rotate: '0deg' }, { rotate: '360deg' }], { duration: 18000, iterations: Infinity }));
    $$('[data-pulse]').forEach(el => el.animate([{ opacity: 1, scale: '1' }, { opacity: 0.35, scale: '.65' }, { opacity: 1, scale: '1' }], { duration: 1600, iterations: Infinity, easing: 'ease-in-out' }));
    $$('[data-sweep]').forEach(el => el.animate([{ transform: 'translateX(-120%) skewX(-18deg)' }, { transform: 'translateX(560%) skewX(-18deg)' }], { duration: 2400, delay: 1200, endDelay: 2600, iterations: Infinity, easing: 'cubic-bezier(.65,0,.35,1)' }));
    // infinite loops pause off-screen (no work for invisible marquees)
    const loopIo = new IntersectionObserver(es => es.forEach(en => en.target.getAnimations().forEach(a => (en.isIntersecting ? a.play() : a.pause()))));
    $$('[data-marquee],[data-rotate],[data-sweep]').forEach(el => loopIo.observe(el));
    scrollFx();
  }

  // ═══ scroll-driven effects: one passive listener, work only in an animation frame ═══
  // words not yet "filled" stay readable: 0.45 keeps ≥ 3:1 contrast for this large text (the design used 0.14)
  const FILL_MIN = 0.45;
  const fills = $$('[data-fill]').map(el => ({ el, ws: $$('.w', el), p: -1 }));
  const stacks = $$('[data-stack]').map(el => [...el.children]);
  const progs = $$('[data-progress]');
  const pars = $$('[data-parallax]');
  const readBar = document.querySelector('[data-readbar]');
  const header = document.querySelector('[data-header]');
  const barPage = !!document.querySelector('[data-bar]');
  let ticking = false;
  function scrollFx() {
    ticking = false;
    const vh = innerHeight, sy = scrollY;
    if (PAGE === 'home') root.classList.toggle('is-solid', sy > 40 || root.classList.contains('menu-open'));
    if (barPage) root.classList.toggle('bar-on', sy > vh * 0.7 && !root.classList.contains('is-locked'));
    fills.forEach(f => {
      const r = f.el.getBoundingClientRect();
      const p = R ? 1 : Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.25)));
      if (Math.abs(p - f.p) < 0.002) return; f.p = p;
      const lit = p * (f.ws.length + 3);
      f.ws.forEach((w, j) => { const o = (FILL_MIN + (1 - FILL_MIN) * Math.min(1, Math.max(0, lit - j))).toFixed(2); if (w.__o !== o) { w.__o = o; w.style.opacity = o; } });
    });
    if (!R) stacks.forEach(cards => {
      const rs = cards.map(c => c.getBoundingClientRect());
      for (let i = 0; i < cards.length - 1; i++) {
        const p = Math.min(1, Math.max(0, (rs[i].bottom - rs[i + 1].top) / rs[i].height));
        cards[i].style.transform = 'scale(' + (1 - p * 0.07).toFixed(4) + ')';
        const dim = cards[i].querySelector('[data-dim]'); if (dim) dim.style.opacity = (p * 0.6).toFixed(3);
      }
    });
    progs.forEach(el => { const r = el.parentElement.getBoundingClientRect(); el.style.transform = 'scaleY(' + Math.min(1, Math.max(0, (vh * 0.6 - r.top) / r.height)).toFixed(4) + ')'; });
    if (readBar) { const docH = document.documentElement.scrollHeight - vh; readBar.style.transform = 'scaleX(' + (docH > 0 ? Math.min(1, sy / docH) : 0).toFixed(4) + ')'; }
    if (!R) pars.forEach(el => { el.style.translate = '0 ' + (sy * (+el.getAttribute('data-parallax'))).toFixed(1) + 'px'; });
    // reveal anything that was skipped by a fast scroll past it
    if (io) pending.forEach(el => { if (!el.__done && el.getBoundingClientRect().bottom < 0) { io.unobserve(el); showNow(el); } });
  }
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(scrollFx); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  if (header && PAGE !== 'home') root.classList.add('is-solid');
  scrollFx();
  // a page shown at once (phones, reduced motion, back/forward) starts its reveals now — after everything
  // scrollFx() uses is defined (startReveals calls it)
  if (root.classList.contains('is-ready')) startReveals();

  // ═══ pointer: custom cursor, magnetic buttons, tilt cards (real mouse only) ═══
  if (FINE && !R) {
    const cursor = document.querySelector('[data-cursor]');
    const ptr = { x: innerWidth / 2, y: innerHeight / 2 }, cur = { x: ptr.x, y: ptr.y, s: 1, hover: false, drag: false };
    let moved = false, craf = 0;
    const magnets = $$('[data-magnetic]');
    const cursorFrame = () => {
      craf = 0;
      cur.x += (ptr.x - cur.x) * 0.2; cur.y += (ptr.y - cur.y) * 0.2;
      cur.s += ((cur.drag ? 2.6 : cur.hover ? 1.7 : 1) - cur.s) * 0.15;
      cursor.style.transform = `translate3d(${(cur.x - 17).toFixed(1)}px,${(cur.y - 17).toFixed(1)}px,0) scale(${cur.s.toFixed(3)})`;
      if (Math.abs(ptr.x - cur.x) > 0.3 || Math.abs(ptr.y - cur.y) > 0.3 || Math.abs((cur.drag ? 2.6 : cur.hover ? 1.7 : 1) - cur.s) > 0.01) craf = requestAnimationFrame(cursorFrame);
    };
    addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      ptr.x = e.clientX; ptr.y = e.clientY;
      if (!moved) { moved = true; cur.x = ptr.x; cur.y = ptr.y; if (cursor) cursor.style.opacity = '1'; }
      const t = e.target && e.target.closest ? e.target : null;
      cur.hover = !!(t && t.closest('a,button,input,label,textarea'));
      cur.drag = !!(t && t.closest('[data-drag3d]'));
      if (cursor && !craf) craf = requestAnimationFrame(cursorFrame);
      magnets.forEach(m => {
        const r = m.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        const inside = r.height > 0 && Math.abs(dx) < r.width / 2 + 30 && Math.abs(dy) < r.height / 2 + 30;
        const v = inside ? `${(dx * 0.18).toFixed(1)}px ${(dy * 0.28).toFixed(1)}px` : '0px 0px';
        if (m.__t !== v) { m.__t = v; m.style.translate = v; }
      });
    }, { passive: true });
    document.addEventListener('mouseleave', () => { if (cursor) cursor.style.opacity = '0'; moved = false; });
    $$('[data-tilt]').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.transition = 'transform .12s ease-out';
        el.style.transform = `perspective(1000px) rotateX(${(0.5 - y) * 8}deg) rotateY(${(x - 0.5) * 10}deg)`;
        el.style.setProperty('--mx', x * 100 + '%'); el.style.setProperty('--my', y * 100 + '%');
      });
      el.addEventListener('pointerleave', () => { el.style.transition = 'transform .8s cubic-bezier(.2,.8,.2,1)'; el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)'; });
    });
  }

  // ═══ mobile menu ═══
  const menu = document.querySelector('[data-menu]'), toggle = document.querySelector('[data-menu-toggle]');
  function setMenu(open) {
    if (!menu || !toggle) return;
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Закрити меню' : 'Меню');
    root.classList.toggle('menu-open', open);
    root.classList.toggle('is-locked', open);
    root.style.overflow = open ? 'hidden' : '';
    if (open) {
      anim(menu, [{ clipPath: 'circle(0% at calc(100% - 40px) 36px)' }, { clipPath: 'circle(150% at calc(100% - 40px) 36px)' }], { duration: 750, easing: EIO });
      $$('[data-mi]', menu).forEach((c, i) => anim(c, [{ opacity: 0, translate: '0 40px' }, { opacity: 1, translate: '0 0' }], { duration: 800, delay: 200 + i * 55, easing: E, fill: 'backwards' }));
      const first = menu.querySelector('a'); if (first) first.focus({ preventScroll: true });
    }
    scrollFx(); jarSignal();
  }
  if (toggle) toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  if (menu) menu.addEventListener('click', e => { if (e.target.closest('[data-checkout]')) setMenu(false); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && toggle && toggle.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
  });
  addEventListener('resize', () => { if (innerWidth >= 1120 && toggle && toggle.getAttribute('aria-expanded') === 'true') setMenu(false); }, { passive: true });

  // ═══ FAQ accordion (one open at a time; the first one starts open, as in the design) ═══
  $$('[data-faq-list]').forEach(list => {
    const items = $$('[data-faq]', list);
    const set = (item, open) => { item.classList.toggle('is-open', open); item.querySelector('button').setAttribute('aria-expanded', String(open)); };
    items.forEach((item, i) => {
      set(item, i === 0);
      item.querySelector('button').addEventListener('click', () => { const open = !item.classList.contains('is-open'); items.forEach(x => set(x, false)); set(item, open); });
    });
  });

  // ═══ tabs (product details), roving tabindex + arrow keys ═══
  $$('[data-tabs]').forEach(box => {
    const tabs = $$('[role="tab"]', box);
    const select = (t, focus) => {
      tabs.forEach(x => { const on = x === t; x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1; document.getElementById(x.getAttribute('aria-controls')).hidden = !on; });
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      anim(panel, [{ opacity: 0, translate: '0 22px' }, { opacity: 1, translate: '0 0' }], { duration: 700, easing: E, fill: 'backwards' });
      if (focus) t.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', e => {
        const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
        if (k) { e.preventDefault(); select(tabs[(i + k + tabs.length) % tabs.length], true); }
        if (e.key === 'Home') { e.preventDefault(); select(tabs[0], true); }
        if (e.key === 'End') { e.preventDefault(); select(tabs[tabs.length - 1], true); }
      });
    });
  });

  // ═══ blog categories ═══
  const catTabs = document.querySelector('[data-cat-tabs]'), catGrid = document.querySelector('[data-cat-grid]');
  if (catTabs && catGrid) $$('[data-cat]', catTabs).forEach(btn => btn.addEventListener('click', () => {
    const cat = btn.dataset.cat;
    $$('[data-cat]', catTabs).forEach(b => b.setAttribute('aria-selected', String(b === btn)));
    let n = 0;
    [...catGrid.children].forEach(card => {
      const show = cat === 'Усі' || card.dataset.cat === cat;
      card.hidden = !show;
      if (show) { showNow(card); anim(card, [{ opacity: 0, translate: '0 22px' }, { opacity: 1, translate: '0 0' }], { duration: 700, delay: n++ * 60, easing: E, fill: 'backwards' }); }
    });
  }));

  // ═══ packaging switch (3D jar + texts) ═══
  $$('[data-pack-switch] input[name="pack"]').forEach(radio => radio.addEventListener('change', () => {
    if (!radio.checked) return;
    const v = radio.value;
    if (root.dataset.pack === v) return;
    root.dataset.pack = v;
    $$('input[name="pack"]').forEach(r => { r.checked = r.value === v; });
    $$('.pack-' + v).forEach(el => anim(el, [{ opacity: 0, translate: '0 22px' }, { opacity: 1, translate: '0 0' }], { duration: 700, delay: 250, easing: E, fill: 'backwards' }));
    jarSignal();
  }));

  // ═══ in-page anchors: smooth scroll under the fixed header ═══
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || a.hasAttribute('data-checkout')) return;
    const id = a.getAttribute('href'); if (id.length < 2) return;
    const t = document.getElementById(id.slice(1)); if (!t) return;
    e.preventDefault();
    scrollTo({ top: t.getBoundingClientRect().top + scrollY - 72, behavior: R ? 'auto' : 'smooth' });
    if (history.replaceState) history.replaceState(null, '', id);
  });

  // ═══ 3D jar: after the page has loaded, only with motion allowed and a capable device ═══
  // It starts on the first interaction (the static poster is shown until then), so it never competes with the
  // first render or the main thread during load.
  if (!R && document.querySelector('[data-jar]') && window.WebGLRenderingContext) {
    const conn = navigator.connection || {};
    const weak = conn.saveData || (navigator.deviceMemory && navigator.deviceMemory <= 2) || (navigator.hardwareConcurrency || 4) <= 2;
    if (!weak) {
      const go = () => {
        ['pointermove', 'pointerdown', 'touchstart', 'scroll', 'keydown', 'wheel'].forEach(t => removeEventListener(t, go, { passive: true }));
        const base = document.querySelector('link[rel="stylesheet"]').getAttribute('href').replace(/assets\/site\.css.*$/, '');
        import(new URL(base + 'assets/js/jar3d.js', location.href).href)
          .then(m => m.start({ markUrl: new URL(base + 'assets/img/brand/labro-mark-texture.png', location.href).href }))
          .catch(() => { /* posters stay */ });
      };
      // first sign of a person (mouse move, touch, scroll, key): never during the initial load, never for a bot
      const arm = () => ['pointermove', 'pointerdown', 'touchstart', 'scroll', 'keydown', 'wheel'].forEach(t => addEventListener(t, go, { passive: true, once: true }));
      if (document.readyState === 'complete') arm(); else addEventListener('load', arm, { once: true });
    }
  }

  // product page: quantity picker drives the order button total and the checkout quantity
  const picker = document.querySelector('[data-qty-picker]');
  if (picker) {
    let q = 1;
    const out = picker.querySelector('[data-qty-value]'), total = document.querySelector('[data-qty-total]');
    const render = () => {
      const price = (window.LabroPrice && window.LabroPrice.kop) || Number(document.body.dataset.priceKop) || 99000;
      const max = (window.LabroPrice && window.LabroPrice.maxQty) || 5;
      q = Math.min(Math.max(1, q), max);
      out.textContent = String(q);
      if (total) total.textContent = String(price * q / 100).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      $$('[data-qty-step]', picker).forEach(b => { b.disabled = (+b.dataset.qtyStep < 0 && q <= 1) || (+b.dataset.qtyStep > 0 && q >= max); });
      document.body.dataset.qty = String(q);
    };
    $$('[data-qty-step]', picker).forEach(b => b.addEventListener('click', () => { q += +b.dataset.qtyStep; render(); }));
    document.addEventListener('labro:price', render);
    render();
  }
})();
