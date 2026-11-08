"""Site-wide data and per-page head for tools/build.py. Texts follow the production site (the source of truth for copy);
FAQ answers are verbatim from the previous release."""
import html
import json

SITE = "https://labrobiocore.com.ua"
API = "https://api.labrobiocore.com.ua"
PRICE = "990"
PHONE = "+380\u00a093\u00a0280\u00a081\u00a011"   # no-break spaces: never wraps inside the number
PHONE_TEL = "+380932808111"
EMAIL = "labrobiocore2025@gmail.com"
MANAGER = "https://t.me/LaBroudi"
CHANNEL = "https://t.me/LaBroBioCore"
INSTAGRAM = "https://instagram.com/labro.biocore"
WHATSAPP = "https://wa.me/380932808111"
VIBER = "viber://chat?number=380932808111"
DISCLAIMER = "Дієтична добавка. Не є лікарським засобом."

CSP = ("default-src 'none'; script-src 'self' https://connect.facebook.net; style-src 'self'; font-src 'self'; "
       "img-src 'self' data: https://www.facebook.com https://connect.facebook.net; "
       f"connect-src {API} 'self' https://www.facebook.com https://connect.facebook.net; manifest-src 'self'; "
       "form-action 'none'; base-uri 'none'; object-src 'none'; upgrade-insecure-requests")

# (question, answer) — production FAQ, word for word (incl. items still waiting for the customer's decision)
FAQ = [
    ("Як правильно приймати Нейро-Баланс?",
     "По 2 капсули на день — вранці або вдень під час їди. Запивати водою. Рекомендований курс — 30 днів. "
     "Після можна повторювати з тижневою перервою."),
    ("Коли відчується перший ефект?",
     "Відчуття індивідуальні. Компоненти Нейро-Баланс розраховані на регулярний прийом, тому рекомендуємо пройти "
     "повний курс — 30 днів."),
    ("Чи є протипоказання?",
     "Не рекомендується при вагітності та лактації, індивідуальній непереносимості компонентів. При наявності "
     "хронічних захворювань — проконсультуйтеся з лікарем до початку прийому. Нейро-Баланс — дієтична добавка, "
     "не є лікарським засобом і не замінює лікування."),
    ("Як зробити замовлення?",
     "Натисніть «Купити зараз» на цьому сайті, заповніть форму та оберіть оплату: онлайн через monobank або "
     "накладеним платежем. Також можна написати в Telegram (@LaBroudi), WhatsApp (+380 93 280 81 11) або "
     "Instagram (@labro.biocore) — менеджер відповість протягом кількох хвилин."),
    ("Яка доставка та оплата?",
     "Доставка по всій Україні — Нова Пошта або Укрпошта. Оплата онлайн банківською карткою через monobank або "
     "накладеним платежем при отриманні. Відправка протягом 1–2 робочих днів."),
    ("Чи можна поєднувати з іншими добавками?",
     "Нейро-Баланс добре поєднується з більшістю добавок — вітамінами, магнієм, омега-3. Якщо ви приймаєте "
     "медикаменти, проконсультуйтеся з лікарем щодо сумісності."),
]

