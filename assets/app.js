'use strict';
// LABRO BIOCORE checkout: price, Meta Pixel events, order modal. Loaded with `defer`; no inline scripts (strict CSP).
// The backend base URL comes from <meta name="labro-api">; the monobank token never reaches the browser.
// Order logic is the same as the previous release; only the look follows the new design (payment method is chosen
// with two radio cards and one submit button instead of two submit buttons).

const API = document.querySelector('meta[name="labro-api"]').content.replace(/\/$/, '');
const CONSENT_VERSION = '1.2';
const MANAGER_TG = 'https://t.me/LaBroudi';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// site root (production "/", a preview copy lives under a sub-path): taken from the stylesheet URL
const BASE = new URL(document.querySelector('link[rel="stylesheet"]').getAttribute('href').replace(/assets\/site\.css.*$/, ''), location.href);
const root = document.documentElement;
const EASE = 'cubic-bezier(.16,1,.3,1)';

// ═══════════════════════════════════
//  PRICE — from the backend, so the page shows exactly what the invoice charges
// ═══════════════════════════════════
let priceKop = Number(document.body.dataset.priceKop) || 99000;
let maxQty = 5;
const fmtUah = kop => (kop % 100 ? (kop / 100).toFixed(2).replace('.', ',') : String(kop / 100))
  .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
window.LabroPrice = { kop: priceKop, maxQty };

