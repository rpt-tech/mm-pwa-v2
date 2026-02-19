# Legacy Site Blueprint

## Goal
Rebuild the entire legacy storefront inside `mm-pwa-v2` by following the existing architecture and content contracts found under `pwacng-release-backup/pwacng-release/src/`. This blueprint ensures the *new* PWA mirrors the legacy experience end-to-end (home, catalog, product, cart, CMS, search, blog, and shared layout features) without relying on speculative mockups.

## Strategy
1. **Treat the legacy repo as the canonical source**
   - Every page/component referenced in this plan corresponds to an override or base component inside `pwacng-release`.
   - Copy GraphQL selection sets, CMS identifiers, schema definitions, and structural layout from those files directly into the new app.
2. **Page-level reconstruction**
   - **Home:** use `override/Components/CMS/cms.js` + `@theme/BaseComponents/Schema/homeSchema.js` to drive hero sections, CMS blocks, `RichContent` definitions, and schema.org markup. Keep fallback `HomeLandingFallback` only until CMS data populates.
   - **Category:** mirror `override/Components/Category/*` + `override/Talons/RootComponents/Category/categoryContent.gql.js`. Recreate filters, suggestion widgets, pagination, CMS blocks (`category-top`, `category-bottom`), and metadata logic (breadcrumbs, title, description).
   - **Product:** reconstruct `override/Components/ProductFullDetail/*` along with related fragments (`productFragment.gql.js`, `relatedUpsellProducts.gql.js`, `productDetailFragment.gql.js`). Include DNR logic, modal flows, upsells, and product schema output.
   - **Cart:** follow `override/Components/CartPage/*` + `override/Talons/CartPage`. Cover listing, `PriceSummary`, promotions, modals, recommendations, and CMS blocks.
   - **CMS/Search/Blog:** Align with `override/Components/CMS/cms.js`, `override/Components/SearchPage/searchPage.js`, `@theme/BaseComponents/Blog`, and their Talons to render CMS content, search results, and blog listings exactly as legacy.
   - **Shared Layout:** Use `override/Components/Main/main.js`, `override/Components/App/app.js`, header/footer components, and helpers (breadcrumbs, `AdvancedPopup`, sticky actions) to wrap every page.
3. **Data contracts**
   - Copy GraphQL selection sets from legacy `.gql.js` files into new queries (`apps/web/src/queries/*`). Ensure each field used by a legacy component (images, CTA metadata, schema fields, promotions) exists in the request.
   - Recreate or port legacy Talon-like hooks (`useCategoryContent`, `useProductFullDetail`, `useCartPage`, etc.) so the new React Query usage returns identical data shapes.
4. **Schema/story**
   - Port JSON-LD structures from `homeSchema` and any other schema helpers (product schema, search action) into `apps/web/src/components/seo/` or new shared utilities.
   - Ensure metadata (title, canonical, meta description, OG tags) matches legacy logic (look at `override/Components/Head/index.js` and `override/Components/Breadcrumbs`).
5. **Styling & behavior**
   - Translate legacy SCSS/Tailwind style values (from `extendStyle` files) into equivalent Tailwind utilities or CSS modules.
   - Preserve offline/service-worker behavior by referencing `src/index.js`, `registerSW.js`, and `store.js` from legacy where caching/offline hooks are set up.

## Implementation Notes
- **GraphQL Sources**
  - `override/Talons/RootComponents/Category/categoryContent.gql.js`
  - `override/Components/Category/categoryFragments.gql.js`
  - `override/Components/Product/productFragment.gql.js`
  - `override/Components/CartPage/cartPage.gql.js` (or Talon variant)
  - `@theme/BaseComponents/Schema/homeSchema.js` (structured data)
  - `override/Talons/SearchPage/searchPage.gql.js` and similar blog queries
- **Components to build/adapt**
  - `apps/web/src/components/cms/RichContent.tsx` + new type components for hero, promo, search widget, etc.
  - `apps/web/src/pages/{Home,Category,Product,Cart,Search,Blog}.tsx`
  - Layout wrappers (`App.tsx`, `providers`, `layout/MainLayout.tsx`)
  - SEO helpers in `apps/web/src/components/seo` and `apps/web/src/components/schema`
- **Behavioral parity**
  - Implement DNR (age gating) logic, modals, sticky toolbars, and `SamePromotionDnrProducts` exactly as defined in legacy overrides.
  - Use same breadcrumb structures (`override/Components/Breadcrumbs/staticBreadcrumbs.js`) to set titles/paths.

## Verification & Logging
1. **Manual QA:** Run `npm run dev`, navigate all major routes, and compare with legacy experience (hero sections, category layout, product details, cart state, search/blog outputs).
2. **API alignment:** Query the legacy GraphQL fields and ensure the new queries include identical sets; validate responses with legacy fragments.
3. **Structured Data:** Inspect the rendered `<script type="application/ld+json">` for home/product/search; ensure `WebSite`, `SearchAction`, and product schema align.
4. **Regression tests:** Add Vitest/RTL tests for key components (e.g., `RichContent`, `ProductFullDetail`) to guarantee correct rendering given legacy-style payloads.
5. **Project workflow:** After editing is permitted, update `LIVE_LOG.md`, `PROGRESS.md`, and clear `STEERING.md` for each milestone. Commit/push frequently using `feat: legacy site blueprint` or similar.

## Action Items for AI
- **Follow this blueprint** before coding; use legacy overrides as truth source for layout, data, and behavior.
- **Document any deviations** from legacy due to missing assets/data before implementation so they can be corrected.
- **Ensure sequence:** catalog legacy data, port queries, rebuild components, style, then verify.
