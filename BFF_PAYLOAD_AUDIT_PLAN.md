# BFF Payload Audit & CSS/Link Fix Plan

> Created: 2026-02-23 | Status: Planning Phase
> Issues: Missing CSS on all pages, broken links, incomplete BFF payloads

---

## Executive Summary

**Current Issues:**
1. ❌ CSS not loading on all pages (Tailwind styles missing)
2. ❌ Links broken/incorrect across navigation
3. ❌ BFF payloads may be missing required fields
4. ❌ Category URLs not resolving correctly
5. ❌ Product images/prices not displaying

**Root Causes to Investigate:**
- Vite 7 CSS bundling changes
- BFF response structure mismatch
- GraphQL query field selection incomplete
- URL path construction issues (toCategoryPath)
- Image URL base path configuration

---

## Phase 1: CSS Loading Audit

### 1.1 Verify CSS Bundle Generation

```bash
# Check if CSS is being generated
ls -lah apps/web/dist/assets/*.css

# Check main bundle for CSS imports
grep -r "import.*\.css" apps/web/dist/assets/index-*.js | head -5

# Verify Tailwind CSS 4.2 compilation
pnpm --filter @mm/web run build 2>&1 | grep -i "css\|tailwind"
```

**Expected Output:**
- `dist/assets/index-*.css` exists and > 50KB
- CSS imports in main bundle
- No Tailwind compilation errors

### 1.2 Check Vite CSS Config

**File**: `apps/web/vite.config.ts`

```typescript
// Verify CSS handling
export default defineConfig({
  css: {
    postcss: './postcss.config.js',
    preprocessorOptions: {
      scss: { /* ... */ }
    }
  },
  build: {
    cssCodeSplit: true,  // ← Should be true for code splitting
    cssMinify: 'lightningcss',  // ← Vite 7 uses lightningcss
  }
});
```

**Checklist:**
- [ ] postcss.config.js uses `@tailwindcss/postcss`
- [ ] CSS code splitting enabled
- [ ] No CSS minification conflicts
- [ ] Vite PWA plugin not stripping CSS

### 1.3 Check HTML Entry Point

**File**: `apps/web/index.html`

```html
<!-- Verify CSS is injected -->
<head>
  <link rel="stylesheet" href="/src/index.css" />
  <!-- Vite will inject compiled CSS here -->
</head>
```

**Checklist:**
- [ ] `src/index.css` exists and imports Tailwind
- [ ] No `@import` conflicts
- [ ] Vite PWA manifest doesn't exclude CSS

### 1.4 Check src/index.css

**File**: `apps/web/src/index.css`

```css
/* Should have Tailwind directives */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom styles */
@layer components {
  /* ... */
}
```

**Checklist:**
- [ ] All 3 Tailwind directives present
- [ ] No syntax errors
- [ ] Custom layers properly defined

---

## Phase 2: BFF Payload Audit

### 2.1 Audit GraphQL Queries

**Files to Check:**
- `apps/web/src/queries/catalog.ts` — Product/category queries
- `apps/web/src/queries/product.ts` — Product detail query
- `apps/web/src/queries/checkout.ts` — Checkout queries
- `apps/web/src/lib/graphql/fragments.ts` — Shared fragments

**Checklist for Each Query:**

```typescript
// Example: GET_CATEGORY query
const GET_CATEGORY = gql`
  query GetCategory($id: ID!) {
    category(id: $id) {
      id
      name
      description
      url_path  // ← Check if present
      image     // ← Check if present
      products {
        items {
          id
          name
          sku
          price_range { minimum_price { regular_price { value currency } } }
          thumbnail { url label }
          ecom_name  // ← MM custom field
          unit_ecom  // ← MM custom field
          mm_product_type  // ← MM custom field
          is_alcohol  // ← MM custom field
          allow_pickup  // ← MM custom field
        }
      }
    }
  }
`;
```

**Required Fields by Entity:**

| Entity | Required Fields | MM Custom Fields | Status |
|--------|-----------------|------------------|--------|
| **Product** | id, name, sku, price_range, thumbnail, url_key | ecom_name, unit_ecom, mm_product_type, is_alcohol, allow_pickup | ❓ |
| **Category** | id, name, description, url_path, image | — | ❓ |
| **Cart Item** | uid, product, quantity, prices | — | ❓ |
| **Order** | id, number, status, items, shipping_address | — | ❓ |
| **Customer** | id, email, firstname, lastname, addresses | — | ❓ |

### 2.2 Test BFF Responses

**Script**: `scripts/test-bff-payloads.sh`

