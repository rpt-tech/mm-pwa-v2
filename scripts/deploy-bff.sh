#!/usr/bin/env bash
# scripts/deploy-bff.sh — Deploy apps/bff to Cloudflare Workers
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: .env not found at $ROOT/.env" >&2
  exit 1
fi

CF_TOKEN="$(grep -E '^CLOUDFLARE_API_TOKEN=' "$ENV_FILE" | cut -d= -f2- | tr -d '\"')"
if [[ -z "$CF_TOKEN" ]]; then
  echo "ERROR: CLOUDFLARE_API_TOKEN not set in .env" >&2
  exit 1
fi

echo "==> Installing dependencies..."
pnpm install --frozen-lockfile

echo "==> Deploying BFF to Cloudflare Workers..."
CLOUDFLARE_API_TOKEN="$CF_TOKEN" pnpm bff:deploy

echo "✓ BFF deployed"

TIMESTAMP="$(date '+%H:%M')"
echo "[$TIMESTAMP] deploy-bff.sh — ✓ BFF deployed to Cloudflare Workers" >> "$ROOT/LIVE_LOG.md"
