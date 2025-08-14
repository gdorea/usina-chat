#!/usr/bin/env bash
set -e

if [ -z "$WEBHOOK_URL" ]; then
  echo "ERROR: WEBHOOK_URL not set"
  exit 1
fi

mkdir -p dist
sed -e "s|__WEBHOOK_URL__|${WEBHOOK_URL}|g" index.html > dist/index.html
cp -R public/* dist/ 2>/dev/null || true

echo "Build complete: dist/index.html"
