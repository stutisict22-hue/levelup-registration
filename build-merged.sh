#!/usr/bin/env bash
# Combined build for Vercel: visitor form (root) + exhibitor form (/exhibitor).
#
# Each app remains an independent Vite project — this script only orchestrates
# the two builds and assembles them into a single `dist/` for static hosting.
#
# Env vars:
#   VITE_FORM_ENDPOINT_VISITOR    Apps Script URL for visitor form (Form 1).
#                                 Falls back to VITE_FORM_ENDPOINT for backward
#                                 compatibility with the existing deployment.
#   VITE_FORM_ENDPOINT_EXHIBITOR  Apps Script URL for exhibitor form (Form 2).
#                                 Set this once the exhibitor Apps Script is
#                                 deployed; until then the exhibitor form will
#                                 build with an empty endpoint.

set -euo pipefail

VISITOR_ENDPOINT="${VITE_FORM_ENDPOINT_VISITOR:-${VITE_FORM_ENDPOINT:-}}"
EXHIBITOR_ENDPOINT="${VITE_FORM_ENDPOINT_EXHIBITOR:-}"

# Form 1's repo commits node_modules/ with binaries missing the exec bit (a
# Windows-checkout artifact). Vercel's npm install only patches new packages
# and doesn't fix permissions on pre-existing ones, so vite fails with
# "Permission denied" without this. Restore exec bits before the build.
if [ -d node_modules/.bin ]; then
  chmod +x node_modules/.bin/* 2>/dev/null || true
fi

echo "==> Building visitor form (repo root → dist/)"
VITE_FORM_ENDPOINT="$VISITOR_ENDPOINT" npm run build

echo "==> Building exhibitor form (exhibitor/ → dist/exhibitor/)"
cd exhibitor
npm install
VITE_FORM_ENDPOINT="$EXHIBITOR_ENDPOINT" \
  npx vite build \
    --base=/exhibitor/ \
    --outDir=../dist/exhibitor \
    --emptyOutDir
cd ..

echo "==> Combined build complete."
echo "    Visitor form:   dist/index.html"
echo "    Exhibitor form: dist/exhibitor/index.html"
