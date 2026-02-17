# MIGRATION PLAN: PWA Studio → Modern Stack
> Tích hợp với workflow CLAUDE.md | Updated: 2026-02-17

---

## 🎯 MỤC TIÊU

Rebuild hoàn toàn từ đầu (greenfield), chỉ dùng `pwacng-release-backup/pwacng-release/` làm **reference** để:
- Đảm bảo business logic chính xác 1:1
- Đảm bảo GraphQL queries đúng với backend Magento
- Không giữ lại bất kỳ dependency nào của PWA Studio / Webpack 4 / Magento UI

### Kết quả mong muốn
| Aspect | Cũ (Source) | Mới (Target) |
|--------|-------------|--------------|
| Build tool | Webpack 4 | Vite 6 |
| React | 17 | 18 |
| State | Redux + Apollo Cache | Zustand + TanStack Query |
| HTTP/GQL | Apollo Client 3 | TanStack Query + graphql-request |
| Styling | CSS Modules + Tailwind | Tailwind CSS only |
| Routing | React Router v5 | React Router v6 |
| Forms | informed | React Hook Form + Zod |
| i18n | react-intl | react-i18next |
| PWA | Workbox webpack | Vite PWA Plugin |
| Deploy FE | Buildpack/Magento | Vercel |
| BFF | Upward.js + Magento | Cloudflare Workers |
| Testing | Jest | Vitest + Testing Library |

---

## 🏗️ KIẾN TRÚC

```
┌─────────────────────────────────────────────┐
│              VERCEL (Frontend)               │
│  React 18 + Vite + TanStack Query + Zustand │
│  PWA-ready, offline-first, edge-cached      │
└──────────────────┬──────────────────────────┘
                   │ HTTPS / REST / GraphQL
┌──────────────────▼──────────────────────────┐
│         CLOUDFLARE WORKERS (BFF)             │
│  - Auth middleware (JWT / cookie)            │
│  - GraphQL proxy → Magento                  │
│  - Response caching (KV Store)              │
│  - Rate limiting / security headers         │
│  - REST endpoints for non-GQL ops           │
└──────────────────┬──────────────────────────┘
                   │ GraphQL / REST
┌──────────────────▼──────────────────────────┐
│           MAGENTO BACKEND (existing)         │
│  GraphQL API - không thay đổi               │
└─────────────────────────────────────────────┘
```

### Repo Structure
```
D:/mm-new-pwa/
├── apps/
│   └── web/                    # Frontend React app (deploy Vercel)
│       ├── src/
│       │   ├── pages/          # Route-based pages
│       │   ├── components/     # Shared components
│       │   ├── features/       # Feature-scoped modules
│       │   │   ├── auth/
│       │   │   ├── cart/
│       │   │   ├── checkout/
│       │   │   ├── catalog/
│       │   │   ├── account/
│       │   │   └── ...
│       │   ├── hooks/          # Shared hooks
│       │   ├── stores/         # Zustand stores
│       │   ├── queries/        # GQL query definitions
│       │   ├── lib/            # Config, clients, utils
│       │   └── types/          # TypeScript types
│       ├── public/
│       ├── vite.config.ts
│       └── package.json
└── apps/
    └── bff/                    # Cloudflare Workers BFF
        ├── src/
        │   ├── routes/         # Worker route handlers
        │   ├── middleware/     # Auth, cache, headers
        │   ├── graphql/        # GQL schema proxy
        │   └── index.ts
        └── wrangler.toml
```

---

## 📦 TECH STACK CHI TIẾT

### Frontend (apps/web)
```json
{
  "core": ["react@18", "react-dom@18", "typescript"],
  "build": ["vite@6", "vite-plugin-pwa"],
  "routing": ["react-router-dom@6"],
  "data": ["@tanstack/react-query@5", "graphql-request", "axios"],
  "state": ["zustand@5"],
  "forms": ["react-hook-form", "zod", "@hookform/resolvers"],
  "ui": ["tailwindcss@3", "clsx", "tailwind-merge"],
  "i18n": ["react-i18next", "i18next"],
  "utils": ["date-fns", "js-cookie", "crypto-js"],
  "maps": ["@goongmaps/goong-map-react"],
  "media": ["react-image-lightbox", "react-youtube"],
  "analytics": ["react-ga4"],
  "pwa": ["workbox-core", "workbox-routing", "workbox-strategies"],
  "test": ["vitest", "@testing-library/react", "@testing-library/user-event"]
}
```

