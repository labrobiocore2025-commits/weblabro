'use strict';
// LABRO BIOCORE landing. Loaded with `defer`; no inline scripts or handlers (strict CSP).
// The backend base URL comes from <meta name="labro-api">; the monobank token never reaches the browser.

const API = document.querySelector('meta[name="labro-api"]').content.replace(/\/$/, '');
const CONSENT_VERSION = '1.0';
const MANAGER_TG = 'https://t.me/LaBroudi';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ═══════════════════════════════════
//  PARTICLES CANVAS (hero only) — skipped for reduced motion, paused off-screen
// ═══════════════════════════════════
(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || reducedMotion) return;
  const ctx = canvas.getContext('2d');
  const hero = canvas.closest('.hero') || canvas.parentElement;
  const count = window.innerWidth < 600 ? 32 : 70;
  const P = [];
  let running = false;

  function resize() {
    canvas.width = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
  }
  resize();
  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 150); }, { passive: true });

  for (let i = 0; i < count; i++) {
    P.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - .5) * .28,
      vy: (Math.random() - .5) * .28,
      r: Math.random() * 1.4 + .4,
      a: Math.random() * .25 + .05,
      c: ['#6B8B3A', '#C4944A', '#7D5228', '#3A5220'][Math.floor(Math.random() * 4)]
    });
  }

  function draw() {
    if (!running) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    P.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      ctx.globalAlpha = p.a;
      ctx.fillStyle = p.c;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      for (let j = i + 1; j < P.length; j++) {
        const p2 = P[j];
        const d = Math.hypot(p2.x - p.x, p2.y - p.y);
        if (d < 130) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = '#3A5220';
          ctx.globalAlpha = (1 - d / 130) * .07;
          ctx.lineWidth = .5;
          ctx.stroke();
        }
      }
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  new IntersectionObserver(([e]) => {
    const was = running;
    running = e.isIntersecting && !document.hidden;
    if (running && !was) requestAnimationFrame(draw);
  }).observe(hero);
})();

if (reducedMotion) document.querySelectorAll('svg').forEach(s => s.pauseAnimations && s.pauseAnimations());

// ═══════════════════════════════════
//  STICKY NAV
// ═══════════════════════════════════
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 60), { passive: true });

// ═══════════════════════════════════
//  REVEALS
// ═══════════════════════════════════
const revealables = document.querySelectorAll('.reveal,.prob-card,.ing-card,.bene-item,.how-step,.order-card');
if ('IntersectionObserver' in window && !reducedMotion) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  revealables.forEach(el => io.observe(el));
} else {
  revealables.forEach(el => el.classList.add('vis'));
}

// ═══════════════════════════════════
//  3D CARD TILT — only for a real mouse
// ═══════════════════════════════════
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reducedMotion) {
  document.querySelectorAll('.ing-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `translateY(-6px) perspective(700px) rotateX(${-y * 7}deg) rotateY(${x * 7}deg)`;
      card.style.transition = 'transform .08s ease';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0) perspective(700px) rotateX(0deg) rotateY(0deg)';
      card.style.transition = 'transform .5s ease';
    });
  });
}

// ═══════════════════════════════════
//  FAQ ACCORDION (buttons with aria-expanded)
// ═══════════════════════════════════
document.querySelectorAll('.faq-q').forEach(q => {
  q.addEventListener('click', () => {
    const item = q.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => {
      i.classList.remove('open');
      i.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      i.querySelector('.faq-ans').style.maxHeight = null;
    });
    if (!isOpen) {
      item.classList.add('open');
      q.setAttribute('aria-expanded', 'true');
      const ans = item.querySelector('.faq-ans');
      ans.style.maxHeight = item.querySelector('.faq-ans-in').offsetHeight + 'px';
    }
  });
});

// ═══════════════════════════════════
//  SMOOTH SCROLL
// ═══════════════════════════════════
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const t = document.querySelector(id);
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' }); }
  });
});

// ═══════════════════════════════════
//  PRICE — from the backend, so the page shows exactly what the invoice charges
// ═══════════════════════════════════
let priceKop = Number(document.body.dataset.priceKop) || 99000;
let maxQty = 5;
const fmtUah = kop => (kop % 100 ? (kop / 100).toFixed(2).replace('.', ',') : String(kop / 100))
  .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

function renderPrice() {
  document.querySelectorAll('[data-price]').forEach(el => { el.textContent = fmtUah(priceKop) + ' ₴'; el.classList.add('has-price'); });
  renderTotal();
}
fetch(`${API}/api/price`, { mode: 'cors' })
  .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
  .then(d => {
    if (Number.isInteger(d.price_kop) && d.price_kop > 0) priceKop = d.price_kop;
    if (Number.isInteger(d.max_qty) && d.max_qty > 0) maxQty = d.max_qty;
    renderPrice();
  })
  .catch(() => renderPrice());

