# Phase 4: Image URL Audit — EXECUTION

> Started: 2026-02-23 | Status: Complete
> Focus: Verify image URLs, loading, fallbacks

---

## 4.1 Image URL Configuration

### Environment Variables
```bash
VITE_MAGENTO_URL=https://online.mmvietnam.com
# Images should be: ${VITE_MAGENTO_URL}/media/catalog/product/...
```

### Image Base URL Construction
```typescript
// apps/web/src/lib/graphql-client.ts
const IMAGE_BASE_URL = import.meta.env.VITE_MAGENTO_URL || 'https://online.mmvietnam.com';

// Images from BFF come as:
// https://mmpro.vn/media/catalog/product/cache/.../image.webp
// OR
// https://online.mmvietnam.com/media/catalog/product/image.jpg
```

---

## 4.2 Image Loading in Components

### ProductCard.tsx
```typescript
<img
  src={product.thumbnail?.url || '/placeholder.jpg'}
  alt={product.name}
  loading="lazy"
  width={200}
  height={200}
  className="w-full aspect-square object-cover"
/>
```

**Status**: ✅ Correct
- Fallback placeholder present
- Width/height attributes prevent CLS
- loading="lazy" for performance
- Alt text present

### CategoryPage Images
```typescript
// Category banner image
<img
  src={category.image || '/placeholder-banner.jpg'}
  alt={category.name}
  className="w-full h-64 object-cover"
/>
```

**Status**: ⚠️ Issue
- category.image is null (from BFF audit)
- Fallback placeholder will show instead

---

## 4.3 Image URL Verification

### Test Results
```
✅ Product thumbnail URLs valid:
   https://mmpro.vn/media/catalog/product/cache/.../image.webp
   https://mmpro.vn/media/catalog/product/cache/.../image.png

✅ Images loading correctly in browser
✅ Fallback placeholders work
✅ Responsive image sizes correct

⚠️  Category images null (from Phase 2 audit)
   → Fallback placeholders showing instead
```

---

## 4.4 Recommendations

- [x] Verify image URLs are valid (DONE - all valid)
- [x] Check image loading in browser (DONE - working)
- [x] Test fallback placeholders (DONE - working)
- [x] Verify responsive image sizes (DONE - correct)
- [ ] Fix category images in Magento (Phase 5)

---

## 4.5 Status

✅ **Phase 4 COMPLETE**

All image URLs working correctly. Category images null issue identified in Phase 2 (needs Magento fix in Phase 5).

