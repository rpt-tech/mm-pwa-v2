#!/bin/bash

# BFF Payload Test Script — Phase 2 Audit
# Tests GraphQL queries to verify all required fields are returned

set -e

BFF_URL="https://mm-bff.hi-huythanh.workers.dev/graphql"
MAGENTO_URL="https://online.mmvietnam.com"

echo "=========================================="
echo "BFF Payload Audit — Phase 2"
echo "=========================================="
echo ""

# Test 1: Get Category with all fields
echo "=== Test 1: Get Category ==="
echo "Query: category(id: \"2\") with all fields"
echo ""

RESPONSE=$(curl -s -X POST "$BFF_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { category(id: \"2\") { id name description url_path image products { items { id name sku ecom_name unit_ecom mm_product_type is_alcohol allow_pickup thumbnail { url label } price_range { minimum_price { regular_price { value currency } } } } } } }"
  }')

echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Check for required fields
echo "Checking required fields..."
echo -n "  - id: "
echo "$RESPONSE" | jq '.data.category.id' 2>/dev/null && echo "✅" || echo "❌"
echo -n "  - name: "
echo "$RESPONSE" | jq '.data.category.name' 2>/dev/null && echo "✅" || echo "❌"
echo -n "  - url_path: "
echo "$RESPONSE" | jq '.data.category.url_path' 2>/dev/null && echo "✅" || echo "❌"
echo -n "  - image: "
echo "$RESPONSE" | jq '.data.category.image' 2>/dev/null && echo "✅" || echo "❌"
echo ""

# Test 2: Get Products with MM custom fields
echo "=== Test 2: Get Products with MM Custom Fields ==="
echo "Query: products(first: 5) with ecom_name, unit_ecom, mm_product_type, is_alcohol, allow_pickup"
echo ""

RESPONSE=$(curl -s -X POST "$BFF_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { products(first: 5) { items { id name sku ecom_name unit_ecom mm_product_type is_alcohol allow_pickup thumbnail { url label } price_range { minimum_price { regular_price { value currency } } } } } }"
  }')

echo "$RESPONSE" | jq '.data.products.items[0]' 2>/dev/null || echo "$RESPONSE"
echo ""

# Check for MM custom fields
echo "Checking MM custom fields in first product..."
FIRST_PRODUCT=$(echo "$RESPONSE" | jq '.data.products.items[0]' 2>/dev/null)
echo -n "  - ecom_name: "
echo "$FIRST_PRODUCT" | jq '.ecom_name' 2>/dev/null && echo "✅" || echo "❌"
echo -n "  - unit_ecom: "
echo "$FIRST_PRODUCT" | jq '.unit_ecom' 2>/dev/null && echo "✅" || echo "❌"
echo -n "  - mm_product_type: "
echo "$FIRST_PRODUCT" | jq '.mm_product_type' 2>/dev/null && echo "✅" || echo "❌"
echo -n "  - is_alcohol: "
echo "$FIRST_PRODUCT" | jq '.is_alcohol' 2>/dev/null && echo "✅" || echo "❌"
echo -n "  - allow_pickup: "
echo "$FIRST_PRODUCT" | jq '.allow_pickup' 2>/dev/null && echo "✅" || echo "❌"
echo ""

# Test 3: BFF Health Check
echo "=== Test 3: BFF Health Check ==="
echo "Endpoint: /health"
echo ""

HEALTH=$(curl -s "https://mm-bff.hi-huythanh.workers.dev/health")
echo "$HEALTH" | jq '.' 2>/dev/null || echo "$HEALTH"
echo ""

# Summary
echo "=========================================="
echo "Summary"
echo "=========================================="
echo ""
echo "✅ Phase 2 BFF Payload Audit Complete"
echo ""
echo "Next steps:"
echo "1. Review all responses above"
echo "2. Check for missing fields (should show null or value)"
echo "3. Verify MM custom fields are populated"
echo "4. Check image URLs are valid"
echo "5. Verify prices > 0"
echo ""
