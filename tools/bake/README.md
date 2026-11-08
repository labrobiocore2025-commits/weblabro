# 3D jar label textures

The jar labels (current white pack, new black pack + its glow) are drawn once here and shipped as WebP in
`assets/img/jar/label-*-{1280,2560}.webp`; the live scene only decodes them (no canvas drawing, no Oswald font on the site).

Re-bake after changing `labelCurrent` / `labelNew` in `src/js/labro-3d.js`:

1. `npx esbuild src/js/labro-3d.js --bundle --format=esm --outfile=tools/bake/scene.js` (needs `three@0.160.0` installed)
2. serve the repo root (`python3 -m http.server 8791`) and open `tools/bake/bake.html` with Playwright:
   `node tools/bake/bake.mjs assets/img/jar` (edit the URL inside to `http://127.0.0.1:8791/tools/bake/bake.html`)
3. `sh tools/build-3d.sh`, `python3 tools/build.py`

`mark.png` is the logo drawn on the labels; Oswald (OFL) is the label typeface — both used only for baking.
