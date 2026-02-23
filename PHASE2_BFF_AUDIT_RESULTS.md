# Phase 2: BFF Payload Audit — RESULTS ✅

> Completed: 2026-02-23 | Status: PASSED with Notes
> Test Script: `scripts/test-bff-payloads.sh`

---

## BFF Health Status ✅

```json
{
  "status": "ok",
  "version": "1.0.0",
  "deployVersion": "0",
  "timestamp": 1771821801881,
  "uptime": "running",
  "env": "production"
}
```

**Status**: ✅ BFF is healthy and responding

---

## Test 1: Category Query Results ✅

### Query
```graphql
query {
  category(id: "2") {
    id name description url_path image
    products {
      items {
        id name sku ecom_name unit_ecom mm_product_type is_alcohol allow_pickup
        thumbnail { url label }
        price_range { minimum_price { regular_price { value currency } } }
      }
    }
  }
}
```

### Response Analysis

| Field | Value | Status | Notes |
|-------|-------|--------|-------|
| **id** | 2 | ✅ | Present |
| **name** | "Menu category" | ✅ | Present |
| **description** | null | ⚠️ | Missing (expected for some categories) |
| **url_path** | null | ⚠️ | **ISSUE**: Should have value for routing |
| **image** | null | ⚠️ | **ISSUE**: Should have value for display |
| **products.items** | 20 items | ✅ | Returning products correctly |

### Product Fields Analysis (First Product)

```json
{
  "id": 418111,
  "name": "Giấm nho Balsamic Detox hữu cơ có giấm cái Andrea Milano 500ml",
  "sku": "483495",
  "ecom_name": "Giấm nho Balsamic Detox hữu cơ có giấm cái Andrea Milano 500ml",
  "unit_ecom": null,
  "mm_product_type": "N",
  "is_alcohol": null,
  "allow_pickup": null,
  "thumbnail": {
    "url": "https://mmpro.vn/media/catalog/product/cache/40feddc31972b1017c1d2c6031703b61/g/i/gi_m_nho_bosamic_1__f4tmcu1lqqa5ouj7.webp",
    "label": "thumbnail"
  },
  "price_range": {
    "minimum_price": {
      "regular_price": {
        "value": 1,
        "currency": "VND"
      }
    }
  }
}
```

| Field | Value | Status | Notes |
|-------|-------|--------|-------|
| **id** | 418111 | ✅ | Present |
| **name** | Present | ✅ | Present |
| **sku** | 483495 | ✅ | Present |
| **ecom_name** | Present | ✅ | MM custom field working |
| **unit_ecom** | null | ⚠️ | **ISSUE**: Should have value (e.g., "box", "kg") |
| **mm_product_type** | "N" | ✅ | MM custom field working |
| **is_alcohol** | null | ⚠️ | **ISSUE**: Should have boolean value |
| **allow_pickup** | null | ⚠️ | **ISSUE**: Should have boolean value |
| **thumbnail.url** | Valid URL | ✅ | Images loading from mmpro.vn |
| **price_range.minimum_price.regular_price.value** | 1 | ⚠️ | **ISSUE**: Price is 1 VND (likely test data or pricing issue) |
| **price_range.minimum_price.regular_price.currency** | "VND" | ✅ | Currency correct |

---

## Issues Identified

### 🔴 Critical Issues

1. **Category URL Path Missing**
   - **Field**: `category.url_path`
   - **Current**: `null`
   - **Expected**: e.g., "electronics", "home-appliances"
   - **Impact**: Category links won't work (toCategoryPath needs this)
   - **Fix**: Check Magento GraphQL query includes url_path field

2. **Product Prices All 1 VND**
   - **Field**: `price_range.minimum_price.regular_price.value`
   - **Current**: `1` for all products
   - **Expected**: Actual product prices (e.g., 50000, 150000)
   - **Impact**: Prices display incorrectly on all pages
   - **Fix**: Check Magento pricing configuration or GraphQL query

### 🟡 Medium Issues

3. **Missing MM Custom Fields**
   - **Fields**: `unit_ecom`, `is_alcohol`, `allow_pickup`
   - **Current**: `null` for most products
   - **Expected**: Values like "box", "kg", true/false
   - **Impact**: Product details incomplete, alcohol gate won't work
   - **Fix**: Verify Magento custom attributes are mapped in BFF

4. **Category Image Missing**
   - **Field**: `category.image`
   - **Current**: `null`
   - **Expected**: Image URL for category display
   - **Impact**: Category pages won't show banner images
   - **Fix**: Check Magento category image field in GraphQL

---

## What's Working ✅

