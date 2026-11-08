# 3D jar: label textures and posters

Both are baked from the live scene (`src/js/labro-3d.js`), so the static poster and the first frame of the live jar are
the same picture — the page cross-fades from one to the other without a jump.

- **Labels** — `assets/img/jar/label-{current,new,new-emissive}-{4096,2560}.webp`: drawn once at 4096 px (`drawLabels(mark, 1.6)`)
  with the label fonts (Oswald, Geologica, Cormorant), 2560 is a high-quality downscale. The site never draws them and never
  loads Oswald. Retina screens get 4096 (≥ 2 texels per device pixel on the front of the jar), others 2560.
- **Posters** — `assets/img/jar/<key>-{560,800,1100,1400,1600}.{avif,webp}`: for every `[data-jar]` anchor (`ANCHORS` in
  `bake.mjs` = the `jar(...)` calls in `tools/site_data.py`) and the black pack variants, the scene's still pose (t = 0) is
  rendered at 3200 px with MSAA, halved to 1600 and resized with Lanczos. 1600 covers 800 CSS px × 2 (desktop) and
  520 CSS px × 3 (iPhone).

Re-bake after changing the label artwork, the scene (geometry, materials, light, composition) or an anchor's `ry`/`s`/`rz`:

1. `npm i --no-save three@0.160.0 esbuild@0.24.0 playwright` (anywhere; link its `node_modules` to `tools/bake/node_modules`)
2. `npx esbuild src/js/labro-3d.js --bundle --format=esm --outfile=tools/bake/scene.js`
3. serve the repo root: `python3 -m http.server 8791 --bind 127.0.0.1`
4. `node tools/bake/bake.mjs labels`, then `node tools/bake/bake.mjs posters` (Google Chrome with a real GPU — full
   anisotropic filtering — and ImageMagick with AVIF)
5. `sh tools/build-3d.sh`, `python3 tools/build.py`

`mark.png` is the logo drawn on the labels; Oswald (OFL) is the label typeface — both used only for baking.
`scene.js` and `node_modules` here are git-ignored.
