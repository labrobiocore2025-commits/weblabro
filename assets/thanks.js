'use strict';
// thanks.html?ref=<public_ref>: shows the real payment status from /api/order-status (no personal data).
const API = document.querySelector('meta[name="labro-api"]').content.replace(/\/$/, '');
const ref = new URLSearchParams(location.search).get('ref') || '';
const $ = id => document.getElementById(id);
const POLL_MS = 3000;
const MAX_POLLS = 20;

const VIEW = {
  paid:     ['Оплату підтверджено ✅', 'Замовлення передано в обробку. Менеджер зв\'яжеться з Вами щодо доставки.'],
  unpaid:   ['Очікуємо підтвердження оплати', 'Якщо Ви вже оплатили, статус оновиться протягом кількох хвилин. Цю сторінку можна закрити — ми повідомимо в Telegram.'],
  failed:   ['Оплата не пройшла', 'Кошти не списано. Спробуйте оформити замовлення ще раз або напишіть менеджеру.'],
  expired:  ['Час на оплату вийшов', 'Рахунок більше не дійсний. Оформіть замовлення ще раз або напишіть менеджеру.'],
  reversed: ['Кошти повернено', 'Платіж за цим замовленням повернено на Вашу картку.'],
  cod:      ['Замовлення прийнято ✅', 'Оплата — при отриманні у відділенні. Менеджер зв\'яжеться з Вами найближчим часом.'],
  unknown:  ['Замовлення не знайдено', 'Перевірте посилання або напишіть менеджеру — він допоможе.'],
  offline:  ['Не вдалося перевірити статус', 'Перевірте з\'єднання та оновіть сторінку або напишіть менеджеру.'],
};

function show(key, bot) {
  const [title, text] = VIEW[key];
  $('statusTitle').textContent = title;
  $('statusText').textContent = text;
  $('statusSpinner').hidden = key === 'unpaid' ? false : true;
  if (bot && /^[A-Za-z0-9_]{5,32}$/.test(bot)) $('trackBtn').href = `https://t.me/${bot}?start=o_${ref}`;
}

async function poll(n) {
  if (!/^[A-Za-z0-9_-]{16,32}$/.test(ref)) { show('unknown'); return; }
  let r;
  try {
    r = await fetch(`${API}/api/order-status?ref=${encodeURIComponent(ref)}`, { mode: 'cors', cache: 'no-store' });
  } catch (_) { show('offline'); return; }
  if (r.status === 404) { show('unknown'); return; }
  if (!r.ok) { show('offline'); return; }
  const d = await r.json();
  if (d.pay_type === 'cod') { show('cod', d.bot); return; }
  const key = VIEW[d.payment_status] ? d.payment_status : 'unpaid';
  show(key, d.bot);
  if (key === 'unpaid' && n < MAX_POLLS) setTimeout(() => poll(n + 1), POLL_MS);
  else if (key === 'unpaid') $('statusSpinner').hidden = true;
}
poll(0);
