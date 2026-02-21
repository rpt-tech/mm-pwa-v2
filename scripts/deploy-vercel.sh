#!/usr/bin/env bash
# scripts/deploy-vercel.sh — Deploy apps/web to Vercel production
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: .env not found at $ROOT/.env" >&2
  exit 1
fi

VERCEL_TOKEN="$(grep -E '^VERCEL_TOKEN=' "$ENV_FILE" | cut -d= -f2- | tr -d '\"')"
if [[ -z "$VERCEL_TOKEN" ]]; then
  echo "ERROR: VERCEL_TOKEN not set in .env" >&2
  exit 1
fi

SCOPE="admin-rpts-projects"
WEB_DIR="$ROOT/apps/web"

echo "==> Installing dependencies..."
pnpm install --frozen-lockfile

echo "==> Building @mm/web..."
pnpm --filter @mm/web build

echo "==> Linking Vercel project (if needed)..."
if [[ ! -f "$WEB_DIR/.vercel/project.json" ]]; then
  npx vercel link \
    --token "$VERCEL_TOKEN" \
    --scope "$SCOPE" \
    --yes \
    --cwd "$WEB_DIR" || true
fi

echo "==> Deploying to Vercel production..."
DEPLOY_URL=$(npx vercel deploy --prod \
  --token "$VERCEL_TOKEN" \
  --scope "$SCOPE" \
  --yes \
  --cwd "$WEB_DIR")

echo ""
echo "✓ Deployed: $DEPLOY_URL"

# Append to LIVE_LOG.md
TIMESTAMP="$(date '+%H:%M')"
echo "[$TIMESTAMP] deploy-vercel.sh — ✓ deployed to production — $DEPLOY_URL" >> "$ROOT/LIVE_LOG.md"
