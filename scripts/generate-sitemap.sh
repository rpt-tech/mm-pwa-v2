#!/usr/bin/env bash
# generate-sitemap.sh — Fetch category URLs from Magento GraphQL and generate sitemap.xml

set -euo pipefail

GRAPHQL_URL="https://online.mmvietnam.com/graphql"
BASE_URL="https://online.mmvietnam.com"
OUTPUT="$(dirname "$0")/../apps/web/public/sitemap.xml"
TODAY=$(date -u +"%Y-%m-%d")

echo "[generate-sitemap] Fetching category tree from $GRAPHQL_URL..."

# GraphQL query — 4 levels deep to cover full category hierarchy
QUERY='{"query":"{ categoryList { id name url_path children { id name url_path children { id name url_path children { id name url_path children { id name url_path } } } } } }"}'

RESPONSE=$(curl -s -X POST "$GRAPHQL_URL" \
  -H "Content-Type: application/json" \
  -d "$QUERY")

# Validate response
if ! echo "$RESPONSE" | jq -e '.data.categoryList' > /dev/null 2>&1; then
  echo "[generate-sitemap] ERROR: Failed to fetch category data"
  echo "$RESPONSE" | head -c 500
  exit 1
fi

# Extract all url_paths (non-null, non-empty), flatten all levels
URL_PATHS=$(echo "$RESPONSE" | jq -r '
  [.data.categoryList[]
    | ..
    | objects
    | select(.url_path? and .url_path != null and .url_path != "")
    | .url_path
  ] | unique | .[]
')

CATEGORY_COUNT=$(echo "$URL_PATHS" | grep -c . || true)
echo "[generate-sitemap] Found $CATEGORY_COUNT category URLs"

# Static pages
STATIC_PAGES=(
  ""
  "about-us"
  "contact"
  "store-locator"
  "promotions"
  "blog"
)

# Build sitemap XML
{
  echo '<?xml version="1.0" encoding="UTF-8"?>'
  echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'
  echo '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'
  echo '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9'
  echo '          http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">'

  # Homepage + static pages
  for page in "${STATIC_PAGES[@]}"; do
    if [ -z "$page" ]; then
      LOC="$BASE_URL/"
      PRIORITY="1.0"
      FREQ="daily"
    else
      LOC="$BASE_URL/$page"
      PRIORITY="0.6"
      FREQ="weekly"
    fi
    echo "  <url>"
    echo "    <loc>$LOC</loc>"
    echo "    <lastmod>$TODAY</lastmod>"
    echo "    <changefreq>$FREQ</changefreq>"
    echo "    <priority>$PRIORITY</priority>"
    echo "  </url>"
  done

  # Category pages
  while IFS= read -r url_path; do
    [ -z "$url_path" ] && continue
    LOC="$BASE_URL/$url_path.html"
    echo "  <url>"
    echo "    <loc>$LOC</loc>"
    echo "    <lastmod>$TODAY</lastmod>"
    echo "    <changefreq>weekly</changefreq>"
    echo "    <priority>0.8</priority>"
    echo "  </url>"
  done <<< "$URL_PATHS"

  echo '</urlset>'
} > "$OUTPUT"

TOTAL=$(grep -c '<url>' "$OUTPUT" || true)
echo "[generate-sitemap] ✓ Sitemap written to $OUTPUT ($TOTAL URLs total)"
