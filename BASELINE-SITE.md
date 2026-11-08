# BASELINE-SITE — прод labrobiocore.com.ua до редизайна v3

Снято 2026-11-08 с прода (weblabro `main` @ 0e95040, GitHub Pages). Это эталон: после редизайна всё, что ниже, работает так же;
отличия — только дизайн и новые страницы (раздел «Отличия» в конце). Сырые данные (meta, формы, ссылки, полные тексты всех страниц) —
`baseline.json`, скриншоты 320/375/768/1440 (full page) — в рабочей папке сессии (`baseline/shots/`).

## URL

| URL | Код | Назначение | robots |
|---|---|---|---|
| `/` (`/index.html`) | 200 | лендинг + модалка заказа | index |
| `/privacy.html` | 200 | политика конфиденциальности (версия 1.2, якорь `#cookies`) | index |
| `/thanks.html?ref=…` | 200 | статус оплаты, ref убирается из URL | noindex |
| `/404.html` и любой неизвестный путь | 404 | страница 404 | noindex |
| `/robots.txt`, `/sitemap.xml` (`/`, `/privacy.html`) | 200 | SEO | — |
| `/.well-known/security.txt`, `/site.webmanifest`, `/favicon.ico`, `/favicon-{16,32,48,180,192,512}.png`, `/Favicon.jpeg` | 200 | служебные | — |

GitHub Pages: `cache-control: max-age=600`, без заголовков безопасности — CSP задаётся `<meta http-equiv>`.

## Head главной

title **Нейро-Баланс — LABRO BIOCORE** · `lang="uk"` · canonical `https://labrobiocore.com.ua/`

| name / property | content |
|---|---|
| `description` | Нейро-Баланс — натуральний комплекс Ashwagandha, L-Theanine, Rhodiola для підтримки нервової системи. Сприяє спокою, якісному сну та концентрації. Дієтична добавка, 60 веганських капсул. |
| `keywords` | нейро-баланс, ашваганда, ashwagandha, l-theanine, rhodiola, стрес, сон, концентрація, дієтична добавка |
| `og:title` | Нейро-Баланс — LABRO BIOCORE |
| `og:description` | Натуральний комплекс для підтримки нервової системи. Сприяє спокою, якісному сну та концентрації. Дієтична добавка. |
| `og:type` | website |
| `og:url` | https://labrobiocore.com.ua/ |
| `og:image` | https://labrobiocore.com.ua/favicon-512.png |
| `og:locale` | uk_UA |
| `theme-color` | #0A0907 |
| `Content-Security-Policy` | default-src 'none'; script-src 'self' https://connect.facebook.net; style-src 'self'; font-src 'self'; img-src 'self' data: https://www.facebook.com https://connect.facebook.net; connect-src https://api.labrobiocore.com.ua https://www.facebook.com https://connect.facebook.net; manifest-src 'self'; form-action 'none'; base-uri 'none'; object-src 'none'; upgrade-insecure-requests |
| `referrer` | strict-origin-when-cross-origin |
| `labro-api` | https://api.labrobiocore.com.ua |
| `og:site_name` | LABRO BIOCORE |
| `twitter:card` | summary |

schema.org (JSON-LD): **нет** ни на одной странице.

CSP на всех страницах, без `unsafe-inline`/`unsafe-eval`: `default-src 'none'; script-src 'self' https://connect.facebook.net; style-src 'self';
font-src 'self'; img-src 'self' data: https://www.facebook.com https://connect.facebook.net; connect-src https://api.labrobiocore.com.ua
https://www.facebook.com https://connect.facebook.net; manifest-src 'self'; form-action 'none'; base-uri 'none'; object-src 'none';
upgrade-insecure-requests` (на 404 без api в connect-src).

Скрипты: главная — `assets/js/meta-pixel.js` (async), `assets/app.js` (defer); privacy, 404 — meta-pixel (async);
thanks — meta-pixel (`data-pixel="purchase"`, defer) + `assets/thanks.js`. Все ассеты с `?v=<sha256[:10]>` (`tools/stamp-assets.py`, в CI `--check`).
CI (`validate.yml`): html-validate, запрет inline JS/CSS и `unsafe-*`, connect-src = labro-api, script-src только `'self'` + connect.facebook.net,
пиксель только через meta-pixel.js, актуальность `?v=`, CNAME, отсутствие секретов.

## Форма заказа (модалка `#checkoutModal`)

