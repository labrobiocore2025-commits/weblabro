#!/usr/bin/env python3
"""Cache-busting: rewrite assets/<file>?v=<hash> references in *.html to the current content hash.

Static assets are cached for a year at the edge and in browsers; the ?v= query (part of the cache key)
changes whenever the file changes. Run after editing anything in assets/:  python3 tools/stamp-assets.py
CI runs it with --check and fails if a page references a stale version.
"""
import hashlib
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
REF = re.compile(r'((?:/)?assets/[\w./-]+\.(?:css|js))(?:\?v=[0-9a-f]+)?')


def digest(rel: str) -> str:
    return hashlib.sha256((ROOT / rel.lstrip("/")).read_bytes()).hexdigest()[:10]


def stamp(text: str) -> str:
    return REF.sub(lambda m: f"{m.group(1)}?v={digest(m.group(1))}", text)


def main() -> int:
    check = "--check" in sys.argv
    stale = []
    for page in sorted(ROOT.glob("*.html")):
        old = page.read_text(encoding="utf-8")
        new = stamp(old)
        if new != old:
            stale.append(page.name)
            if not check:
                page.write_text(new, encoding="utf-8")
    if check and stale:
        print("stale asset versions in:", ", ".join(stale), "- run python3 tools/stamp-assets.py")
        return 1
    print("stamped:" if not check else "asset versions up to date", ", ".join(stale) if stale else "")
    return 0


if __name__ == "__main__":
    sys.exit(main())
