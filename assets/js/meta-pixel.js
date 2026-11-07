'use strict';
// Meta Pixel behind an explicit cookie consent (privacy.html, section "Cookie та реклама").
//
// * Until the visitor clicks «Прийняти», nothing from Meta is loaded at all: no fbevents.js, no cookies,
//   no requests. «Відхилити» (or no choice) = no tracking. The choice is kept in localStorage.
// * autoConfig is off: Meta's automatic events read button texts and form fields and could pick up
//   personal data. Only the explicit events below are sent, and none of them carries a name or phone.
// * data-pixel="purchase" (thanks.html, order status): no banner, no PageView; fbevents.js is loaded only
//   for the single Purchase, after thanks.js has removed the order ref from the URL.
// Other scripts use window.LabroPixel: track(), purchase(), consent(), browserIds().
(function () {
  const PIXEL_ID = '1426477409684561';
  const FBEVENTS = 'https://connect.facebook.net/en_US/fbevents.js';
  const KEY = 'labro_cookie_consent';
  const POLICY = '1.1';                       // privacy.html version the choice was made under
  const script = document.currentScript;
  const MODE = (script && script.dataset.pixel) || 'full';
  let loaded = false;

  function readChoice() {
    try {
      const c = JSON.parse(localStorage.getItem(KEY) || 'null');
      return c && c.v === POLICY && typeof c.ads === 'boolean' ? c.ads : null;
    } catch (_) { return null; }
  }
  function saveChoice(ads) {
    try { localStorage.setItem(KEY, JSON.stringify({ v: POLICY, ads, at: new Date().toISOString() })); } catch (_) { /* private mode */ }
  }
  let granted = readChoice() === true;

  // Same queue stub as Meta's official snippet, without the inline <script>.
  function load() {
    if (loaded) return;
    loaded = true;
    if (!window.fbq) {
      const n = window.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!window._fbq) window._fbq = n;
      n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
      n.disablePushState = true;              // no automatic PageView on history.replaceState (thanks.html)
      const t = document.createElement('script');
      t.async = true;
      t.src = FBEVENTS;
      document.head.appendChild(t);
    }
    window.fbq('set', 'autoConfig', false, PIXEL_ID);
    window.fbq('consent', 'grant');
    window.fbq('init', PIXEL_ID);
    if (MODE === 'full') window.fbq('track', 'PageView');
  }

  function deleteFbCookies() {
    const host = location.hostname;
    const domains = ['', host, '.' + host, '.' + host.split('.').slice(-3).join('.')];
    ['_fbp', '_fbc'].forEach(name => domains.forEach(d => {
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax; Secure${d ? '; domain=' + d : ''}`;
    }));
  }

  function setConsent(ads) {
    saveChoice(ads);
    granted = ads;
    if (ads) { load(); return; }
    if (window.fbq) window.fbq('consent', 'revoke');
    deleteFbCookies();
  }

  function cookie(name) {
    const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : '';
  }

  window.LabroPixel = {
    consent: readChoice,
    track(event, params, eventID) {
      if (!granted) return false;
      load();
      window.fbq('track', event, params || {}, eventID ? { eventID } : undefined);
      return true;
    },
    // Purchase with the server's event_id (dedup with CAPI); sent at most once per order in this browser,
    // so reloading thanks.html or reopening the page never counts a second sale.
    purchase(p) {
      if (!p || !/^[0-9a-f]{32}$/.test(p.event_id || '')) return false;
      const KEY = 'labro_px_purchases';
      let done = [];
      try { done = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (_) { done = []; }
      if (!Array.isArray(done)) done = [];
      if (done.includes(p.event_id)) return false;
      const sent = this.track('Purchase', {
        value: p.value, currency: p.currency, num_items: p.num_items, payment_type: p.payment_type,
        content_ids: ['neuro-balance'], content_type: 'product',
      }, p.event_id);
      if (sent) {
        try { localStorage.setItem(KEY, JSON.stringify(done.concat(p.event_id).slice(-20))); } catch (_) { /* ignore */ }
      }
      return sent;
    },
    // Browser ids for the server-side Conversions API (sent with the order only with consent)
    browserIds() {
      if (!granted) return {};
      const ids = {};
      const fbp = cookie('_fbp'), fbc = cookie('_fbc');
      if (fbp) ids.fbp = fbp;
      if (fbc) ids.fbc = fbc;
      return ids;
    },
  };

  if (MODE !== 'full') return;
  if (granted) load();

  // ── banner ──
  let banner = null;
  function closeBanner() {
    if (banner) { banner.remove(); banner = null; }
  }
  function showBanner() {
    if (banner) return;
    banner = document.createElement('section');
    banner.className = 'cc';
    banner.setAttribute('aria-label', 'Налаштування cookie');
    const p = document.createElement('p');
    p.className = 'cc-text';
    p.append('Ми використовуємо рекламні cookie Meta (Facebook, Instagram), щоб вимірювати ефективність реклами. '
      + 'Вони вмикаються лише з Вашої згоди; дані передаються Meta Platforms у США. ');
    const a = document.createElement('a');
    a.href = 'privacy.html#cookies';
    a.textContent = 'Детальніше';
    p.append(a);
    const btns = document.createElement('div');
    btns.className = 'cc-btns';
    [['Відхилити', false], ['Прийняти', true]].forEach(([label, ads]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'cc-btn';
      b.textContent = label;
      b.addEventListener('click', () => { setConsent(ads); closeBanner(); });
      btns.append(b);
    });
    banner.append(p, btns);
    document.body.append(banner);
  }

  function init() {
    if (readChoice() === null) showBanner();
    document.querySelectorAll('[data-cookie-settings]').forEach(el => {
      el.hidden = false;
      el.addEventListener('click', () => { closeBanner(); showBanner(); banner.querySelector('button').focus(); });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