```bash
#!/bin/bash

BFF_URL="https://mm-bff.hi-huythanh.workers.dev"

# Test 1: Get category
echo "=== Test 1: Get Category ==="
curl -X POST "$BFF_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { category(id: \"2\") { id name description url_path image } }"
  }' | jq '.'

# Test 2: Get products
echo "=== Test 2: Get Products ==="
curl -X POST "$BFF_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { products(first: 5) { items { id name ecom_name unit_ecom mm_product_type is_alcohol allow_pickup } } }"
  }' | jq '.'

# Test 3: Get product detail
echo "=== Test 3: Get Product Detail ==="
curl -X POST "$BFF_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { product(sku: \"TEST-SKU\") { id name ecom_name unit_ecom mm_product_type is_alcohol allow_pickup } }"
  }' | jq '.'
```

**Expected Checks:**
- [ ] All required fields present in response
- [ ] No null values for critical fields
- [ ] MM custom fields populated
- [ ] Image URLs valid (not null/empty)
- [ ] Price values present and > 0
- [ ] URL paths correct (no double "category/" prefix)

### 2.3 Audit BFF Code

**File**: `apps/bff/src/index.ts`

```typescript
// Check if BFF is:
// 1. Forwarding all fields from Magento
// 2. Adding custom field mappings
// 3. Handling errors gracefully
// 4. Caching responses correctly

export default {
  async fetch(request, env) {
    // Should proxy GraphQL queries to Magento
    // Should inject Store header
    // Should handle CORS
    // Should cache responses with KV
  }
};
```

**Checklist:**
- [ ] BFF forwards all Magento fields
- [ ] Custom MM fields mapped correctly
- [ ] Store header injected (X-Magento-Store-Code)
- [ ] CORS headers set correctly
- [ ] KV cache working (check deployVersion)
- [ ] Error responses include error details

---

## Phase 3: Link & URL Path Audit

### 3.1 Check toCategoryPath Helper

**File**: `apps/web/src/lib/toCategoryPath.ts`

```typescript
// Should strip "category/" prefix from Magento URLs
export const toCategoryPath = (urlPath: string): string => {
  if (!urlPath) return '/';
  // Remove "category/" prefix if present
  return urlPath.startsWith('category/')
    ? '/' + urlPath.replace('category/', '')
    : '/' + urlPath;
};
```

**Test Cases:**
- [ ] `toCategoryPath('category/electronics')` → `/electronics`
- [ ] `toCategoryPath('electronics')` → `/electronics`
- [ ] `toCategoryPath('')` → `/`
- [ ] `toCategoryPath(null)` → `/`

### 3.2 Check Navigation Components

**Files to Audit:**
- `apps/web/src/components/navigation/MegaMenu.tsx`
- `apps/web/src/components/navigation/Navigation.tsx`
- `apps/web/src/components/layout/Header.tsx`

**Checklist for Each:**
```typescript
// Links should use toCategoryPath
<Link to={toCategoryPath(category.url_path)}>
  {category.name}
</Link>

// NOT:
<Link to={`/category/${category.url_path}`}>  // ❌ Double prefix
<Link to={category.url_path}>  // ❌ Missing leading slash
```

- [ ] All category links use `toCategoryPath()`
- [ ] Product links use correct URL format
- [ ] No hardcoded paths
- [ ] Links tested in dev mode

### 3.3 Check Product Links

**File**: `apps/web/src/components/catalog/ProductCard.tsx`

```typescript
// Should link to product page with correct URL
<Link to={`/product/${product.url_key}`}>
  {product.name}
</Link>

// Check if url_key is present in BFF response
```

**Checklist:**
- [ ] `product.url_key` present in GraphQL response
- [ ] Product links format: `/product/{url_key}`
- [ ] No double slashes or encoding issues
- [ ] Links work in production

---

## Phase 4: Image URL Audit

### 4.1 Check Image Base URL

**File**: `apps/web/src/lib/graphql-client.ts` or `.env`

```typescript
// Should have image base URL configured
const IMAGE_BASE_URL = process.env.VITE_MAGENTO_URL || 'https://online.mmvietnam.com';

// Images should be constructed as:
const imageUrl = `${IMAGE_BASE_URL}/media/catalog/product${product.thumbnail.url}`;
```

**Checklist:**
- [ ] `VITE_MAGENTO_URL` set in `.env`
- [ ] Image URLs constructed correctly
- [ ] No double slashes in URLs
- [ ] Images load in browser (check Network tab)

### 4.2 Check ProductCard Image Rendering

**File**: `apps/web/src/components/catalog/ProductCard.tsx`

```typescript
<img
  src={product.thumbnail?.url || '/placeholder.jpg'}
  alt={product.name}
  loading="lazy"
  width={200}
  height={200}
/>
```

**Checklist:**
- [ ] Fallback placeholder exists
- [ ] Width/height attributes prevent CLS
- [ ] `loading="lazy"` for performance
- [ ] Alt text present

---

## Phase 5: Implementation Plan