// ═══════════════════════════════════
//  CHECKOUT MODAL
// ═══════════════════════════════════
const $ = id => document.getElementById(id);
const moModal = $('checkoutModal');
const moForm = $('moForm');
const moPayBtn = $('moPayBtn');
const moCodBtn = $('moCodBtn');
const fields = { name: $('moName'), phone: $('moPhone'), city: $('moCity'), comment: $('moComment') };
const consent = $('moConsent');
let moQty = 1;
let openedAt = 0;
let lastFocus = null;
let busy = false;

function renderTotal() {
  $('moQty').textContent = moQty;
  $('moTotal').textContent = fmtUah(priceKop * moQty);
  $('moMinus').disabled = moQty <= 1;
  $('moPlus').disabled = moQty >= maxQty;
}

function focusables() {
  return [...moModal.querySelectorAll('a[href],button:not([disabled]),input:not([tabindex="-1"]),textarea,select')]
    .filter(el => el.offsetParent !== null);
}

function moOpen(trigger) {
  lastFocus = trigger || document.activeElement;
  moModal.classList.add('open');
  moModal.inert = false;
  document.body.style.overflow = 'hidden';
  moReset();
  openedAt = Date.now();
  setTimeout(() => fields.name.focus(), 50);
}
function moClose() {
  if (!moModal.classList.contains('open')) return;
  moModal.classList.remove('open');
  moModal.inert = true;
  document.body.style.overflow = '';
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}
function moState(s) {
  moForm.hidden = s !== 'form';
  ['loading', 'error', 'cod-success'].forEach(k => $('mo-' + k).classList.toggle('on', s === k));
  if (s !== 'form') {
    const h = moModal.querySelector(`#mo-${s} .mo-state-h`);
    if (h) h.focus();
  }
}
function moReset() {
  moQty = 1;
  renderTotal();
  Object.values(fields).forEach(clearError);
  consent.closest('.mo-consent').classList.remove('err');
  setBusy(false);
  moState('form');
}
function setBusy(b) {
  busy = b;
  moPayBtn.disabled = moCodBtn.disabled = b;
  moForm.setAttribute('aria-busy', String(b));
}

