#!/usr/bin/env bash
# Async lint check — runs after every Write/Edit
# Exit 0 = OK, exit 1 = lint errors (logged, does not block agent)
cd "$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
if [ -f "apps/web/package.json" ]; then
  cd apps/web && npx tsc --noEmit 2>&1 | tail -5 >> ../../LIVE_LOG.md || true
fi
