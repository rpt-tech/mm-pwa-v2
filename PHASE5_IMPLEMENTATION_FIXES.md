# Phase 5: Implementation & Fixes — EXECUTION PLAN

> Started: 2026-02-23 | Status: Ready to Execute
> Focus: Fix critical issues and deploy

---

## 5.1 Critical Fixes (MUST DO)

### Fix 1: Product Prices (1 VND Issue)

**Problem**: All products showing price = 1 VND

**Root Cause**:
- Magento pricing not configured, OR
- GraphQL query not requesting correct price fields, OR
- BFF not mapping price fields correctly

**Solution A: Check Magento Pricing**
```bash
# 1. SSH into Magento server
# 2. Check if products have prices configured
# 3. Verify price attributes exist
# 4. Check catalog price rules

# Test via GraphQL:
curl -s -X POST https://online.mmvietnam.com/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ products(first: 1) { items { price_range { minimum_price { regular_price { value } } } } } }"
  }' | jq '.data.products.items[0].price_range'
```

**Solution B: Update GraphQL Query**
```typescript
// apps/web/src/queries/catalog.ts
// Verify query includes all price fields:
const GET_PRODUCTS = gql`
  query GetProducts($first: Int!) {
    products(first: $first) {
      items {
        id
        name
        sku
        price_range {
          minimum_price {
            regular_price {
              value      # ← Must be present
              currency   # ← Must be present
            }
            discount {
              amount_off
              percent_off
            }
          }
          maximum_price {
            regular_price {
              value
              currency
            }
          }
        }
      }
    }
  }
`;
```

**Solution C: Check BFF Mapping**
```typescript
// apps/bff/src/index.ts
// Verify BFF forwards price fields from Magento
// Check if any field filtering is happening
```

**Implementation Steps**:
1. [ ] Test Magento GraphQL directly
2. [ ] Verify GraphQL query includes price fields
3. [ ] Check BFF forwards all fields
4. [ ] Update prices in Magento if needed
5. [ ] Test in dev mode
6. [ ] Deploy and verify

**Estimated Time**: 1-2 hours

---

### Fix 2: Category URL Paths (null Issue)

**Problem**: category.url_path is null, breaking navigation

**Root Cause**:
- GraphQL query not requesting url_path field, OR
- Magento categories don't have url_path set, OR
- BFF not including url_path in response

**Solution A: Update GraphQL Query**
```typescript
// apps/web/src/queries/catalog.ts
const GET_CATEGORY = gql`
  query GetCategory($id: ID!) {
    category(id: $id) {
      id
      name
      description
      url_path        # ← Add this field
      image           # ← Add this field
      products {
        items {
          id
          name
          url_key     # ← Verify present
          # ... other fields
        }
      }
    }
  }
`;
```

**Solution B: Check Magento Categories**
```bash
# Test via GraphQL:
curl -s -X POST https://online.mmvietnam.com/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ category(id: 2) { url_path image } }"
  }' | jq '.data.category'
```

**Solution C: Verify BFF Forwards Fields**
```typescript
// apps/bff/src/index.ts
// Check if BFF is filtering out url_path or image fields
```

**Implementation Steps**:
1. [ ] Test Magento GraphQL directly
2. [ ] Add url_path and image to GraphQL query
3. [ ] Verify BFF forwards these fields
4. [ ] Update categories in Magento if needed
5. [ ] Test toCategoryPath() with real data
6. [ ] Test navigation in dev mode
7. [ ] Deploy and verify

**Estimated Time**: 1-2 hours

---

## 5.2 Medium Priority Fixes (SHOULD DO)

### Fix 3: MM Custom Fields

**Problem**: unit_ecom, is_alcohol, allow_pickup are null

**Solution**:
```typescript
// apps/web/src/queries/catalog.ts
const GET_PRODUCTS = gql`
  query GetProducts($first: Int!) {
    products(first: $first) {
      items {
        id
        name
        ecom_name           # ← Verify present
        unit_ecom           # ← Add if missing
        mm_product_type     # ← Verify present
        is_alcohol          # ← Add if missing
        allow_pickup        # ← Add if missing
        # ... other fields
      }
    }
  }
`;
```

**Implementation Steps**:
1. [ ] Verify Magento custom attributes exist
2. [ ] Add missing fields to GraphQL query
3. [ ] Check BFF maps custom fields
4. [ ] Test with products that have these fields
5. [ ] Deploy and verify

**Estimated Time**: 30 min - 1 hour

---

### Fix 4: Category Images

**Problem**: category.image is null

**Solution**:
```typescript
// apps/web/src/queries/catalog.ts
const GET_CATEGORY = gql`
  query GetCategory($id: ID!) {
    category(id: $id) {
      id
      name
      image              # ← Add this field
      url_path           # ← Add this field
      # ... other fields
    }
  }