document.querySelectorAll('[data-checkout]').forEach(btn => {
  btn.addEventListener('click', e => { e.preventDefault(); moOpen(btn); });
});
$('moClose').addEventListener('click', moClose);
$('moResetBtn').addEventListener('click', moReset);
$('moCodClose').addEventListener('click', moClose);
moModal.addEventListener('click', e => { if (e.target === moModal) moClose(); });
document.addEventListener('keydown', e => {
  if (!moModal.classList.contains('open')) return;
  if (e.key === 'Escape') { moClose(); return; }
  if (e.key === 'Tab') {  // focus trap
    const f = focusables();
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

$('moMinus').addEventListener('click', () => { moQty = Math.max(1, moQty - 1); renderTotal(); });
$('moPlus').addEventListener('click', () => { moQty = Math.min(maxQty, moQty + 1); renderTotal(); });

// ── phone mask: always "+380 XX XXX XX XX", 9 local digits ──
function localDigits(v) {
  let d = v.replace(/\D/g, '');
  if (d.startsWith('380')) d = d.slice(3);            // the field's own +380 prefix
  for (const p of ['380', '38', '80']) {               // a country/trunk prefix typed or pasted by the user
    if (d.startsWith(p) && d.length - p.length >= 9) { d = d.slice(p.length); break; }
  }
  return d.replace(/^0+/, '').slice(0, 12);            // UA local numbers never start with 0
}
function formatPhone(local) {
  const g = [local.slice(0, 2), local.slice(2, 5), local.slice(5, 7), local.slice(7, 9), local.slice(9)].filter(Boolean);
  return '+380' + (g.length ? ' ' + g.join(' ') : '');
}
fields.phone.addEventListener('input', () => {
  fields.phone.value = formatPhone(localDigits(fields.phone.value));
  if (fields.phone.getAttribute('aria-invalid') === 'true') validate('phone');
});
fields.phone.addEventListener('focus', () => {
  if (!fields.phone.value) fields.phone.value = '+380 ';
  const n = fields.phone.value.length;
  requestAnimationFrame(() => fields.phone.setSelectionRange(n, n));
});
fields.phone.addEventListener('keydown', e => {
  // never delete the +380 prefix
  if ((e.key === 'Backspace' && fields.phone.selectionStart <= 5 && fields.phone.selectionEnd <= 5)) e.preventDefault();
});

// ── validation with messages under each field ──
const RULES = {
  name: v => v.trim().length >= 3 || "Вкажіть ім'я та прізвище (щонайменше 3 символи)",
  phone: v => localDigits(v).length === 9 || 'Вкажіть номер повністю: +380 XX XXX XX XX',
  city: v => v.trim().length >= 5 || 'Вкажіть місто та номер відділення Нової Пошти',
};
function clearError(el) {
  el.removeAttribute('aria-invalid');
}
function validate(key) {
  const el = fields[key];
  const res = RULES[key] ? RULES[key](el.value) : true;
  if (res === true) { clearError(el); return true; }
  el.setAttribute('aria-invalid', 'true');
  $(el.id + 'Err').textContent = res;
  return false;
}
['name', 'phone', 'city'].forEach(k => fields[k].addEventListener('blur', () => { if (fields[k].value) validate(k); }));
['name', 'city'].forEach(k => fields[k].addEventListener('input', () => {
  if (fields[k].getAttribute('aria-invalid') === 'true') validate(k);
}));
consent.addEventListener('change', () => { if (consent.checked) consent.closest('.mo-consent').classList.remove('err'); });

function readForm() {
  const bad = ['name', 'phone', 'city'].filter(k => !validate(k));
  const consentBox = consent.closest('.mo-consent');
  consentBox.classList.toggle('err', !consent.checked);
  if (bad.length) { fields[bad[0]].focus(); return null; }
  if (!consent.checked) { consent.focus(); return null; }
  return {
    name: fields.name.value.trim(),
    phone: '+380' + localDigits(fields.phone.value),
    city: fields.city.value.trim(),
    comment: fields.comment.value.trim(),
    qty: moQty,
    consent: true,
    consent_version: CONSENT_VERSION,
    website: $('moWebsite').value,       // honeypot
    form_ms: Date.now() - openedAt,
  };
}

const ERRORS = {
  too_many_requests: 'Забагато спроб за останню годину. Надішліть замовлення менеджеру — він оформить його вручну.',
  invalid_fields: 'Перевірте, будь ласка, дані у формі.',
  consent_required: 'Потрібна згода з Політикою конфіденційності.',
  too_fast: 'Будь ласка, заповніть форму ще раз.',
};
function orderText(f, payLabel) {
  return `Нейро-Баланс × ${f.qty} = ${fmtUah(priceKop * f.qty)} ₴\nІм'я: ${f.name}\nТел: ${f.phone}\nДоставка: ${f.city}\nОплата: ${payLabel}` +
    (f.comment ? `\nКоментар: ${f.comment}` : '');
}
function showFailure(f, title, payLabel, code) {
  $('moErrorTitle').textContent = title;
  $('moErrorText').textContent = ERRORS[code] || 'Надішліть замовлення менеджеру — він оформить його вручну.';
  $('moOrderText').textContent = orderText(f, payLabel);
  moState('error');
}

async function submit(payType) {
  if (busy) return;
  const f = readForm();
  if (!f) return;
  setBusy(true);
  $('moLoadingText').textContent = payType === 'online'
    ? 'Створюємо рахунок і перенаправляємо на сторінку оплати monobank…'
    : 'Надсилаємо замовлення менеджеру…';
  moState('loading');
  let data = {};
  let status = 0;
  try {
    const resp = await fetch(`${API}/api/checkout`, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...f, pay_type: payType }),
    });
    status = resp.status;
    data = await resp.json().catch(() => ({}));
  } catch (_) { /* network error → fallback below */ }

  if (payType === 'online' && status === 200 && data.pageUrl) {
    window.location.assign(data.pageUrl);
    return;
  }
  if (payType === 'cod' && status === 200 && data.ok) {
    $('moCodTrack').href = data.ref ? `thanks.html?ref=${encodeURIComponent(data.ref)}` : MANAGER_TG;
    setBusy(false);
    moState('cod-success');
    return;
  }
  setBusy(false);
  if (status === 400 && data.error === 'invalid_fields') { moState('form'); readForm(); return; }
  showFailure(f, payType === 'online' ? 'Онлайн-оплата тимчасово недоступна' : 'Не вдалося надіслати замовлення',
    payType === 'online' ? 'онлайн' : 'накладений платіж', data.error);
}
moPayBtn.addEventListener('click', () => submit('online'));
moCodBtn.addEventListener('click', () => submit('cod'));
moForm.addEventListener('submit', e => { e.preventDefault(); submit('online'); });

$('moCopyBtn').addEventListener('click', () => {
  const btn = $('moCopyBtn');
  const done = () => { btn.textContent = '✓ Скопійовано'; setTimeout(() => { btn.textContent = 'Скопіювати замовлення'; }, 2000); };
  if (navigator.clipboard) navigator.clipboard.writeText($('moOrderText').textContent).then(done, () => {});
});
