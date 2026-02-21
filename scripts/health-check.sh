#!/usr/bin/env bash
set -euo pipefail

PROD_URL="${PROD_URL:-https://mm-pwa-v2.vercel.app}"
BFF_URL="${BFF_URL:-https://mm-bff.hi-huythanh.workers.dev}"
MAX_RETRIES=3
RETRY_DELAY=10
FAILED=0

check_url() {
  local name="$1"
  local url="$2"
  local retries=0
  while [ $retries -lt $MAX_RETRIES ]; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "$url")
    if [ "$HTTP_CODE" = "200" ]; then
      echo "✓ $name: OK ($HTTP_CODE)"
      return 0
    fi
    retries=$((retries + 1))
    echo "  Attempt $retries/$MAX_RETRIES failed for $name (HTTP $HTTP_CODE)"
    [ $retries -lt $MAX_RETRIES ] && sleep $RETRY_DELAY
  done
  echo "✗ $name: FAILED after $MAX_RETRIES attempts"
  FAILED=$((FAILED + 1))
  return 1
}

echo "=== Health Check $(date -u '+%Y-%m-%d %H:%M:%S UTC') ==="
check_url "Frontend (Vercel)" "$PROD_URL" || true
check_url "BFF /health" "$BFF_URL/health" || true

if [ $FAILED -gt 0 ]; then
  echo "=== HEALTH CHECK FAILED: $FAILED endpoint(s) down ==="
  exit 1
else
  echo "=== All endpoints healthy ==="
  exit 0
fi