### BFF (apps/bff)
```json
{
  "runtime": ["@cloudflare/workers-types", "hono"],
  "graphql": ["graphql", "graphql-request"],
  "auth": ["@tsndr/cloudflare-worker-jwt"],
  "cache": ["KV Store (Cloudflare native)"]
}
```

---

## 📋 INVENTORY - PAGES & COMPONENTS CẦN MIGRATE

### Pages (Routes)
| Page | Route | Priority | Source Component |
|------|-------|----------|-----------------|
| Home | `/` | P0 | ContentTypes + CmsBlock |
| Category / PLP | `/category/*` | P0 | Category |
| Product Detail | `/product/*` | P0 | ProductFullDetail |
| Search | `/search` | P0 | SearchPage |
| Cart | `/cart` | P0 | CartPage |
| Checkout | `/checkout` | P0 | CheckoutPage |
| Sign In | `/sign-in` | P0 | SignInPage |
| Create Account | `/create-account` | P0 | CreateAccountPage |
| Forgot Password | `/forgot-password` | P0 | ForgotPasswordPage |
| Confirm Password | `/confirm-password` | P0 | ConfirmPasword |
| My Account | `/account` | P1 | MyAccount |
| Account Info | `/account/info` | P1 | AccountInformationPage |
| Address Book | `/account/addresses` | P1 | AddressBookPage |
| Order History | `/account/orders` | P1 | OrderHistoryPage |
| Wishlist | `/account/wishlist` | P1 | WishlistPage |
| Update Email | `/account/email` | P1 | UpdateCustomerEmail |
| Update Phone | `/account/phone` | P1 | UpdatePhoneNumber |
| CMS Pages | `/[cms-url]` | P1 | CMS |
| Blog List | `/blog` | P2 | BlogList |
| Blog Detail | `/blog/:slug` | P2 | BlogDetailPage |
| Blog Search | `/blog/search` | P2 | BlogSearchPage |
| Store Locator | `/store-locator` | P2 | StoreLocator |
| Contact | `/contact` | P2 | Contact |
| FAQ | `/faq` | P2 | FaqPage |
| Quick Order | `/quick-order` | P2 | QuickOrder |
| Error 404 | `*` | P0 | ErrorView |

### Shared Components (Priority order)
**P0 - Core layout:**
- Header, Footer, Navigation, MegaMenu
- Breadcrumbs, LoadingIndicator, ErrorMessage
- Modal, Dialog, Mask, ToastContainer

**P0 - Commerce:**
- AuthModal (SignIn + CreateAccount + ForgotPassword flow)
- MiniCart, CartPage, QuantityStepper
- CheckoutPage (Address, Shipping, Payment, Confirmation)
- ProductFullDetail, Gallery, ProductImageCarousel
- Category (filters, sort, pagination), FilterModal, FilterSidebar
- SearchBar, SearchPage, SearchAI

**P1 - Account:**
- AccountMenu, AccountChip
- AccountInformationPage, AddressBookPage
- OrderHistoryPage, WishlistPage
- Password, Field, TextInput, TextArea, Select

**P1 - Product extras:**
- ProductLabel, ProductRecommendation, FlashsaleProducts
- ProductSort, Pagination, Reviews
- StockStatusMessage, Wishlist

**P2 - Content & misc:**
- Blog (full feature), CmsBlock, RichContent, ContentTypes
- StoreLocator (Goong Maps), Contact, FAQ
- AIChatbox, SearchAI, VoiceMicField, VoiceTextField
- SocialLogin, MCardLogin, LoginAsCustomer
- QuickOrder, ListPdf, UploadFileField, UploadImageField
- Schema (SEO), Translate, LanguageSelector

### Features đặc thù cần preserve
- **MCard payment** - tích hợp loyalty card
- **Delivery Time picker** - chọn giờ giao
- **Include VAT toggle** - hiển thị giá VAT
- **AI Chatbox** - chat support tích hợp
- **Voice search** - tìm kiếm bằng giọng nói
- **Social Login** - Google/Facebook
- **Goong Maps** - store locator với bản đồ VN
- **Flashsale countdown** - flash sale với timer
- **Quick Order** - đặt hàng nhanh theo SKU
- **Login as Customer** - admin impersonate

---

## 🚀 PHASES

### Phase 0: Foundation (P0 - Critical Path)
> Mục tiêu: Có thể chạy dev server với routing cơ bản