### Step 1: CSS Debugging (30 min)
```bash
# 1. Check if CSS file exists
ls -lah apps/web/dist/assets/*.css

# 2. Check browser DevTools
# - Open https://mm-pwa-v2.vercel.app
# - DevTools → Network → filter by .css
# - Check if CSS files load (200 status)
# - Check if styles applied (Elements tab)

# 3. Check Vite config
cat apps/web/vite.config.ts | grep -A 10 "css:"

# 4. Check postcss config
cat apps/web/postcss.config.js

# 5. Rebuild and check
pnpm --filter @mm/web run build
```

### Step 2: BFF Payload Testing (45 min)
```bash
# 1. Create test script
cat > scripts/test-bff-payloads.sh << 'EOF'
#!/bin/bash
# Test BFF responses
BFF_URL="https://mm-bff.hi-huythanh.workers.dev"

# Test category query
curl -X POST "$BFF_URL" \
  -H "Content-Type: application/json" \
  -d '{"query":"query{category(id:\"2\"){id name description url_path image products{items{id name ecom_name unit_ecom mm_product_type is_alcohol allow_pickup thumbnail{url}prices{minimum_price{regular_price{value currency}}}}}}}"}'
EOF

# 2. Run tests
bash scripts/test-bff-payloads.sh | jq '.'

# 3. Check for missing fields
# - ecom_name, unit_ecom, mm_product_type, is_alcohol, allow_pickup
# - thumbnail.url, prices.minimum_price.regular_price
# - category.url_path, category.image
```

### Step 3: Link & URL Audit (30 min)
```bash
# 1. Check toCategoryPath usage
grep -r "toCategoryPath" apps/web/src/components/ | wc -l

# 2. Check for hardcoded paths
grep -r "category/" apps/web/src/components/ | grep -v "toCategoryPath"

# 3. Test in dev mode
pnpm --filter @mm/web run dev
# - Click category links
# - Check URL format in browser
# - Verify page loads correctly
```

### Step 4: Fix Issues (1-2 hours)
- [ ] Update GraphQL queries to include missing fields
- [ ] Fix CSS bundling (if needed)
- [ ] Update BFF to return all required fields
- [ ] Fix URL path construction
- [ ] Update image URL handling
- [ ] Test all pages

### Step 5: Deploy & Verify (30 min)
```bash
# 1. Commit fixes
git add -A
git commit -m "fix: audit BFF payloads, CSS loading, and URL paths"

# 2. Push to dev (triggers Vercel)
git push origin main:dev

# 3. Verify in production
# - Check CSS loads
# - Check links work
# - Check images display
# - Check prices show
```

---

## Detailed Checklist

### CSS Loading
- [ ] `dist/assets/index-*.css` exists
- [ ] CSS file > 50KB (not minified to nothing)
- [ ] Browser Network tab shows CSS loading (200 status)
- [ ] DevTools Elements tab shows Tailwind classes applied
- [ ] All pages have styling (not just white/unstyled)
- [ ] Responsive design works (mobile/tablet/desktop)

### BFF Payloads
- [ ] All required fields in GraphQL response
- [ ] MM custom fields (ecom_name, unit_ecom, etc.) present
- [ ] Image URLs valid and accessible
- [ ] Prices > 0 and formatted correctly
- [ ] Category URLs don't have double "category/" prefix
- [ ] Product URLs have url_key field
- [ ] No null values for critical fields

### Links & URLs
- [ ] Category links use `toCategoryPath()`
- [ ] Product links format: `/product/{url_key}`
- [ ] No hardcoded paths
- [ ] Links work in production
- [ ] Breadcrumbs show correct paths
- [ ] Navigation menu links work

### Images
- [ ] Product images load
- [ ] Category images load
- [ ] Fallback placeholders work
- [ ] Image URLs constructed correctly
- [ ] No 404 errors in Network tab

---

## Success Criteria

✅ **Phase Complete When:**
1. CSS loads on all pages (Tailwind styles visible)
2. All BFF payloads include required fields
3. All links work correctly (no 404s)
4. Images display properly
5. Prices show correctly
6. Category navigation works
7. Product pages load with all data
8. Build passes with no errors
9. Production deployment successful

---

## Timeline

| Phase | Task | Duration | Status |
|-------|------|----------|--------|
| 1 | CSS Loading Audit | 30 min | ⏳ Pending |
| 2 | BFF Payload Audit | 45 min | ⏳ Pending |
| 3 | Link & URL Audit | 30 min | ⏳ Pending |
| 4 | Implementation | 1-2 hours | ⏳ Pending |
| 5 | Deploy & Verify | 30 min | ⏳ Pending |
| **Total** | | **3-4 hours** | ⏳ Pending |

---

## Next Steps

1. **Immediate**: Run CSS debugging checks (Phase 1)
2. **Then**: Test BFF payloads (Phase 2)
3. **Then**: Audit links and URLs (Phase 3)
4. **Then**: Implement fixes
5. **Finally**: Deploy and verify

Ready to start? Let me know which phase to begin with!