# blog: (slug, title, category, minutes, image, alt, credit html)
POSTS = [
    ("ashwagandha", "Ашваганда: що відомо про адаптоген з аюрведи", "Інгредієнти", "6 хв", "ashwagandha",
     "Сушені корені ашваганди",
     'Фото: Piyush Kothari / <a href="https://commons.wikimedia.org/wiki/File:Ashwagandha_Roots.jpg" '
     'rel="noopener" target="_blank">Wikimedia Commons</a>, ліцензія '
     '<a href="https://creativecommons.org/licenses/by-sa/4.0/deed.uk" rel="noopener" target="_blank">CC BY-SA 4.0</a>'),
    ("l-theanine", "L-теанін і зелений чай: звідки береться спокійна зосередженість", "Інгредієнти", "5 хв",
     "green-tea", "Чашка зеленого чаю з листям",
     'Фото: Denise Cusack / <a href="https://www.pexels.com/photo/18946746/" rel="noopener" target="_blank">Pexels</a>'),
    ("rhodiola-rosea", "Родіола рожева: рослина арктичних гір у сучасних добавках", "Інгредієнти", "5 хв", "rhodiola",
     "Суцвіття родіоли рожевої",
     'Фото: WildBoar / <a href="https://commons.wikimedia.org/wiki/File:Rhodiola_rosea_flowers.JPG" rel="noopener" '
     'target="_blank">Wikimedia Commons</a> (public domain)'),
    ("evening-ritual", "Вечірній ритуал: звички, які допомагають підготуватися до сну", "Сон", "7 хв", "sleep",
     "Жінка спокійно спить у затишній спальні",
     'Фото: Ivan Oboleninov / <a href="https://www.pexels.com/photo/935777/" rel="noopener" target="_blank">Pexels</a>'),
    ("overload-signals", "Як помітити перевантаження: сигнали, на які варто зважати", "Стрес", "6 хв", "overload",
     "Втомлена жінка за ноутбуком",
     'Фото: Anna Shvets / <a href="https://www.pexels.com/photo/4226215/" rel="noopener" target="_blank">Pexels</a>'),
    ("focus-techniques", "Фокус протягом робочого дня: прості техніки", "Фокус", "4 хв", "focus",
     "Зосереджена робота з нотатками",
     'Фото: Ivan S / <a href="https://www.pexels.com/photo/4240492/" rel="noopener" target="_blank">Pexels</a>'),
]
CATS = ["Усі", "Інгредієнти", "Сон", "Стрес", "Фокус"]

NAV = [("product", "Нейро-Баланс", "product.html"), ("about", "Про нас", "about.html"), ("blog", "Блог", "blog.html"),
       ("delivery", "Доставка й оплата", "delivery.html"), ("contacts", "Контакти", "contacts.html")]
MENU = [("home", "Головна", "")] + NAV + [("faq", "FAQ", "faq.html")]

ARROW = ('<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" '
         'stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path></svg>')
PLUS = ('<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M7 1v12M1 7h12" '
        'stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg>')
E = html.escape
CUR = ' aria-current="page"'


def faq_items(prefix="faq", h="h3"):
    out = []
    for i, (q, a) in enumerate(FAQ, 1):
        out.append(
            # the first answer is open in the HTML (as in the design) — opening it from JS after paint shifted the list (CLS)
            f'<div class="s08-7{" is-open" if i == 1 else ""}" data-faq>'
            f'<{h} class="faq-h"><button type="button" class="s08-8" aria-expanded="{"true" if i == 1 else "false"}" id="{prefix}-q{i}" aria-controls="{prefix}-a{i}">'
            f'<span class="s08-9">{i:02d}</span><span class="s08-10">{E(q)}</span><span class="s08-11">{PLUS}</span></button></{h}>'
            f'<section class="s08-12" id="{prefix}-a{i}" aria-labelledby="{prefix}-q{i}">'
            f'<div class="s08-13"><p class="s08-14">{E(a)}</p></div></section></div>')
    return "\n".join(out)


def picture(base, name, alt, cls, widths, sizes, lazy=True, w=900, h=563):
    srcset = lambda ext: ", ".join(f"{base}assets/img/blog/{name}-{x}.{ext} {x.split('-')[-1]}w" for x in widths)  # noqa: E731
    biggest = widths[-1]
    load = ' loading="lazy"' if lazy else ' fetchpriority="high"'
    return (f'<picture><source type="image/avif" srcset="{srcset("avif")}" sizes="{sizes}">'
            f'<source type="image/webp" srcset="{srcset("webp")}" sizes="{sizes}">'
            f'<img src="{base}assets/img/blog/{name}-{biggest}.jpg" srcset="{srcset("jpg")}" sizes="{sizes}" alt="{E(alt)}" '
            f'width="{w}" height="{h}" decoding="async"{load} class="{cls}"></picture>')