**Tasks:**
- [ ] Khởi tạo monorepo (pnpm workspaces hoặc turborepo)
- [ ] Setup `apps/web` với Vite + React 18 + TypeScript
- [ ] Cấu hình Tailwind CSS
- [ ] Cấu hình React Router v6 với route structure
- [ ] Setup TanStack Query (QueryClient, QueryProvider, DevTools)
- [ ] Setup Zustand (auth store, cart store, ui store)
- [ ] Setup graphql-request client (point to BFF)
- [ ] Setup React Hook Form global config
- [ ] Setup react-i18next (migrate i18n strings từ source)
- [ ] Setup Vite PWA Plugin + Service Worker
- [ ] Cấu hình path aliases (`@/`)
- [ ] Setup `apps/bff` với Hono + Wrangler
- [ ] BFF: GraphQL proxy route → Magento
- [ ] BFF: Auth middleware (token forward)
- [ ] Deploy BFF lên Cloudflare Workers (staging)
- [ ] Cấu hình Vercel project (auto-deploy từ `apps/web`)
- [ ] Setup CI: lint, type-check, build

**Output:** Empty shell chạy được trên Vercel + BFF live trên CF

---

### Phase 1: Auth + Navigation (P0)
> Mục tiêu: User có thể login, browse site

**Auth flow (migrate 1:1):**
- [ ] AuthModal (slide: SignIn → CreateAccount → ForgotPassword)
- [ ] SignIn với email/password → mutation `generateCustomerToken`
- [ ] CreateAccount → mutation `createCustomer` + auto-login
- [ ] ForgotPassword → mutation `requestPasswordResetEmail`
- [ ] ConfirmPassword → mutation `resetPassword`
- [ ] Social Login (Google, Facebook) → mutation tương ứng
- [ ] MCard Login → custom mutation
- [ ] Token management trong Zustand (persist to cookie)
- [ ] Auth guard HOC/hook

**Navigation:**
- [ ] Header (logo, search, cart icon, account chip)
- [ ] MegaMenu (query `categoryList` cho mega menu tree)
- [ ] CategoryTree sidebar
- [ ] Footer
- [ ] Breadcrumbs (dynamic)
- [ ] LanguageSelector

**Zustand stores:**
- [ ] `authStore` - user, token, isLoggedIn
- [ ] `uiStore` - modals open/close, drawer state
- [ ] `cartStore` - cart id, item count (sync với TanStack Query)

---

### Phase 2: Catalog (P0)
> Mục tiêu: User có thể browse products

- [ ] Category page - query `products` với filters, sort, pagination
- [ ] Filter sidebar - aggregations từ product query
- [ ] FilterModal - mobile version
- [ ] Product Sort dropdown
- [ ] ProductGallery grid/list view
- [ ] Pagination
- [ ] Product Card component
- [ ] ProductLabel (sale, new, v.v.)
- [ ] SearchBar + autocomplete (query `products` với search_term)
- [ ] SearchPage full
- [ ] FlashsaleProducts với countdown timer

---

### Phase 3: Product Detail (P0)
> Mục tiêu: User có thể xem và thêm sản phẩm vào giỏ

- [ ] ProductFullDetail layout
- [ ] ProductImageCarousel (lightbox support)
- [ ] Configurable product options (size, color, v.v.)
- [ ] QuantityStepper
- [ ] Add to cart → mutation `addProductsToCart`
- [ ] StockStatusMessage
- [ ] Reviews (list + add review mutation)
- [ ] ProductRecommendation (related, upsell)
- [ ] Wishlist toggle button
- [ ] Schema / SEO meta tags
- [ ] RichContent (PageBuilder content render)

---

### Phase 4: Cart + Checkout (P0)
> Mục tiêu: User có thể mua hàng end-to-end

**Cart:**
- [ ] MiniCart drawer
- [ ] CartPage full
- [ ] Update quantity, remove item
- [ ] Coupon/discount code
- [ ] Cart price summary

**Checkout (complex - nhiều custom features):**
- [ ] Address form (tỉnh/thành → quận/huyện → phường/xã cascade)
- [ ] City, District, Ward selector components
- [ ] Shipping method selection
- [ ] DeliveryTime picker
- [ ] Payment method selection
- [ ] IncludeVAT toggle
- [ ] MCard payment integration
- [ ] Order confirmation page
- [ ] Place order flow

---

### Phase 5: Account (P1)
> Mục tiêu: Đầy đủ tính năng account management