function renderPrice() {
  const v = fmtUah(priceKop);
  document.querySelectorAll('[data-price]').forEach(el => { if (el.textContent !== v + ' ₴') el.textContent = v + ' ₴'; el.classList.add('has-price'); });
  // bare numbers (the price odometer / badges): rewritten only if the price really differs from the page default
  document.querySelectorAll('[data-price-short]').forEach(el => { const sr = el.querySelector('.sr-only'); if ((sr ? sr.textContent : el.textContent).trim() !== v) { el.classList.remove('odo'); el.textContent = v; } });
  window.LabroPrice = { kop: priceKop, maxQty };
  document.dispatchEvent(new Event('labro:price'));
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
//  META PIXEL EVENTS — no-ops without cookie consent (assets/js/meta-pixel.js). Never any personal data.
// ═══════════════════════════════════
const CONTENT_ID = 'neuro-balance';
function px(event, qty, eventID) {
  if (!window.LabroPixel) return false;
  return window.LabroPixel.track(event, {
    value: priceKop * qty / 100, currency: 'UAH', num_items: qty,
    content_ids: [CONTENT_ID], content_type: 'product',
  }, eventID);
}
(function () {
  const card = document.querySelector('.order-card');
  if (!card || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(entries => {
    // keep watching until the event is really sent (consent may come after the card was first seen)
    if (entries.some(e => e.isIntersecting) && px('ViewContent', 1)) io.disconnect();
  }, { threshold: 0.5 });
  io.observe(card);
})();

// ═══════════════════════════════════
//  CHECKOUT MODAL
// ═══════════════════════════════════
const $ = id => document.getElementById(id);
const moModal = $('checkoutModal');
const moForm = $('moForm');
const moSubmit = $('moSubmit');
const panel = moModal.querySelector('[data-mo-panel]');
const backdrop = moModal.querySelector('[data-mo-backdrop]');
const payRadios = [...moModal.querySelectorAll('input[name="moPay"]')];
const fields = { last: $('moLastName'), first: $('moFirstName'), middle: $('moMiddleName'), phone: $('moPhone'), city: $('moCity'), comment: $('moComment') };
const consent = $('moConsent');
let moQty = 1;
let payType = 'online';
let openedAt = 0;
let lastFocus = null;
let busy = false;
let closing = false;
const isMobile = () => window.innerWidth < 900;

function renderTotal() {
  $('moQty').textContent = moQty;
  $('moTotal').textContent = fmtUah(priceKop * moQty);
  $('moMinus').disabled = moQty <= 1;
  $('moPlus').disabled = moQty >= maxQty;
  moSubmit.textContent = payType === 'online'
    ? `Сплатити ${fmtUah(priceKop * moQty)} ₴ через monobank` : 'Оформити — оплата при отриманні';
}
function setPay(type) {
  payType = type;
  payRadios.forEach(r => { r.checked = r.value === type; });
  renderTotal();
}
payRadios.forEach(r => r.addEventListener('change', () => { if (r.checked) setPay(r.value); }));

function focusables() {
  return [...moModal.querySelectorAll('a[href],button:not([disabled]),input:not([tabindex="-1"]),textarea,select,[tabindex="0"]')]
    .filter(el => el.offsetParent !== null);
}
const signal = () => { document.dispatchEvent(new Event('labro:jar')); window.dispatchEvent(new Event('scroll')); };

function moOpen(trigger, qty) {
  lastFocus = trigger || document.activeElement;
  moModal.classList.add('open');
  moModal.inert = false;
  document.body.style.overflow = 'hidden';
  root.classList.add('is-locked');
  signal();
  moReset();
  if (qty) { moQty = Math.min(Math.max(1, qty), maxQty); renderTotal(); }
  openedAt = Date.now();
  px('InitiateCheckout', moQty);
  if (!reducedMotion && panel.animate) {
    const mob = isMobile();
    panel.animate(mob ? [{ transform: 'translateY(100%)' }, { transform: 'none' }]
      : [{ transform: 'translateX(70px) scale(.97)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 700, easing: EASE });
    backdrop.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 450 });
    panel.querySelectorAll('[data-mf]').forEach((el, i) => el.animate([{ opacity: 0, translate: '0 18px' }, { opacity: 1, translate: '0 0' }],
      { duration: 650, delay: 140 + i * 45, easing: EASE, fill: 'backwards' }));
  }
  // desktop: straight into the first field; phones: focus the dialog (no keyboard popping over the form)
  setTimeout(() => (isMobile() ? panel : fields.last).focus({ preventScroll: true }), isMobile() ? 50 : 320);
}
function moClose() {
  if (!moModal.classList.contains('open') || closing) return;
  const done = () => {
    closing = false;
    moModal.classList.remove('open');
    moModal.inert = true;
    document.body.style.overflow = '';
    root.classList.remove('is-locked');
    signal();
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  };
  if (reducedMotion || !panel.animate) { done(); return; }
  closing = true;
  const mob = isMobile();
  panel.animate([{ transform: 'none', opacity: 1 }, { transform: mob ? 'translateY(100%)' : 'translateX(60px)', opacity: mob ? 1 : 0 }],
    { duration: 380, easing: 'cubic-bezier(.7,0,.84,0)', fill: 'forwards' });
  const a = backdrop.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, fill: 'forwards' });
  a.finished.then(() => { panel.getAnimations().forEach(x => x.cancel()); backdrop.getAnimations().forEach(x => x.cancel()); done(); }, done);
}
function moState(s) {
  moForm.hidden = s !== 'form';
  ['loading', 'error', 'cod-success'].forEach(k => $('mo-' + k).classList.toggle('on', s === k));
  if (s !== 'form') {
    const box = $('mo-' + s);
    const h = box.querySelector('.mo-state-h');
    if (h) h.focus();
    if (!reducedMotion && box.animate) {
      box.querySelectorAll('[data-ms]').forEach((el, i) => el.animate([{ opacity: 0, translate: '0 16px' }, { opacity: 1, translate: '0 0' }],
        { duration: 600, delay: i * 70, easing: EASE, fill: 'backwards' }));
      const ck = box.querySelector('[data-check]');
      if (ck) ck.animate([{ strokeDashoffset: 60 }, { strokeDashoffset: 0 }], { duration: 900, delay: 200, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'backwards' });
    }
  }
}
function moReset(keepPay) {
  moQty = 1;
  setPay(keepPay ? payType : 'online');
  Object.values(fields).forEach(clearError);
  consent.closest('.mo-consent').classList.remove('err');
  setBusy(false);
  moState('form');
}
function setBusy(b) {
  busy = b;
  moSubmit.disabled = b;
  payRadios.forEach(x => { x.disabled = b; });
  moForm.setAttribute('aria-busy', String(b));
}
function shake() {
  if (!reducedMotion && panel.animate) panel.animate([{ translate: '0 0' }, { translate: '-8px 0' }, { translate: '8px 0' }, { translate: '-4px 0' }, { translate: '0 0' }], { duration: 380 });
}

document.addEventListener('click', e => {
  const btn = e.target.closest && e.target.closest('[data-checkout]');
  if (!btn) return;
  e.preventDefault();
  const qty = btn.hasAttribute('data-checkout-qty') ? Number(document.body.dataset.qty) || 1 : 0;
  moOpen(btn, qty);
});
$('moClose').addEventListener('click', moClose);
$('moResetBtn').addEventListener('click', () => moReset(true));   // as before: back to the form, quantity reset
$('moCodClose').addEventListener('click', moClose);
backdrop.addEventListener('click', moClose);
document.addEventListener('keydown', e => {
  if (!moModal.classList.contains('open')) return;
  if (e.key === 'Escape') { moClose(); return; }
  if (e.key === 'Tab') {  // focus trap
    const f = focusables();
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) { e.preventDefault(); last.focus(); }
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
  return '+380 ' + g.join(' ');                        // never shorter than the "+380 " prefix
}
const PREFIX = 5;                                       // "+380 "
const digitsOf = s => s.replace(/\D/g, '');
function caretAfter(formatted, n) {                    // index in the formatted value after n local digits
  let i = PREFIX;
  while (n > 0 && i < formatted.length) { if (/\d/.test(formatted[i])) n--; i++; }
  return i;
}
// The edit is applied to the local digits wherever the caret was: typing with the caret inside "+380" (a tap on the
// start of the field, keys pressed before the caret moved on focus) used to mix the prefix digits into the number.
let phonePrev = '';
fields.phone.addEventListener('input', e => {
  const el = fields.phone, v = el.value, prev = phonePrev;
  let local, typedEnd;
  if (!prev || v.startsWith('+380')) {
    local = localDigits(v);
    typedEnd = localDigits(v.slice(0, el.selectionStart ?? v.length)).length;
    // Backspace / Delete that only removed a space: remove the digit next to it, as people expect
    if (prev && e.inputType && e.inputType.startsWith('delete') && local === localDigits(prev)) {
      const k = e.inputType === 'deleteContentBackward' ? typedEnd - 1 : typedEnd;
      if (k >= 0 && k < local.length) { local = local.slice(0, k) + local.slice(k + 1); typedEnd = k; }
    }
  } else {
    let a = 0; while (a < prev.length && a < v.length && prev[a] === v[a]) a++;
    let b = 0; while (b < prev.length - a && b < v.length - a && prev[prev.length - 1 - b] === v[v.length - 1 - b]) b++;
    const typed = digitsOf(v.slice(a, v.length - b));
    const head = digitsOf(prev.slice(PREFIX, Math.max(PREFIX, a)));
    const tail = digitsOf(prev.slice(Math.max(PREFIX, prev.length - b)));
    local = head ? (head + typed + tail).slice(0, 12) : localDigits(typed + tail);
    typedEnd = head ? head.length + typed.length : Math.max(0, local.length - tail.length);
  }
  el.value = phonePrev = formatPhone(local);
  if (document.activeElement === el) { const c = caretAfter(el.value, typedEnd); el.setSelectionRange(c, c); }
  if (el.getAttribute('aria-invalid') === 'true') validate('phone');
});
const caretOutOfPrefix = () => {
  const el = fields.phone;
  if (document.activeElement === el && el.selectionStart === el.selectionEnd && el.selectionStart < PREFIX) {
    const n = el.value.length; el.setSelectionRange(n, n);
  }
};
fields.phone.addEventListener('focus', () => {
  if (!fields.phone.value) fields.phone.value = phonePrev = '+380 ';
  caretOutOfPrefix();
  requestAnimationFrame(caretOutOfPrefix);              // iOS places the caret after the focus event
});
['click', 'keyup'].forEach(t => fields.phone.addEventListener(t, caretOutOfPrefix));
fields.phone.addEventListener('keydown', e => {
  // never delete the +380 prefix
  if ((e.key === 'Backspace' && fields.phone.selectionStart <= 5 && fields.phone.selectionEnd <= 5)) e.preventDefault();
});

// ── validation with messages under each field ──
// recipient name for Nova Poshta — the same rules as the server: letters (UA/RU/Latin), an apostrophe or a hyphen
// between letters, 2–50 characters; every apostrophe variant becomes ' and the first letter a capital
const NAME_RE = /^[A-Za-zА-Яа-яЁёІіЇїЄєҐґ]+(?:['-][A-Za-zА-Яа-яЁёІіЇїЄєҐґ]+)*$/;
const cleanName = v => { const s = v.replace(/[’ʼ`´‘ʹ]/g, "'").trim(); return s ? s[0].toUpperCase() + s.slice(1) : s; };
const nameOk = v => { const s = cleanName(v); return s.length >= 2 && s.length <= 50 && NAME_RE.test(s); };
const NAME_HINT = 'лише літери, апостроф або дефіс, від 2 символів';
const RULES = {
  last: v => nameOk(v) || `Вкажіть прізвище — ${NAME_HINT}`,
  first: v => nameOk(v) || `Вкажіть ім'я — ${NAME_HINT}`,
  middle: v => !v.trim() || nameOk(v) || `По батькові — ${NAME_HINT} (або залиште порожнім)`,
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
['last', 'first', 'middle'].forEach(k => fields[k].addEventListener('blur', () => {
  const s = cleanName(fields[k].value); if (s !== fields[k].value) fields[k].value = s;
}));
['last', 'first', 'middle', 'phone', 'city'].forEach(k => fields[k].addEventListener('blur', () => { if (fields[k].value) validate(k); }));
['last', 'first', 'middle', 'city'].forEach(k => fields[k].addEventListener('input', () => {
  if (fields[k].getAttribute('aria-invalid') === 'true') validate(k);
}));
consent.addEventListener('change', () => { if (consent.checked) consent.closest('.mo-consent').classList.remove('err'); });

function readForm() {
  const bad = ['last', 'first', 'middle', 'phone', 'city'].filter(k => !validate(k));
  const consentBox = consent.closest('.mo-consent');
  consentBox.classList.toggle('err', !consent.checked);
  if (bad.length) { fields[bad[0]].focus(); shake(); return null; }
  if (!consent.checked) { consent.focus(); shake(); return null; }
  return {
    last_name: cleanName(fields.last.value),
    first_name: cleanName(fields.first.value),
    middle_name: cleanName(fields.middle.value),
    phone: '+380' + localDigits(fields.phone.value),
    city: fields.city.value.trim(),
    comment: fields.comment.value.trim(),
    qty: moQty,
    consent: true,
    consent_version: CONSENT_VERSION,
    // cookie-banner choice; with it the server can send the Purchase to Meta (Conversions API)
    ads_consent: !!window.LabroPixel && window.LabroPixel.consent() === true,
    ...(window.LabroPixel ? window.LabroPixel.browserIds() : {}),
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
  return `Нейро-Баланс × ${f.qty} = ${fmtUah(priceKop * f.qty)} ₴\nОтримувач: ${[f.last_name, f.first_name, f.middle_name].filter(Boolean).join(' ')}\nТел: ${f.phone}\nДоставка: ${f.city}\nОплата: ${payLabel}` +
    (f.comment ? `\nКоментар: ${f.comment}` : '');
}
function showFailure(f, title, payLabel, code) {
  $('moErrorTitle').textContent = title;
  $('moErrorText').textContent = ERRORS[code] || 'Надішліть замовлення менеджеру — він оформить його вручну.';
  $('moOrderText').textContent = orderText(f, payLabel);
  moState('error');
}

async function submit(type) {
  if (busy) return;
  const f = readForm();
  if (!f) return;
  setBusy(true);
  if (type === 'online') px('AddPaymentInfo', f.qty);
  $('moLoadingText').textContent = type === 'online'
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
      body: JSON.stringify({ ...f, pay_type: type }),
    });
    status = resp.status;
    data = await resp.json().catch(() => ({}));
  } catch (_) { /* network error → fallback below */ }

  if (type === 'online' && status === 200 && data.pageUrl) {
    window.location.assign(data.pageUrl);
    return;
  }
  if (type === 'cod' && status === 200 && data.ok) {
    // a placed COD order is a Purchase; the server sends the same event (same event_id) via CAPI
    if (data.ref && data.purchase && window.LabroPixel) window.LabroPixel.purchase(data.purchase);
    $('moCodTrack').href = data.ref ? new URL(`thanks.html?ref=${encodeURIComponent(data.ref)}`, BASE).href : MANAGER_TG;
    setBusy(false);
    moState('cod-success');
    return;
  }
  setBusy(false);
  if (status === 400 && data.error === 'invalid_fields') { moState('form'); readForm(); return; }
  showFailure(f, type === 'online' ? 'Онлайн-оплата тимчасово недоступна' : 'Не вдалося надіслати замовлення',
    type === 'online' ? 'онлайн' : 'накладений платіж', data.error);
}
moForm.addEventListener('submit', e => { e.preventDefault(); submit(payType); });

$('moCopyBtn').addEventListener('click', () => {
  const btn = $('moCopyBtn');
  const done = () => { btn.textContent = '✓ Скопійовано'; setTimeout(() => { btn.textContent = 'Скопіювати замовлення'; }, 2000); };
  if (navigator.clipboard) navigator.clipboard.writeText($('moOrderText').textContent).then(done, () => {});
});

renderTotal();
