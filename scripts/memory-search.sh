#!/usr/bin/env bash
# AEGIS v5.2 Memory Search
# Search memory index before implementing a feature
# Usage: bash scripts/memory-search.sh "auth user login"

QUERY="${*:-}"
ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
INDEX="$ROOT/.memory/index.json"

[ -f "$INDEX" ] || { echo "No index. Run: bash scripts/memory-index.sh"; exit 1; }
[ -z "$QUERY" ] && { echo "Usage: $0 'query terms'"; exit 1; }

TERMS=$(echo "$QUERY" | tr ' ' '\n' | jq -R . | jq -s .)
jq --argjson terms "$TERMS" '
  [.[] | . as $item |
    ($terms | map(
      . as $t |
      (($item.file // "") | ascii_downcase | contains($t | ascii_downcase)) or
      (($item.exports // "") | ascii_downcase | contains($t | ascii_downcase)) or
      (($item.description // "") | ascii_downcase | contains($t | ascii_downcase))
    ) | map(if . then 1 else 0 end) | add) as $score |
    select($score > 0) |
    {score: $score, file: $item.file, exports: $item.exports, description: $item.description}
  ] | sort_by(-.score) | .[:8]
' "$INDEX"