- [ ] My Account dashboard
- [ ] Account Info (name, DOB, gender)
- [ ] Update Email, Update Phone
- [ ] Change Password
- [ ] Address Book (CRUD)
- [ ] Order History + Order Detail
- [ ] Wishlist Page
- [ ] Login as Customer (admin feature)

---

### Phase 6: CMS + Content (P1)
> Mục tiêu: Tất cả CMS pages render đúng

- [ ] CMS Page renderer (query `cmsPage`)
- [ ] CmsBlock component (query `cmsBlocks`)
- [ ] ContentTypes / PageBuilder renderer
- [ ] RichContent HTML sanitizer
- [ ] Home page (CMS-driven)

---

### Phase 7: Blog + Extras (P2)
> Mục tiêu: Tính năng bổ sung

- [ ] Blog List, Detail, Search pages
- [ ] Blog Sidebar (categories, recent, search)
- [ ] StoreLocator với Goong Maps
- [ ] Contact Form
- [ ] FAQ Page
- [ ] QuickOrder
- [ ] AIChatbox (Freshchat tích hợp)
- [ ] SearchAI + Voice search (react-speech-recognition)
- [ ] ListPdf, UploadFile/Image fields
- [ ] AdvancedPopup

---

### Phase 8: PWA + Performance (P1, parallel)
> Chạy song song với các phase khác

- [ ] Service Worker (offline cache strategy)
- [ ] App manifest (icons, theme color)
- [ ] Install prompt
- [ ] Push notification setup
- [ ] Image optimization (WebP, lazy load)
- [ ] Code splitting (route-based)
- [ ] Prefetch / preload critical routes
- [ ] Core Web Vitals optimization
- [ ] Bundle analysis + tree shaking

---

### Phase 9: Testing + Launch
- [ ] Unit tests cho utils và hooks quan trọng
- [ ] Integration tests cho auth flow
- [ ] Integration tests cho checkout flow
- [ ] E2E smoke tests (Playwright)
- [ ] Performance audit (Lighthouse)
- [ ] Cross-browser testing
- [ ] Mobile testing (iOS Safari, Android Chrome)
- [ ] Production deploy Vercel
- [ ] Production deploy Cloudflare BFF
- [ ] DNS cutover

---

## 🤖 AI AGENT TEAM STRATEGY

Task này quá lớn cho 1 agent. Cần chia theo domain:

### Agent phân công (chạy song song)
```
Agent 0: Architect / Orchestrator
  - Duy trì plan, review code, resolve conflicts
  - Manage shared types, API contracts

Agent 1: Foundation + BFF
  - Monorepo setup, Vite config, BFF Cloudflare Worker
  - GraphQL client, TanStack Query setup

Agent 2: Auth + User
  - AuthModal, SignIn, CreateAccount, Account pages
  - Zustand auth store, token management

Agent 3: Catalog + Search
  - Category, ProductFullDetail, SearchPage
  - Filters, Sort, Pagination

Agent 4: Cart + Checkout
  - CartPage, MiniCart, CheckoutPage
  - Payment (MCard), Address cascade

Agent 5: CMS + Content
  - CMS renderer, PageBuilder, Blog, ContentTypes
  - RichContent, schema/SEO

Agent 6: UI Components
  - Design system: Button, Input, Modal, Dialog
  - Shared: Breadcrumbs, Pagination, Loading, Toast
```

### Shared contracts (Agent 0 define trước)
- TypeScript types cho tất cả Magento GQL entities
- GraphQL operation signatures
- API error handling pattern
- Component props conventions

---

## 🔗 TÍCH HỢP VỚI WORKFLOW CLAUDE.MD

### Logging
Mỗi phase hoàn thành → append vào `LIVE_LOG.md`:
```
[HH:MM] Phase X: [tên phase] — ✓ complete — next: Phase Y
```

### Progress tracking
Mỗi page/component done → update `PROGRESS.md` với template chuẩn.

### Blocking
Nếu blocked > 30 phút → ghi `BLOCKED.md`:
```
[2026-02-17 HH:MM] BLOCKED: [mô tả]
Phase: X | Component: Y
Tried: [những gì đã thử]
```

### Steering
User muốn thay đổi ưu tiên → ghi vào `STEERING.md`.
Agent đọc → execute → xóa.

---

## 📊 METRICS THÀNH CÔNG

