# CODEBASE_SCAN.md — AEGIS v5.2 Existing Codebase Analysis
> Generated: 2026-02-22 | PROJECT_MODE: existing

## Tech Stack Detected

| Layer | Technology |
|-------|-----------|
| Framework | React 18.3 + TypeScript 5.7 (strict) |
| Build | Vite 6 + vite-plugin-pwa 0.21 |
| Styling | Tailwind CSS 3.4 |
| State | Zustand 5 (authStore, cartStore, uiStore) |
| Data Fetching | TanStack Query 5 + graphql-request 7 |
| Routing | React Router v6 |
| Forms | React Hook Form 7 + Zod 3 |
| i18n | react-i18next 15 + i18next 24 |
| SEO | react-helmet-async 2 |
| PWA | Workbox (generateSW) + workbox-window 7 |
| Testing | Vitest 2 + Testing Library 16 |
| BFF | Cloudflare Workers (Hono) |
| Deploy FE | Vercel (production branch: dev) |
| Deploy BFF | Cloudflare Workers (wrangler) |
| Monorepo | pnpm workspaces |

## Folder Structure

```
mm-new-pwa/
├── apps/
│   ├── web/src/
│   │   ├── App.tsx                    # Router + lazy page imports
│   │   ├── main.tsx                   # Entry + SW registration
│   │   ├── components/
│   │   │   ├── account/               # AccountSidebar, AddEditAddressDialog, AddressCard, MyAccountLayout
│   │   │   ├── auth/                  # SignIn, CreateAccount, ForgotPassword, SocialLogin, AuthModal
│   │   │   ├── cart/                  # MiniCart
│   │   │   ├── catalog/               # ProductCard, ProductGrid, ProductSort, FilterSidebar, FilterModal, FlashsaleProducts, ProductLabel, StockStatusMessage
│   │   │   ├── checkout/              # PaymentMethods, VietnamLocationCascade
│   │   │   ├── cms/                   # CmsPage, CmsBlock, RichContent
│   │   │   │   └── contentTypes/      # 17 types: Row, Column, ColumnGroup, ColumnLine, Banner, Slider, Image, Text, Html, Heading, Buttons, ButtonItem, Divider, Block, ProductsCarousel, FlashsaleProductsCT, ProductRecommendationCT
│   │   │   ├── common/                # AdvancedPopup, ErrorBoundary, Newsletter, OfflineBanner, PWAInstallBanner, ScrollToTop, StoreSwitcher
│   │   │   ├── home/                  # HomeLandingFallback, HomeSchema
│   │   │   ├── layout/                # Header, Footer, MainLayout
│   │   │   ├── navbar/                # SearchPopular
│   │   │   ├── navigation/            # MegaMenu, Navigation (mobile), Breadcrumbs
│   │   │   ├── product/               # ProductImageCarousel, ProductOptions, ProductReviews, QuantityStepper, RelatedUpsellProducts, WishlistButton, DnrLabel, DnrBlock, AlcoholDialog, AlcoholCheckoutDialog, DescriptionTabs, AdditionalAttributes
│   │   │   ├── seo/                   # BreadcrumbStructuredData, OrganizationStructuredData, ProductStructuredData, WebSiteStructuredData
│   │   │   └── ui/                    # LoadingIndicator, Pagination
│   │   ├── hooks/                     # useAuth, useMediaQuery, useMegaMenu, usePWAInstall
│   │   ├── i18n/                      # config.ts
│   │   ├── lib/                       # analytics, gql, graphql-client, pagebuilderParser, graphql/fragments+queries
│   │   ├── pages/                     # 25 pages (see below)
│   │   ├── queries/                   # 11 query files (account, auth, blog, cart, catalog, checkout, cms, location, navigation, product, searchPopular)
│   │   ├── stores/                    # authStore, cartStore, uiStore
│   │   └── test/                      # setup.ts, smoke.test.ts
│   └── bff/src/index.ts               # Cloudflare Workers BFF (Hono)
├── scripts/                           # agent-watchdog, deploy-bff, deploy-vercel, health-check
├── .claude/settings.local.json
├── BLUEPRINT.md, CLAUDE.md, PROGRESS.md, LIVE_LOG.md, MIGRATION_PLAN.md
└── automation-long-run-code/aegis.md  # ← this file
```

## Existing Features (đã implement — KHÔNG tạo lại)

### Core Infrastructure
- [x] Vite 6 + React 18 + TypeScript strict build pipeline
- [x] TanStack Query v5 setup với QueryClient
- [x] Zustand stores: authStore (JWT/cookie), cartStore, uiStore
- [x] graphql-request BFF client (proxy qua Cloudflare Workers)
- [x] react-i18next với vi/en locale
- [x] react-helmet-async SEO
- [x] Workbox PWA (skipWaiting, clientsClaim, cleanupOutdatedCaches)
- [x] SW auto-reload via registerSW onNeedRefresh
- [x] ErrorBoundary global
- [x] ScrollToTop on route change

### Layout & Navigation
- [x] Header (logo, search, cart, account, wishlist, language switcher, StoreSwitcher)
- [x] Footer (store info, CMS blocks, BCT image, Google Maps)
- [x] MainLayout wrapper
- [x] MegaMenu (desktop, 3-level dropdown, toCategoryPath fix)
- [x] Navigation (mobile sidebar, toCategoryPath fix)
- [x] Breadcrumbs (auto-generate from URL)
- [x] SearchPopular (popular search terms)