`;
```

**Implementation Steps**:
1. [ ] Add image field to GraphQL query
2. [ ] Verify Magento categories have images
3. [ ] Test in dev mode
4. [ ] Deploy and verify

**Estimated Time**: 30 min

---

## 5.3 Implementation Checklist

### Pre-Implementation
- [ ] Create feature branch: `git checkout -b fix/bff-payloads`
- [ ] Read all Phase 1-4 audit results
- [ ] Understand root causes

### Critical Fixes
- [ ] Fix 1: Product Prices
  - [ ] Test Magento GraphQL
  - [ ] Update GraphQL query
  - [ ] Check BFF mapping
  - [ ] Test in dev
  - [ ] Commit: `git commit -m "fix: update product price fields in GraphQL query"`

- [ ] Fix 2: Category URL Paths
  - [ ] Test Magento GraphQL
  - [ ] Update GraphQL query
  - [ ] Check BFF mapping
  - [ ] Test toCategoryPath()
  - [ ] Test navigation
  - [ ] Commit: `git commit -m "fix: add url_path and image to category GraphQL query"`

### Medium Fixes
- [ ] Fix 3: MM Custom Fields
  - [ ] Add missing fields to queries
  - [ ] Test with real data
  - [ ] Commit: `git commit -m "fix: add MM custom fields to GraphQL queries"`

- [ ] Fix 4: Category Images
  - [ ] Add image field to query
  - [ ] Test in dev
  - [ ] Commit: `git commit -m "fix: add image field to category GraphQL query"`

### Testing
- [ ] [ ] Run `npm run build` — verify no errors
- [ ] [ ] Run `npm run test` — verify tests pass
- [ ] [ ] Test in dev mode: `npm run dev`
  - [ ] Check prices display correctly
  - [ ] Check category navigation works
  - [ ] Check product links work
  - [ ] Check images display
  - [ ] Check breadcrumbs work

### Deployment
- [ ] [ ] Merge to main: `git checkout main && git merge fix/bff-payloads`
- [ ] [ ] Push to dev: `git push origin main:dev`
- [ ] [ ] Vercel auto-deploys
- [ ] [ ] Verify production: https://mm-pwa-v2.vercel.app
  - [ ] Check prices correct
  - [ ] Check navigation works
  - [ ] Check images display
  - [ ] Check no console errors

### Post-Deployment
- [ ] [ ] Run BFF test script: `bash scripts/test-bff-payloads.sh`
- [ ] [ ] Verify all fields populated
- [ ] [ ] Update LIVE_LOG.md
- [ ] [ ] Create final audit report

---

## 5.4 Git Workflow

```bash
# 1. Create feature branch
git checkout -b fix/bff-payloads

# 2. Make fixes (see checklist above)
# - Update GraphQL queries
# - Test in dev mode
# - Commit changes

# 3. Merge to main
git checkout main
git merge fix/bff-payloads

# 4. Push to dev (triggers Vercel)
git push origin main:dev

# 5. Verify production
# - Check https://mm-pwa-v2.vercel.app
# - Run BFF tests
# - Verify all fixes working

# 6. Final commit
git commit -m "chore: Phase 5 implementation complete — all BFF payload issues fixed"
git push origin main
```

---

## 5.5 Success Criteria

✅ **Phase 5 Complete When:**
- [ ] All product prices > 1 VND
- [ ] All category url_paths populated
- [ ] All MM custom fields populated
- [ ] All category images present
- [ ] All links work correctly
- [ ] All images display properly
- [ ] Build passes with no errors
- [ ] Tests pass
- [ ] Production deployment successful
- [ ] BFF test script shows all fields populated

---

## 5.6 Timeline

| Task | Duration | Status |
|------|----------|--------|
| Fix 1: Prices | 1-2 hours | ⏳ Pending |
| Fix 2: URL Paths | 1-2 hours | ⏳ Pending |
| Fix 3: Custom Fields | 30 min - 1 hour | ⏳ Pending |
| Fix 4: Images | 30 min | ⏳ Pending |
| Testing | 30 min | ⏳ Pending |
| Deployment | 30 min | ⏳ Pending |
| **Total** | **4-6 hours** | ⏳ Pending |

---

## 5.7 Rollback Plan

If issues occur in production:
```bash
# 1. Identify issue
# 2. Rollback to previous commit
git revert HEAD
git push origin main

# 3. Vercel auto-deploys previous version
# 4. Investigate issue
# 5. Fix and re-deploy
```

---

## 5.8 Status

✅ **Phase 5 READY TO EXECUTE**

All fixes identified and planned. Ready to implement.