def post_card(base, i, post, cls="s11-4", h="h3"):
    slug, title, cat, mins, img, alt, _ = post
    return (f'<a href="{base}blog/{slug}.html" data-reveal data-cat="{E(cat)}" class="{cls}">'
            f'<div class="s11-5">{picture(base, img, alt, "s11-6", ["480", "900"], "(min-width:900px) 440px, 82vw")}'
            f'<div class="s11-7"></div><span class="s11-8">{E(cat)}</span><span class="s11-9">{i:02d}</span></div>'
            f'<div class="s11-10"><div class="s11-11"><span class="g-10">{E(cat)}</span><span>·</span><span>{E(mins)}</span></div>'
            f'<{h} class="s11-12">{E(title)}</{h}></div></a>')


POSTER_SIZES = "(min-width:900px) 800px, 440px"
# displayed poster height on phones = the anchor's height (svh-based, capped in design.css): exact sizes → smaller files
MOBILE_SIZE = {"hero-m": "min(44svh, 420px)", "pack-m": "min(56svh, 520px)", "product-m": "min(52svh, 480px)",
               "thanks-m": "max(36svh, 260px)", "nf": "max(36svh, 240px)"}


def poster_sizes(key):
    base_key = key[:-4] if key.endswith("-new") else key
    if base_key.endswith("-d") or base_key == "order":
        return "(min-width:900px) min(84svh, 800px), 92vw"
    return f"(min-width:900px) 800px, {MOBILE_SIZE.get(base_key, '440px')}"


def poster_srcset(base, key, ext):
    return ", ".join(f"{base}assets/img/jar/{key}-{w}.{ext} {w}w" for w in (560, 800, 1100))


def lcp_preloads(meta, base):
    """The page's LCP poster (above the fold) is requested from <head>, together with the CSS — not after layout."""
    out = []
    for key in meta.get("lcp", []):
        media = NOT_DESKTOP if key.endswith("-m") else (NOT_MOBILE if key.endswith("-d") else "")
        out.append(f'<link rel="preload" as="image" type="image/avif" fetchpriority="high" '
                   f'imagesrcset="{poster_srcset(base, key, "avif")}" imagesizes="{poster_sizes(key)}"'
                   + (f' media="{media}"' if media else "") + ">")
    return "\n".join(out)


GIF1 = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
NOT_MOBILE, NOT_DESKTOP = "(min-width: 900px)", "(max-width: 899.98px)"


def jar(base, key, cls="s01-4", ry=0.0, s=0.62, rz=None, spill=False, eager=False, only=None):
    """[data-jar] anchor with its static poster (same scene, pre-rendered: assets/img/jar/<key>-{560,1100}.*)."""
    attrs = f' data-ry="{ry}" data-s="{s}"' + (f' data-rz="{rz}"' if rz is not None else "") + (" data-spill" if spill else "")
    pack = key.startswith(("pack", "product"))
    # the anchor is hidden at the other breakpoint: an empty 1×1 source there, so its poster is never downloaded
    skip = f'<source media="{NOT_MOBILE if only == "m" else NOT_DESKTOP}" srcset="{GIF1}">' if only else ""

    def pic(k, extra_cls="", lazy=False):
        src = lambda ext: poster_srcset(base, k, ext)  # noqa: E731
        load = ' fetchpriority="high"' if eager and not lazy else ' loading="lazy"'
        return (f'<picture class="jar-poster{extra_cls}">{skip}<source type="image/avif" srcset="{src("avif")}" sizes="{poster_sizes(k)}">'
                f'<img src="{base}assets/img/jar/{k}-1100.webp" srcset="{src("webp")}" sizes="{poster_sizes(k)}" '
                f'alt="" width="1100" height="1100" decoding="async"{load}></picture>')
    # the black pack poster is hidden until the switch: lazy, so it is not downloaded with the page
    posters = pic(key, " pack-current") + pic(key + "-new", " pack-new", lazy=True) if pack else pic(key)
    return f'<div data-jar{attrs} class="{cls}">{posters}</div>'