### Auth
- [x] SignIn (email/password, React Hook Form + Zod)
- [x] CreateAccount (with phone field)
- [x] ForgotPassword (with success modal)
- [x] SocialLogin (Facebook + Google)
- [x] AuthModal (view switcher)
- [x] useAuth hook

### Pages (25 total)
- [x] HomePage (CmsPage SEO + HomeLandingFallback)
- [x] CategoryPage (filters, sort, pagination, breadcrumbs, CMS blocks)
- [x] ProductPage (images, options, add-to-cart, DNR, alcohol gate, similar products, structured data)
- [x] SearchPage (full-text search, filters, SearchPopular fallback)
- [x] CartPage (items, price summary, promotions, coupon, recommendations)
- [x] CheckoutPage (address, shipping, payment, place order)
- [x] OrderConfirmationPage
- [x] OrderDetailPage (delivery info, VAT, cancel order)
- [x] BlogListPage, BlogDetailPage, BlogSearchPage
- [x] ContactPage, FaqPage, StoreLocatorPage, QuickOrderPage
- [x] GuestOrderPage
- [x] Account pages: Dashboard, OrderHistory, AddressBook, AccountInformation, Wishlist, UpdateEmail, UpdatePhone
- [x] SignInPage, CreateAccountPage, ForgotPasswordPage, ConfirmPasswordPage
- [x] NotFoundPage, CmsPage (route)

### CMS / PageBuilder
- [x] CmsPage (PageBuilder HTML parser, SEO-only detection, URL resolver redirect)
- [x] CmsBlock (embedded CMS blocks)
- [x] RichContent (raw HTML fallback)
- [x] pagebuilderParser.ts (DOMParser-based, 17 content types)
- [x] ContentTypeFactory (17 types: row, column, banner, slider, image, text, html, heading, buttons, button-item, divider, block, products, flashsale-products, product-recommendation, column-group, column-line)
- [x] Html.tsx: ___widget_flashsale + ___widget_product_recommendation shortcodes

### Product
- [x] ProductCard (price, DNR label, add-to-cart, wishlist)
- [x] ProductGrid (grid/list mode, pagination)
- [x] ProductImageCarousel (react-slick)
- [x] ProductOptions (configurable variants, out-of-stock filtering)
- [x] ProductReviews (star ratings)
- [x] QuantityStepper (float step for fresh products)
- [x] RelatedUpsellProducts
- [x] WishlistButton
- [x] DnrLabel, DnrBlock (MM-specific discount display)
- [x] AlcoholDialog, AlcoholCheckoutDialog (age gate)
- [x] DescriptionTabs (description, specs, reviews)
- [x] AdditionalAttributes

### SEO / Structured Data
- [x] ProductStructuredData (JSON-LD)
- [x] BreadcrumbStructuredData
- [x] OrganizationStructuredData
- [x] WebSiteStructuredData
- [x] HomeSchema

### Analytics
- [x] analytics.ts (GA4 + GTM: viewItem, addToCart, purchase, etc.)

### BFF (Cloudflare Workers)
- [x] GraphQL proxy → Magento (CORS fix, Store header injection)
- [x] KV cache with DEPLOY_VERSION prefix
- [x] Health endpoint

## ENV Status

Present (có giá trị trong .env):
- VERCEL_TOKEN, CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID
- VITE_MAGENTO_URL, VITE_AI_SEARCH_URL, VITE_AI_SEARCH_KEY
- VITE_ANTSOMI_SDK_KEY, VITE_FACEBOOK_APP_ID, VITE_FRESHCHAT_TOKEN
- VITE_GOOGLE_CLIENT_ID, VITE_GOONG_KEY, VITE_GTM_ID
- VITE_RECAPTCHA_SITE_KEY, CLAUDE_CODE_MAX_OUTPUT_TOKENS

Missing / not confirmed:
- VITE_GA4_ID (key exists but value unknown)

## Entry Points

| File | Role |
|------|------|
| apps/web/src/main.tsx | React entry, QueryClient, BrowserRouter, SW registration |
| apps/web/src/App.tsx | Route definitions (lazy), ErrorBoundary, MainLayout |
| apps/web/src/lib/graphql-client.ts | gqlClient (graphql-request → BFF) |
| apps/bff/src/index.ts | Cloudflare Workers BFF (Hono router) |
| apps/web/vite.config.ts | Vite + PWA config, manual chunks, workbox |

## Key Observations

1. **Production live**: https://mm-pwa-v2.vercel.app (bundle index-qV1wWcyQ.js, deploy 198ef4d)
2. **BFF live**: https://mm-bff.hi-huythanh.workers.dev
3. **Category routing fixed**: toCategoryPath() strips Magento's "category/" prefix in all nav components
4. **Vercel production branch = dev** (not main) — push to dev triggers deploy
5. **pnpm workspaces** — run commands from root with `--filter @mm/web`
6. **Stray files**: apps/web/EXIT:, apps/web/echo, apps/web/graphql — should be cleaned up
7. **No feature_list.json yet** — AEGIS bootstrap needed
8. **BLUEPRINT.md exists** but is legacy-migration focused, not AEGIS-format
9. **Remaining gaps** (from PROGRESS.md "~99% MVP"): minor polish, performance, testing coverage
10. **Tech debt**: no integration tests, smoke test minimal, no e2e coverage
