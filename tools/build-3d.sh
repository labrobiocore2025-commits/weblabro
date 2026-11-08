#!/bin/sh
# Bundles the 3D jar (src/js/jar.js + src/js/labro-3d.js + three@0.160.0, tree-shaken) into assets/js/jar3d.js.
# Needs Node: run from the repo root after `npm i --no-save three@0.160.0 esbuild@0.24.0` (no package.json on purpose:
# the site itself has no build-time dependencies; only this optional step does).
set -e
npx --no-install esbuild src/js/jar.js --bundle --format=esm --minify --target=es2020 \
  --legal-comments=eof --outfile=assets/js/jar3d.js