| id | тег/тип | name | maxlength | autocomplete | текст |
|---|---|---|---|---|---|
| `-` | button/button |  |  |  | Купити зараз |
| `faq-q1` | button/button |  |  |  | Як правильно приймати Нейро-Баланс? |
| `faq-q2` | button/button |  |  |  | Коли відчується перший ефект? |
| `faq-q3` | button/button |  |  |  | Чи є протипоказання? |
| `faq-q4` | button/button |  |  |  | Як зробити замовлення? |
| `faq-q5` | button/button |  |  |  | Яка доставка та оплата? |
| `faq-q6` | button/button |  |  |  | Чи можна поєднувати з іншими добавками? |
| `moClose` | button/button |  |  |  |  |
| `moMinus` | button/button |  |  |  | − |
| `moPlus` | button/button |  |  |  | + |
| `moName` | input/text | name | 128 | name |  |
| `moPhone` | input/tel | phone | 24 | tel |  |
| `moCity` | input/text | city | 256 | address-level2 |  |
| `moComment` | input/text | comment | 300 |  |  |
| `moWebsite` | input/text | website |  | off |  |
| `moConsent` | input/checkbox | consent |  |  |  |
| `moPayBtn` | button/submit |  |  |  | mono Сплатити онлайн через monobank |
| `moCodBtn` | button/button |  |  |  | 📬 Накладений платіж (оплата при отриманні) |
| `moCopyBtn` | button/button |  |  |  | Скопіювати замовлення |
| `moResetBtn` | button/button |  |  |  | ← Назад до форми |
| `moCodClose` | button/button |  |  |  | Закрити |
| `-` | button/button |  |  |  | Налаштування cookie |
| `-` | button/button |  |  |  | Відхилити |
| `-` | button/button |  |  |  | Прийняти |

Логика (`assets/app.js`):
- цена из `GET /api/price` (`price_kop`, `max_qty`), до ответа — `data-price-kop` (99000); количество 1…max_qty (5);
- маска телефона всегда `+380 XX XXX XX XX`: префикс +380 не удаляется, вставка 380…/80…/0… нормализуется, ровно 9 цифр;
- валидация: имя ≥ 3, телефон 9 цифр, город ≥ 5; тексты ошибок под полями, `aria-invalid`;
- согласие обязательно; `consent_version: "1.2"`; `ads_consent` = выбор в cookie-баннере; `fbp`/`fbc` только с согласием;
- honeypot `website`; `form_ms` = мс с открытия модалки (сервер отвергает < 3000);
- `POST /api/checkout` → онлайн `{pageUrl, ref}` → `location.assign(pageUrl)` (monobank); наложка `{ok, ref, purchase}` → экран
  «Замовлення прийнято!» + ссылка `thanks.html?ref=…`; ошибки → экран с текстом заказа, «Скопіювати замовлення», «Написати менеджеру»;
- фокус-ловушка, Esc закрывает, фокус возвращается на кнопку, открывшую модалку.

## Запросы к API (`https://api.labrobiocore.com.ua`)

| Запрос | Где | Когда |
|---|---|---|
| `GET /api/price` | главная | при загрузке |
| `POST /api/checkout` | модалка | отправка заказа |
| `GET /api/order-status?ref=…` | thanks | каждые 3 с, до 20 раз |

## Meta Pixel 1426477409684561

- До согласия — 0 запросов к Meta, fbevents.js не грузится. Выбор в `localStorage.labro_cookie_consent` (v 1.1); «Відхилити» = никогда.
  Кнопка «Налаштування cookie» в футере. Ссылка «Детальніше» → `privacy.html#cookies`.
- `fbq('set','autoConfig',false,…)` до `init`, `disablePushState`.
- **PageView** — все страницы, кроме thanks. **ViewContent** — карточка заказа видна ≥ 50 % (990 UAH). **InitiateCheckout** — открытие модалки
  (value, UAH, num_items). **AddPaymentInfo** — отправка онлайн-заказа. **Purchase** — наложка: сразу после ответа checkout (`payment_type=cod`,
  `event_id` сервера, дедуп с CAPI); онлайн: на thanks при `paid` (`payment_type=online`). Один раз на заказ (`localStorage.labro_px_purchases`).
  Lead нет. ПДн нет.
- thanks: ref читается и удаляется из URL (`history.replaceState`) до загрузки пикселя; без баннера и PageView.

## Тексты