def ld(obj):
    return '<script type="application/ld+json">' + json.dumps(obj, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/") + "</script>"


ORG = {"@type": "Organization", "@id": f"{SITE}/#org", "name": "LABRO BIOCORE", "url": f"{SITE}/",
       "logo": f"{SITE}/favicon-512.png", "telephone": PHONE_TEL, "email": EMAIL,
       "sameAs": [INSTAGRAM, CHANNEL]}
PRODUCT = {"@type": "Product", "@id": f"{SITE}/product.html#product", "name": "Нейро-Баланс",
           "description": "Натуральний комплекс Ashwagandha, L-Theanine та Rhodiola Rosea. 60 веганських капсул без ГМО, "
                          "глютену та лактози. " + DISCLAIMER,
           "image": [f"{SITE}/assets/img/jar/product-d-1100.webp"], "brand": {"@type": "Brand", "name": "LABRO BIOCORE"},
           "sku": "neuro-balance",
           "offers": {"@type": "Offer", "url": f"{SITE}/product.html", "price": PRICE, "priceCurrency": "UAH",
                      "availability": "https://schema.org/InStock", "itemCondition": "https://schema.org/NewCondition",
                      "seller": {"@id": f"{SITE}/#org"}}}


def head_ld(meta):
    graph = [ORG, {"@type": "WebSite", "@id": f"{SITE}/#site", "url": f"{SITE}/", "name": "LABRO BIOCORE", "inLanguage": "uk",
                   "publisher": {"@id": f"{SITE}/#org"}}]
    kind = meta.get("ld")
    if kind in ("home", "product"):
        graph.append(PRODUCT)
    crumbs = meta.get("crumbs")
    if crumbs:
        graph.append({"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": i, "name": n, "item": f"{SITE}/{u}"} for i, (n, u) in enumerate(crumbs, 1)]})
    if kind == "article":
        graph.append({"@type": "Article", "headline": meta["h1"], "image": [f"{SITE}/assets/img/blog/{meta['img']}-wide-1800.jpg"],
                      "inLanguage": "uk", "publisher": {"@id": f"{SITE}/#org"}, "mainEntityOfPage": f"{SITE}/{meta['out']}"})
    if kind == "faq":
        graph.append({"@type": "FAQPage", "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in FAQ]})
    return ld({"@context": "https://schema.org", "@graph": graph})


def head_meta(meta, url, base):  # noqa: C901
    title, desc = meta["title"], meta["description"]
    index = meta.get("robots", "index") == "index"
    out = [f"<title>{E(title)}</title>", f'<meta name="description" content="{E(desc)}">']
    if meta.get("lcp"):
        out.append(lcp_preloads(meta, base))
    # pages that call the API (price / checkout / order status): open the connection while the page parses
    if meta.get("modal", True) or meta.get("pixel") == "purchase":
        out.append(f'<link rel="preconnect" href="{API}" crossorigin>')
    if meta.get("keywords"):
        out.append(f'<meta name="keywords" content="{E(meta["keywords"])}">')
    if index:
        out.append(f'<link rel="canonical" href="{url}">')
    else:
        out.append('<meta name="robots" content="noindex">')
    out += [
        f'<meta property="og:title" content="{E(meta.get("og_title", title))}">',
        f'<meta property="og:description" content="{E(meta.get("og_description", desc))}">',
        f'<meta property="og:type" content="{meta.get("og_type", "website")}">',
        f'<meta property="og:url" content="{url}">',
        f'<meta property="og:image" content="{SITE}/favicon-512.png">',
        '<meta property="og:locale" content="uk_UA">',
        '<meta property="og:site_name" content="LABRO BIOCORE">',
        '<meta name="twitter:card" content="summary">',
    ]
    return "\n".join(out)


def scripts(meta, base):
    pixel = meta.get("pixel", "full")
    out = [f'<script src="{base}assets/js/meta-pixel.js" data-pixel="purchase" defer></script>' if pixel == "purchase"
           else f'<script src="{base}assets/js/meta-pixel.js" async></script>']
    out.append(f'<script src="{base}assets/js/site.js" defer></script>')
    if meta.get("modal", True):
        out.append(f'<script src="{base}assets/app.js" defer></script>')
    for extra in meta.get("scripts", []):
        out.append(f'<script src="{base}{extra}" defer></script>')
    return "\n".join(out)


def context(meta, base):
    current = meta.get("nav", "")
    ctx = dict(meta)
    path = meta["out"]
    url = f"{SITE}/" + ("" if path == "index.html" else path)
    rel = lambda p: f"{base}{p}"  # noqa: E731
    ctx.update({
        "base": base, "api": API, "csp": CSP, "price": PRICE, "phone": PHONE, "phone_tel": PHONE_TEL, "email": EMAIL,
        "manager": MANAGER, "channel": CHANNEL, "instagram": INSTAGRAM, "whatsapp": WHATSAPP, "viber": VIBER,
        "disclaimer": DISCLAIMER, "arrow": ARROW, "url": url,
        "canonical": url if meta.get("robots", "index") == "index" else "",
        "has_modal": meta.get("modal", True), "has_bar": meta.get("bar", False),
        "pixel_mode": meta.get("pixel", "full"),
        "html_class": "js-pending" + (" is-solid" if current != "home" else ""),
        "faq_items": faq_items(), "faq_items_page": faq_items("faqp", "h2"),
        "home_posts": "\n".join(post_card(base, i, p) for i, p in enumerate(POSTS[:3], 1)),
        "all_posts": "\n".join(post_card(base, i, p, "bl-5", "h2") for i, p in enumerate(POSTS, 1)),
        "cat_tabs": "\n".join(f'<button type="button" role="tab" class="pd-4" aria-selected="{"true" if i == 0 else "false"}" '
                              f'data-cat="{E(c)}">{E(c)}</button>' for i, c in enumerate(CATS)),
        "nav_links": "\n".join(f'<a href="{rel(u)}" class="g-12"{CUR if k == current or (k == "blog" and current == "article") else ""}>{E(l)}</a>'
                               for k, l, u in NAV),
        "menu_links": "\n".join(f'<a href="{rel(u)}" data-mi class="ft-32"{CUR if k == current else ""}>'
                                f'<span>{E(l)}</span><span class="ft-33">{i:02d}</span></a>' for i, (k, l, u) in enumerate(MENU, 1)),
        "ld_json": head_ld(meta),
        "head_meta": head_meta(meta, url, base),
        "scripts_html": scripts(meta, base),
        "robots_meta": "" if meta.get("robots", "index") == "index" else '<meta name="robots" content="noindex">',
    })
    ctx["jar"] = {
        "hero_m": jar(base, "hero-m", ry=-0.1, s=0.7, eager=True, only="m"), "hero_d": jar(base, "hero-d", ry=-0.15, s=0.58, eager=True, only="d"),
        "pack_m": jar(base, "pack-m", ry=0.2, s=0.7, only="m"), "pack_d": jar(base, "pack-d", ry=0.2, s=0.66, only="d"),
        "order": jar(base, "order", ry=-0.3, s=0.62),
        "product_m": jar(base, "product-m", ry=0, s=0.72, eager=True, only="m"), "product_d": jar(base, "product-d", ry=0, s=0.6, eager=True, only="d"),
        "thanks_m": jar(base, "thanks-m", ry=0, s=0.72, eager=True, only="m"), "thanks_d": jar(base, "thanks-d", ry=-0.2, s=0.6, eager=True, only="d"),
        "nf": jar(base, "nf", ry=0, s=0.56, rz=1.42, spill=True, eager=True),
    }
    if meta.get("post") is not None:
        p = POSTS[meta["post"]]
        ctx["post"] = {"title": p[1], "cat": p[2], "mins": p[3], "credit": p[6],
                       "figure": picture(base, p[4] + "-wide", p[5], "ar-10", ["800", "1200", "1800"], "(min-width:1200px) 1100px, 94vw",
                                         lazy=False, w=1800, h=900),
                       "related": "\n".join(
                           f'<a href="{base}blog/{q[0]}.html" class="ar-36"><span class="ar-37">{E(q[2])} · {E(q[3])}</span>'
                           f'<span class="ar-38">{E(q[1])}</span></a>' for q in [q for j, q in enumerate(POSTS) if j != meta["post"]][:3])}
    return ctx


def extra_files(base):
    """sitemap.xml: indexable pages only (placeholder-only articles and the offer draft are noindex)."""
    pages = ["", "product.html", "about.html", "blog.html", "blog/ashwagandha.html", "delivery.html", "contacts.html",
             "faq.html", "privacy.html"]
    urls = "\n".join(f"  <url><loc>{SITE}/{p}</loc></url>" for p in pages)
    return {"sitemap.xml": f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{urls}\n</urlset>\n'}