- [ ] All 24 pages render đúng với data thật từ Magento
- [ ] Auth flow hoạt động (login, logout, register, reset password)
- [ ] Checkout flow end-to-end (add to cart → payment → confirmation)
- [ ] Lighthouse score: Performance ≥ 90, PWA ≥ 90
- [ ] TypeScript: 0 `any` types, strict mode
- [ ] Bundle size < 300KB gzipped (initial load)
- [ ] Offline mode: browse catalog khi mất mạng
- [ ] Mobile-first, responsive 320px → 1440px

---

## 🌐 EXTERNAL INTEGRATIONS CẦN MIGRATE

| Service | Purpose | Action |
|---------|---------|--------|
| Google reCAPTCHA | Form validation (login, register) | Giữ nguyên, dùng `react-google-recaptcha` |
| Google Analytics 4 | Analytics (ID: GA-M860NB9VH2) | Giữ `react-ga4`, fire events tương đương |
| Google Tag Manager | Container: GTM-KXH7R829 | Inject qua Vite `index.html` |
| Antsomi CDP | Customer data platform + SW tracking | Inject SDK, maintain event calls |
| Freshchat | Customer support chat | Giữ `react-freshchat`, wrap trong AIChatbox |
| Braintree | Payment gateway | Giữ `braintree-web-drop-in` |
| Goong Maps | Store locator bản đồ VN | Giữ `@goongmaps/goong-map-react` |
| Facebook Login | Social auth | Giữ `reactjs-social-login` |
| Google Login | Social auth | Giữ `reactjs-social-login` |
| react-speech-recognition | Voice search | Giữ nguyên |

**API Keys cần có (ghi BLOCKED.md nếu thiếu):**
- `VITE_GOONG_KEY` - Goong Maps
- `VITE_RECAPTCHA_SITE_KEY` - Google reCAPTCHA
- `VITE_GA4_ID` - GA4 Measurement ID
- `VITE_GTM_ID` - Google Tag Manager
- `VITE_MAGENTO_URL` - Backend GraphQL endpoint
- `VITE_AI_SEARCH_URL` + `VITE_AI_SEARCH_KEY` - AI search
- Freshchat token, Antsomi SDK keys

---

## 🌍 INTERNATIONALIZATION

**6 ngôn ngữ cần migrate từ source:**
| Locale | File source | Priority |
|--------|-------------|----------|
| vi-VN | `@theme/translate/vi-VN.json` + `i18n/vi_VN.json` | P0 - primary |
| en-US | `@theme/translate/en-US.json` + `i18n/en_US.json` | P0 |
| en-GB | `@theme/translate/en-GB.json` | P1 |
| th-TH | `@theme/translate/th-TH.json` | P1 |
| ko-KR | `@theme/translate/ko-KR.json` | P2 |
| zh-CN | `@theme/translate/zh-CN.json` | P2 |
| fr-FR | `@theme/translate/fr-FR.json` | P2 |

**Approach:** Merge tất cả strings từ source vào `apps/web/src/i18n/{locale}.json` dùng với `react-i18next`.

---

## ⚠️ RỦI RO & MITIGATION

| Rủi ro | Xác suất | Mitigation |
|--------|----------|------------|
| GQL schema khác với source | Cao | Test từng query với backend thật sớm |
| Business logic phức tạp (Checkout, MCard) | Cao | Read source code kỹ, test E2E sớm |
| i18n string thiếu | Trung bình | Export toàn bộ strings từ source i18n/ |
| CORS issues BFF | Trung bình | Cấu hình Cloudflare headers sớm |
| Magento auth token flow | Trung bình | Test token refresh, cookie/header forward |
| PageBuilder content types | Cao | Cần render toàn bộ content types từ source |
| Performance regression | Thấp | Bundle analysis sau mỗi phase |

---

## 📁 FILES QUAN TRỌNG CẦN REFER

```
pwacng-release-backup/pwacng-release/
├── src/
│   ├── @theme/BaseComponents/   # Toàn bộ components + queries
│   │   ├── CheckoutPage/        # Logic phức tạp nhất
│   │   ├── AuthModal/           # Auth flow
│   │   ├── ProductFullDetail/   # PDP logic
│   │   └── ...
│   └── drivers/                 # Venia drivers overrides
├── i18n/                        # i18n strings (migrate)
├── upward.yml                   # BFF routing rules → ref cho CF Worker
├── local-intercept.js           # Peregrine intercepts → business logic hints
└── lastCachedGraphQLSchema.json # GQL schema (QUAN TRỌNG - ref cho queries)
```

---

*Kế hoạch này là living document. Update khi có thay đổi về scope hoặc tech decisions.*