Источник правды — текущий прод (`index.html`, `privacy.html`, `thanks.html`, `404.html` @ 0e95040; полные тексты — `baseline.json`).
Спорные места, ждущие ответа заказчика (на сайте — как сейчас): «Відновлення нервової системи», «Без синтетики. Без залежності»,
дозировка 1–2 vs 2, «на постійній основі», «Скандинавський адаптоген арктичних гір», «безпечне виробництво», FAQ «добре поєднується»,
«Один результат», «100% без синтетики».

## Ссылки главной

- `#benefits`
- `#faq`
- `#ingredients`
- `#main`
- `#order`
- `https://infiniteunion.com.ua`
- `https://instagram.com/labro.biocore`
- `https://t.me/LaBroBioCore`
- `https://t.me/LaBroudi`
- `https://wa.me/380932808111`
- `privacy.html`
- `privacy.html#cookies`
- `tel:+380932808111`
- `thanks.html`
- `viber://chat?number=380932808111`

## Lighthouse 12.8.2 (медиана; главная — 3 прогона, privacy/thanks — 1)

```
prod-home    mobile  perf 99 a11y 100 bp 100 seo 92 | LCP 1.82s CLS 0.005 TBT 18ms FCP 1.44s
prod-home    desktop perf 100 a11y 100 bp 100 seo 92 | LCP 0.46s CLS 0.008 TBT 0ms FCP 0.40s
prod-privacy mobile  perf 97 a11y 100 bp 100 seo 92 | LCP 1.82s CLS 0.000 TBT 0ms FCP 1.60s
prod-privacy desktop perf 100 a11y 100 bp 100 seo 92 | LCP 0.24s CLS 0.002 TBT 0ms FCP 0.24s
prod-thanks  mobile  perf 100 a11y 95 bp 100 seo 54 | LCP 0.97s CLS 0.048 TBT 0ms FCP 0.85s
prod-thanks  desktop perf 100 a11y 95 bp 100 seo 54 | LCP 0.25s CLS 0.013 TBT 0ms FCP 0.21s
```

## Замечания по эталону

- Главная на 320 и 375 px даёт горизонтальный скролл (баг прода).
- Консоль: 0 ошибок на всех страницах (на несуществующем URL — только ожидаемый 404 самого документа).

## Отличия после редизайна v3 (всё, что было, работает так же; ниже — только новое)

| Что | Было | Стало |
|---|---|---|
| Дизайн | старый лендинг | Claude Design v3 (тёмная тема, Geologica / Cormorant / JetBrains Mono), 3D-банка |
| URL | `/`, `/privacy.html`, `/thanks.html`, `/404.html` | те же + `/product.html`, `/about.html`, `/blog.html`, `/blog/*.html` (6), `/delivery.html`, `/contacts.html`, `/faq.html`, `/offer.html` |
| Индексация | 2 URL в sitemap | 9 URL; 5 статей-заглушек и оферта — `noindex`, не в sitemap |
| Модалка заказа | две кнопки (онлайн / наложка) | выбор способа радиокнопками + одна кнопка; поля, маска, honeypot, form_ms, consent 1.2, запросы — без изменений |
| Пиксель | события на главной | те же события и правила; модалка заказа есть на всех страницах с кнопкой «Замовити» (InitiateCheckout там же) |
| CSP | `connect-src` без `'self'` | + `'self'` (Lighthouse не мог прочитать robots.txt → SEO 92); остальное без изменений, без `unsafe-*` |
| schema.org | нет | Organization, WebSite, Product (990 UAH), BreadcrumbList, Article, FAQPage |
| Горизонтальный скролл 320/375 | был | нет |
| Ассеты | `assets/style.css`, `tools/stamp-assets.py` | `assets/site.css` из `src/css/*`, страницы из `src/` — `tools/build.py` (CI: `--check`) |
| 3D | — | `assets/js/jar3d.js` (three@0.160.0, tree-shaken), грузится после первого взаимодействия и только если банка видна; статичные постеры — до этого, при reduced motion и на слабых устройствах |
| Интро-шторка | — | только на широких экранах с мышью (на телефонах — нет, ради LCP) |

Известная проблема (была и до редизайна): после согласия на cookie fbevents пытается слать события в Meta Conversions API Gateway
(`mpc-prod-28-….us-central1.run.app`, `kw-….ecs.us-west-1.on.aws`), CSP это блокирует → ошибки в консоли. См. INFRA.md (BOTLABRO) → Known issues.
