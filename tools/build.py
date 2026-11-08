#!/usr/bin/env python3
"""Static site build: src/ -> the HTML pages and assets/site.css that GitHub Pages serves from the repo root.

    python3 tools/build.py                 # build for production (base path "/")
    python3 tools/build.py --base /weblabro-preview/ --out ../preview   # a preview copy under a sub-path
    python3 tools/build.py --check         # CI: fail if the committed output is not what src/ builds

Templates are plain HTML with three tags (no dependencies, standard library only):
    {{ name }}         value from the page's front matter or the site data (tools/site_data.py), HTML-escaped
    {{{ name }}}       the same, raw (already HTML)
    {{> partial }}     src/partials/<partial>.html, rendered with the same values ({{> partial if flag }}: only when truthy)
Each page starts with   <!--page { JSON front matter } -->   (see src/pages/*.html).
After rendering, asset references get their ?v=<hash> (tools/stamp-assets.py does the same for the check).
"""
import hashlib
import html
import json
import pathlib
import re
import shutil
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
sys.path.insert(0, str(ROOT / "tools"))
import site_data  # noqa: E402

TAG = re.compile(r"\{\{\{\s*([\w.]+)\s*\}\}\}|\{\{>\s*([\w/-]+)(?:\s+if\s+([\w.]+))?\s*\}\}|\{\{\s*([\w.]+)\s*\}\}")
FRONT = re.compile(r"\A<!--page\s+(\{.*?\})\s*-->\s*", re.S)
ASSET = re.compile(r'((?:/|\.\./)?assets/[\w./-]+\.(?:css|js))(?:\?v=[0-9a-f]+)?')
CSS_PARTS = ["base.css", "design.css", "states.css"]


def lookup(ctx, key):
    cur = ctx
    for part in key.split("."):
        if isinstance(cur, dict) and part in cur:
            cur = cur[part]
        else:
            raise KeyError(f"template value {key!r} is not defined")
    return cur


def render(text, ctx, depth=0):
    if depth > 8:
        raise RecursionError("partials nested too deep")

    def sub(m):
        raw, partial, cond, esc = m.groups()
        if partial:
            if cond and not lookup(ctx, cond):
                return ""
            return render((SRC / "partials" / f"{partial}.html").read_text(encoding="utf-8"), ctx, depth + 1)
        val = lookup(ctx, raw or esc)
        val = val(ctx) if callable(val) else val
        if isinstance(val, bool):
            val = "true" if val else "false"
        return str(val) if raw else html.escape(str(val), quote=True)

    return TAG.sub(sub, text)


def stamp(text, out_root):
    def rep(m):
        rel = m.group(1)
        path = out_root / re.sub(r"^(?:/|\.\./)", "", rel)
        return f"{rel}?v={hashlib.sha256(path.read_bytes()).hexdigest()[:10]}"
    return ASSET.sub(rep, text)


def build(base="/", out=ROOT):
    out = pathlib.Path(out)
    files = {}
    css = "\n".join((SRC / "css" / p).read_text(encoding="utf-8") for p in CSS_PARTS)
    files["assets/site.css"] = css
    layout = (SRC / "layout.html").read_text(encoding="utf-8")
    for page in sorted((SRC / "pages").glob("*.html")):
        text = page.read_text(encoding="utf-8")
        m = FRONT.match(text)
        if not m:
            raise ValueError(f"{page.name}: missing <!--page {{...}}--> front matter")
        meta = json.loads(m.group(1))
        body = text[m.end():]
        ctx = site_data.context(meta, base)
        ctx["content"] = render(body, ctx)
        files[meta["out"]] = render(layout, ctx)
    for name, content in site_data.extra_files(base).items():
        files[name] = content
    return files


def write(files, out):
    out = pathlib.Path(out)
    for name, content in files.items():
        if name.endswith(".css"):
            (out / name).parent.mkdir(parents=True, exist_ok=True)
            (out / name).write_text(content, encoding="utf-8")
    for name, content in files.items():   # pages after the CSS: the stamp hashes the files just written
        if not name.endswith(".css"):
            (out / name).parent.mkdir(parents=True, exist_ok=True)
            (out / name).write_text(stamp(content, out) if name.endswith(".html") else content, encoding="utf-8")


def main():
    args = sys.argv[1:]
    base = args[args.index("--base") + 1] if "--base" in args else "/"
    out = pathlib.Path(args[args.index("--out") + 1]).resolve() if "--out" in args else ROOT
    files = build(base, out)
    if "--check" in args:
        stale = []
        for name, content in files.items():
            if name.endswith(".html"):
                content = stamp(content, ROOT)
            p = ROOT / name
            if not p.exists() or p.read_text(encoding="utf-8") != content:
                stale.append(name)
        if stale:
            print("out of date (run python3 tools/build.py):", ", ".join(stale))
            return 1
        print("build output up to date:", len(files), "files")
        return 0
    if out != ROOT:   # a preview copy: static files the pages need
        for d in ("assets", ".well-known"):
            shutil.copytree(ROOT / d, out / d, dirs_exist_ok=True)
        for f in ROOT.glob("*"):
            if f.is_file() and f.suffix in (".png", ".ico", ".jpeg", ".webmanifest", ".txt", ".xml"):
                shutil.copy2(f, out / f.name)
    write(files, out)
    print("built", len(files), "files into", out)
    return 0


if __name__ == "__main__":
    sys.exit(main())
