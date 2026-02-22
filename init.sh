#!/usr/bin/env bash
# AEGIS v5.2 init.sh — validate existing environment (idempotent)
set -e

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

echo "[init] AEGIS v5.2 — existing codebase mode"

# 1. Check pnpm
if ! command -v pnpm &>/dev/null; then
  echo "[init] Installing pnpm..."
  npm install -g pnpm
fi

# 2. Install deps if node_modules missing
if [ ! -d "node_modules" ]; then
  echo "[init] Installing root deps..."
  pnpm install
fi
if [ ! -d "apps/web/node_modules" ]; then
  echo "[init] Installing web deps..."
  pnpm install --filter @mm/web
fi

# 3. .env: validate required keys (NEVER overwrite)
if [ -f ".env" ]; then
  echo "[init] .env exists — validating required keys..."
  MISSING_KEYS=""
  REQUIRED="VERCEL_TOKEN CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID VITE_MAGENTO_URL"
  for key in $REQUIRED; do
    if ! grep -q "^${key}=.\+" .env 2>/dev/null; then
      MISSING_KEYS="$MISSING_KEYS $key"
    fi
  done
  if [ -n "$MISSING_KEYS" ]; then
    echo "[init] WARNING: Missing .env keys:$MISSING_KEYS"
  else
    echo "[init] .env OK — all required keys present"
  fi
else
  [ -f ".env.example" ] && cp .env.example .env || touch .env
  echo "[init] Created .env from template — fill in required keys"
fi

# 4. Git check
git rev-parse --git-dir >/dev/null 2>&1 || git init

# 5. Memory index
if [ ! -f ".memory/index.json" ]; then
  echo "[init] Building memory index..."
  bash scripts/memory-index.sh 2>/dev/null || true
fi

echo "[init] Done ✓"
