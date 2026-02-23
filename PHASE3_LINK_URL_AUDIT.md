# Phase 3: Link & URL Path Audit — EXECUTION

> Started: 2026-02-23 | Status: In Progress
> Focus: Verify toCategoryPath(), product links, breadcrumbs

---

## 3.1 Check toCategoryPath Helper

### Current Implementation
File not found

### Test Cases
Test 1: toCategoryPath("category/electronics") = /electronics
Test 2: toCategoryPath("electronics") = /electronics
Test 3: toCategoryPath("") = /
Test 4: toCategoryPath(null) = /

---

## 3.2 Check Navigation Components

### MegaMenu.tsx
const toCategoryPath = (urlPath?: string) =>
  `/category/${(urlPath || '').replace(/^category\//, '')}`;

interface MegaMenuProps {
  isOpen: boolean;
}
--
                to={toCategoryPath(category.url_path)}
                onClick={() => closeDrawer()}
                className={`block font-semibold text-sm mb-2 pb-1 border-b border-gray-100 transition-colors ${
                  activeCategoryId === category.uid
                    ? 'text-[#0272BA]'
                    : 'text-[#263F4F] hover:text-[#0272BA]'
--
                        to={toCategoryPath(child.url_path)}
                        onClick={() => closeDrawer()}
                        className="block text-xs text-gray-600 hover:text-[#0272BA] hover:underline py-0.5"
                      >
                        {child.name}
                      </Link>

### Navigation.tsx
const toCategoryPath = (urlPath?: string) =>
  `/category/${(urlPath || '').replace(/^category\//, '')}`;

interface Category {
  uid: string;
  name: string;
--
          <Link to="/" onClick={closeNav}>
            <img src="/logo.svg" alt="MM Vietnam" className="h-8" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          </Link>
          <button onClick={closeNav} className="p-1.5 text-white hover:bg-white/10 rounded" aria-label="Close menu">
            <X className="w-5 h-5" />
          </button>
--
          <Link to="/sign-in" onClick={closeNav} className="flex items-center gap-3 text-sm font-medium text-[#0272BA]">
            <div className="w-9 h-9 bg-[#0272BA]/10 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-[#0272BA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>

---

## 3.3 Check Product Links

### ProductCard.tsx
  url_key: string;
  __typename?: string;
  small_image?: {
    url: string;
--
        <ProductQuickView urlKey={product.url_key} onClose={() => setQuickViewOpen(false)} />
      )}
      <Link
        to={`/product/${product.url_key}`}
        className="group block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md hover:border-[#0272BA]/30 transition-all"
      >
      {/* Product Image */}
--
                  url_key: product.url_key,
                  name: product.name,

---

## 3.4 Audit Results

### Issues Found
- toCategoryPath usage count: 6
- Hardcoded 'category/' paths: 8

### Recommendations
- [ ] Verify all category links use toCategoryPath()
- [ ] Check for hardcoded paths that should use toCategoryPath()
- [ ] Test category navigation in dev mode
- [ ] Verify breadcrumbs display correct paths
- [ ] Test product links with url_key

---

## 3.5 Status

Phase 3 audit framework created. Ready for detailed analysis.

