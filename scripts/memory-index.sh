#!/usr/bin/env bash
# AEGIS v5.2 Memory Index Builder
# Build semantic memory index from src/ — run async after each feature pass
# Usage: bash scripts/memory-index.sh &

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
MDIR="$ROOT/.memory"
mkdir -p "$MDIR"

INDEX="[]"
while IFS= read -r file; do
  rel="${file#$ROOT/}"
  exports=$(grep -oP \
    '(?<=export\s)(default\s+)?(function|class|const|async function)\s+\K\w+|(?<=^def |^class )\w+' \
    "$file" 2>/dev/null | head -8 | paste -sd ',' -)
  desc=$(grep -m1 -oP '(?<=//\s{0,2}|/\*\*?\s{0,2}|\#\s{0,2})\K[A-Z].{15,100}' \
    "$file" 2>/dev/null | head -1 || echo "")
  size=$(wc -l < "$file" 2>/dev/null || echo 0)
  entry=$(jq -n \
    --arg f "$rel" --arg e "$exports" --arg d "$desc" --argjson s "$size" \
    '{file:$f,exports:$e,description:$d,lines:$s}')
  INDEX=$(printf '%s' "$INDEX" | jq ". + [$entry]")
done < <(find "$ROOT/apps/web/src" "$ROOT/apps/bff/src" \
  -type f \( -name "*.ts" -o -name "*.tsx" \) \
  2>/dev/null | grep -v node_modules | grep -v __pycache__ | sort | head -300)

printf '%s' "$INDEX" | jq '.' > "$MDIR/index.json"
COUNT=$(printf '%s' "$INDEX" | jq 'length')
echo "[memory] Indexed $COUNT files → .memory/index.json"
