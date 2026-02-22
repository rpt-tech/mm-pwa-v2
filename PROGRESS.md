# MM PWA v2 — Progress Tracker

## Phase 1: Foundation & Smoke Tests [10/10 ✓]
- ✓ #1: Cleanup stray files
- ✓ #2: Expand smoke tests (17/17 pass)
- ✓ #3: ProductCard memoization
- ✓ #4: ProductGrid skeleton loading
- ✓ #5: CategoryPage filters
- ✓ #6: ProductPage details
- ✓ #7: CartPage layout
- ✓ #8: Checkout flow
- ✓ #9: Auth pages
- ✓ #10: Account pages

## Phase 2: UX & Performance [10/10 ✓]
- ✓ #11: Product quick-view modal
- ✓ #12: Product comparison feature
- ✓ #13: Recently viewed products
- ✓ #14: BFF cache headers
- ✓ #15: Product quick-view on hover
- ✓ #16: Search autocomplete
- ✓ #17: Playwright e2e tests (15/15 pass)
- ✓ #18: Search autocomplete dropdown
- ✓ #19: Lighthouse CI baseline
- ✓ #20: Track order page

## Phase 3: Production Fixes [4/4 ✓]
- ✓ #21: Fix CategoryPage dynamic import error — rebuild chunk
- ✓ #22: Fix menu not closing after category selection
- ✓ #23: Fix schema URLs — use current domain
- ✓ #24: Verify homepage data rendering

**Total: 24/24 features complete**

### Deployment Status
- **Staging:** https://mm-pwa-v2.vercel.app (auto-deployed from dev)
- **Production:** Ready for merge main ← dev
- **BFF:** https://mm-bff.hi-huythanh.workers.dev (v0f6cf0cd)

### Known Issues
- Third-party scripts (webpush.js, delivery.js, CDP365) — external, not our code
- @babel/polyfill loaded multiple times — from third-party scripts

### Next Steps
- Merge dev → main for production release
- Monitor production for any remaining issues
- Plan Phase 4 features (if needed)