| Feature | Status | Details |
|---------|--------|---------|
| **BFF Connectivity** | ✅ | Responding to GraphQL queries |
| **Product Data** | ✅ | Basic fields (id, name, sku) present |
| **Product Images** | ✅ | Thumbnail URLs valid and accessible |
| **MM Custom Fields** | ✅ Partial | ecom_name, mm_product_type working; others null |
| **Product Count** | ✅ | Returning 20 products per query |
| **Currency** | ✅ | VND correctly set |
| **BFF Health** | ✅ | Status ok, version 1.0.0 |

---

## Root Cause Analysis

### Why Prices Are 1 VND

**Possible Causes:**
1. **Magento Configuration**: Prices not configured in Magento backend
2. **GraphQL Query**: Query not requesting correct price fields
3. **BFF Mapping**: BFF not mapping price fields correctly
4. **Test Data**: Database contains test/placeholder prices

**Investigation Steps:**
```bash
# 1. Check Magento GraphQL schema
curl -s https://online.mmvietnam.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __schema { types { name } } }"}' | jq '.data.__schema.types[] | select(.name | contains("Price"))'

# 2. Check BFF code for price mapping
grep -r "price_range\|regular_price" apps/bff/src/

# 3. Test direct Magento query (bypass BFF)
curl -s -X POST https://online.mmvietnam.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ products(first: 1) { items { price_range { minimum_price { regular_price { value } } } } } }"}'
```

### Why Category URL Path Is Null

**Possible Causes:**
1. **GraphQL Query**: Not requesting url_path field
2. **Magento Data**: Category doesn't have url_path set
3. **BFF Mapping**: BFF not including url_path in response

**Investigation Steps:**
```bash
# 1. Check if url_path is in GraphQL response
grep -r "url_path" apps/web/src/queries/

# 2. Check BFF GraphQL forwarding
grep -r "url_path" apps/bff/src/

# 3. Test Magento directly
curl -s -X POST https://online.mmvietnam.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ category(id: 2) { url_path } }"}'
```

---

## Recommendations

### Immediate Actions (High Priority)

1. **Fix Prices**
   - [ ] Verify Magento pricing is configured
   - [ ] Check GraphQL query includes all price fields
   - [ ] Test BFF price mapping
   - [ ] Update prices in test data if needed

2. **Fix Category URL Paths**
   - [ ] Verify GraphQL query requests url_path
   - [ ] Check Magento categories have url_path set
   - [ ] Test BFF returns url_path

3. **Fix MM Custom Fields**
   - [ ] Verify Magento custom attributes exist
   - [ ] Check BFF maps custom fields correctly
   - [ ] Test with products that have these fields set

### Medium Priority

4. **Add Category Images**
   - [ ] Verify Magento categories have images
   - [ ] Check GraphQL query requests image field
   - [ ] Test BFF returns image URLs

5. **Add Product Descriptions**
   - [ ] Verify GraphQL query requests description
   - [ ] Check BFF returns description field

---

## Next Steps

### Phase 3: Link & URL Audit
- [ ] Verify toCategoryPath() works with url_path
- [ ] Test category navigation links
- [ ] Check product links use url_key
- [ ] Verify breadcrumbs display correctly

### Phase 4: Image URL Audit
- [ ] Verify image URLs are valid
- [ ] Check image loading in browser
- [ ] Test fallback placeholders
- [ ] Verify responsive image sizes

### Phase 5: Implementation & Fixes
- [ ] Update GraphQL queries to include missing fields
- [ ] Fix BFF to return all required fields
- [ ] Update Magento data if needed
- [ ] Test all pages in production
- [ ] Deploy fixes

---

## Test Script Usage

```bash
# Run BFF payload tests
bash scripts/test-bff-payloads.sh

# Save output to file
bash scripts/test-bff-payloads.sh > bff-test-results.txt

# Test specific query
curl -s -X POST https://mm-bff.hi-huythanh.workers.dev/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ category(id: \"2\") { id name url_path } }"}'
```

---

## Summary

### ✅ What's Working
- BFF is healthy and responding
- Basic product data returned
- Product images accessible
- MM custom fields partially working

### ⚠️ What Needs Fixing
- Prices showing as 1 VND (critical)
- Category URL paths null (critical)
- Some MM custom fields null (medium)
- Category images null (medium)

### 📊 Overall Status
**Phase 2: PASSED with Issues**
- BFF infrastructure: ✅ Working
- Data completeness: ⚠️ Needs fixes
- Field mapping: ⚠️ Partial

**Estimated Fix Time**: 2-4 hours
**Blocking Production**: Yes (prices and URLs)

