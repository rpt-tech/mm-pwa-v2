# MIGRATION PLAN: PWA Studio → Modern Stack
> Tích hợp với workflow CLAUDE.md | Updated: 2026-02-18
> Last audit: 2026-02-18 — Source: 89 GQL files, 38 BaseComponents, 52 Override Components

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
│       │   │   ├── auth/       # Auth components
│       │   │   ├── checkout/   # Checkout components
│       │   │   ├── layout/     # Header, Footer, MainLayout
│       │   │   └── ...
│       │   ├── hooks/          # Shared hooks
│       │   ├── stores/         # Zustand stores
│       │   ├── queries/        # GQL query definitions
│       │   ├── lib/            # Config, clients, utils
│       │   ├── i18n/           # i18n translation files
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
  "ui": ["tailwindcss@3", "clsx", "tailwind-merge", "lucide-react"],
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

### Pages (Routes) — Full inventory từ source audit
| Page | Route | Priority | Source Component | Status |
|------|-------|----------|-----------------|--------|
| Home | `/` | P0 | ContentTypes + CmsBlock | ⏳ Stub only |
| Category / PLP | `/category/*` | P0 | Category | ✓ Done |
| Product Detail | `/product/*` | P0 | ProductFullDetail | ✓ Done (partial) |
| Search | `/search` | P0 | SearchPage | ✓ Done |
| Cart | `/cart` | P0 | CartPage | ✓ Done |
| Checkout | `/checkout` | P0 | CheckoutPage | 🚧 Core done, payment/delivery missing |
| Order Confirmation | `/checkout/confirmation` | P0 | OrderConfirmationPage | ❌ Missing |
| Sign In | `/sign-in` | P0 | SignInPage | ✓ Done |
| Create Account | `/create-account` | P0 | CreateAccountPage | ✓ Done |
| Forgot Password | `/forgot-password` | P0 | ForgotPasswordPage | ✓ Done |
| Confirm Password | `/confirm-password` | P0 | ConfirmPasword | ❌ Missing |
| My Account | `/account` | P1 | MyAccount | ✓ Done |
| Account Info | `/account/information` | P1 | AccountInformationPage | ✓ Done |
| Address Book | `/account/addresses` | P1 | AddressBookPage | 🚧 Components created, page pending |
| Order History | `/account/orders` | P1 | OrderHistoryPage | ❌ Missing |
| Order Detail | `/account/orders/:id` | P1 | OrderDetailPage | ❌ Missing |
| Wishlist | `/account/wishlist` | P1 | WishlistPage | ❌ Missing |
| Update Email | `/account/email` | P1 | UpdateCustomerEmail | ❌ Missing |
| Update Phone | `/account/phone` | P1 | UpdatePhoneNumber | ❌ Missing |
| CMS Pages | `/[cms-url]` | P1 | CMS | ⏳ Stub only |
| Error 404 | `*` | P0 | ErrorView | ✓ Done |
| Blog List | `/blog` | P2 | BlogList | ❌ Missing |
| Blog Detail | `/blog/:slug` | P2 | BlogDetailPage | ❌ Missing |
| Blog Search | `/blog/search` | P2 | BlogSearchPage | ❌ Missing |
| Store Locator | `/store-locator` | P2 | StoreLocator | ❌ Missing |
| Contact | `/contact` | P2 | Contact | ❌ Missing |
| FAQ | `/faq` | P2 | FaqPage | ❌ Missing |
| Quick Order | `/quick-order` | P2 | QuickOrder | ❌ Missing |
| Guest Order Track | `/guest-order` | P2 | GuestOrderDetail | ❌ Missing |

### Shared Components — Full inventory từ source audit

**P0 - Core layout:**
- ✓ Header, Footer, Navigation, MegaMenu, Breadcrumbs, LoadingIndicator
- ❌ Modal (dedicated), Dialog, Mask, ToastContainer

**P0 - Commerce:**
- ✓ AuthModal (SignIn + CreateAccount + ForgotPassword)
- ✓ MiniCart, CartPage, QuantityStepper
- 🚧 CheckoutPage (Address cascade done, Payment/Delivery/Confirmation missing)
- ✓ ProductFullDetail (basic), ProductImageCarousel, ProductOptions
- ✓ Category (filters, sort, pagination), FilterModal, FilterSidebar
- ✓ SearchBar + autocomplete
- ❌ ConfirmPassword page

**P0 - MM Business Logic (THIẾU TRONG PLAN CŨ):**
- ❌ AlcoholDialog + AlcoholCheckoutDialog (xác nhận tuổi cho sản phẩm rượu)
- ❌ DNR block/label (deal/promotion display trên PDP + Cart)
- ❌ StoreSwitcher + StoreLocation popup (chọn cửa hàng giao)
- ❌ Payment methods VN: Momo, VNPay, ZaloPay, COD
- ❌ DeliveryTime picker (chọn giờ giao)
- ❌ IncludeVAT toggle
- ❌ MCard payment integration
- ❌ OrderConfirmationPage (sau khi đặt hàng)
- ❌ EncryptPassword (backend có thể yêu cầu)

**P1 - Account:**
- ✓ AccountMenu/Sidebar, AccountInformationPage, DashboardPage
- 🚧 AddressBookPage (components created, page pending)
- ❌ OrderHistoryPage (list + detail + progress bar + delivery tracking)
- ❌ WishlistPage (multi-wishlist, rename, delete)
- ❌ UpdateCustomerEmail, UpdatePhoneNumber
- ❌ LoginAsCustomer (admin impersonate)
- ❌ Reorder from Order History

**P1 - Product extras:**
- ✓ ProductLabel, FlashsaleProducts, StockStatusMessage, Pagination, ProductSort
- ❌ Reviews (productReviews list, reviewForm, totalReviewsPercent)
- ❌ DescriptionTabs (product detail tabs)
- ❌ AdditionalAttributes (product specs table)
- ❌ RelatedUpsellProducts (UI component — query exists)
- ❌ SimilarProducts
- ❌ Wishlist toggle button on PDP
- ❌ SEO Schema / Head meta tags
- ❌ Price component (custom formatting with VAT)

**P1 - Search extras:**
- ❌ SearchPopular (popular search terms)
- ❌ SuggestCategory (category suggestions in search)
- ❌ LanguageSwitcher (functional — UI exists in header)

**P2 - Content & misc:**
- ❌ ContentTypes/PageBuilder renderers (11 types: Banner, Slider, Row, Column, ColumnGroup, ColumnLine, Html, Image, Text, Products/Carousel, FlashsaleProducts)
- ❌ CmsBlock fetcher/renderer
- ❌ RichContent HTML sanitizer
- ❌ ProductRecommendation ContentType
- ❌ Blog (full: List, Detail, Search, Sidebar — 4 GQL files)
- ❌ StoreLocator (Goong Maps)
- ❌ Contact Form
- ❌ FAQ Page
- ❌ QuickOrder (ListOrder, OrderSummary, QuickFormCreate)
- ❌ AIChatbox (Freshchat — 17 source files)
- ❌ SearchAI / SearchAIDialog / SearchMultiple
- ❌ VoiceTextField / VoiceMicField
- ❌ SocialLogin (Google/Facebook)
- ❌ MCardLogin
- ❌ ListPdf (PDF catalog)
- ❌ AdvancedPopup (popup campaigns)
- ❌ UploadFileField, UploadImageField

### Features đặc thù cần preserve (từ source audit)
- **AlcoholDialog** - xác nhận tuổi khi mua rượu (`is_alcohol` field) ← **THIẾU TRONG PLAN CŨ**
- **DNR products** - deal/promotion labels và blocks ← **THIẾU TRONG PLAN CŨ**
- **StoreSwitcher** - chọn cửa hàng giao hàng ← **THIẾU TRONG PLAN CŨ**
- **Payment methods VN** - Momo, VNPay, ZaloPay, COD ← **THIẾU TRONG PLAN CŨ**
- **OrderConfirmationPage** - trang xác nhận sau đặt hàng ← **THIẾU TRONG PLAN CŨ**
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
- **Reorder** - đặt lại đơn từ order history ← **THIẾU TRONG PLAN CŨ**
- **Guest Order tracking** - tra cứu đơn không cần đăng nhập ← **THIẾU TRONG PLAN CŨ**

---

## 📊 MIGRATION STATUS OVERVIEW

```
Phase 0: Foundation          ████████████████████ 100% ✓
Phase 1: Auth + Navigation   ████████████████░░░░  80% (SocialLogin, MCard, ConfirmPwd, LangSwitcher missing)
Phase 2: Catalog             ████████████████████  95% (SearchPopular, SuggestCategory missing)
Phase 3: Product Detail      ████████████████░░░░  75% (Reviews, Tabs, Alcohol, DNR, Wishlist btn missing)
Phase 4: Cart + Checkout     ████████████░░░░░░░░  60% (Payment VN, DeliveryTime, VAT, MCard, Confirmation missing)
Phase 5: Account             ██████░░░░░░░░░░░░░░  30% (OrderHistory, Wishlist, AddressBook, Email/Phone missing)
Phase 6: CMS + Content       ░░░░░░░░░░░░░░░░░░░░   0%
Phase 7: Blog + Extras       ░░░░░░░░░░░░░░░░░░░░   0%
Phase 8: PWA + Performance   ░░░░░░░░░░░░░░░░░░░░   0%
Phase 9: Testing + Launch    ░░░░░░░░░░░░░░░░░░░░   0%
```

---

## 🚀 PHASES

### Phase 0: Foundation (P0 - Critical Path) — ✓ DONE
> Mục tiêu: Có thể chạy dev server với routing cơ bản

**Tasks:**
- [x] Khởi tạo monorepo (pnpm workspaces)
- [x] Setup `apps/web` với Vite + React 18 + TypeScript
- [x] Cấu hình Tailwind CSS
- [x] Cấu hình React Router v6 với route structure
- [x] Setup TanStack Query (QueryClient, QueryProvider)
- [x] Setup Zustand (auth store, cart store, ui store)
- [x] Setup graphql-request client
- [x] Setup React Hook Form + Zod
- [x] Setup react-i18next (vi-VN, en-US)
- [x] Setup Vite PWA Plugin + Service Worker
- [x] Cấu hình path aliases (`@/`)
- [x] Setup `apps/bff` với Hono + Wrangler
- [x] BFF: GraphQL proxy route → Magento
- [x] Deploy BFF lên Cloudflare Workers

**Output:** ✓ Web app + BFF live — 263KB bundle

---

### Phase 1: Auth + Navigation (P0) — 80% Done
> Mục tiêu: User có thể login, browse site

**Auth flow — Done:**
- [x] AuthModal (slide: SignIn → CreateAccount → ForgotPassword)
- [x] SignIn với email/password → mutation `generateCustomerToken`
- [x] CreateAccount → mutation `createCustomer` + auto-login
- [x] ForgotPassword → mutation `requestPasswordResetEmail`
- [x] Token management trong Zustand (persist to cookie)
- [x] Auth guard HOC/hook

**Auth flow — TODO:**
- [ ] ConfirmPassword page → mutation `resetPassword` (reset link from email lands here)
- [ ] Social Login (Google, Facebook) → `reactjs-social-login` + GQL `socialLogin.gql.js`
- [ ] MCard Login → custom mutation `mCardLogin.gql.js`
- [ ] EncryptPassword hook (source: `@theme/Hooks/EncryptPassword/`)

**Navigation — Done:**
- [x] Header (logo, search, cart icon, account trigger, wishlist trigger)
- [x] MegaMenu (query `categoryList` cho mega menu tree)
- [x] Navigation sidebar (mobile)
- [x] Footer
- [x] Breadcrumbs (dynamic)

**Navigation — TODO:**
- [ ] LanguageSwitcher (functional — component exists but no store switching logic)
- [ ] StoreSwitcher / StoreLocation popup (chọn cửa hàng giao — GQL `storeLocation.gql.js`, `deliveryAddressDefault.gql.js`)
- [ ] AccountChip (show user name/avatar in header)

**Zustand stores — Done:**
- [x] `authStore` - user, token, isLoggedIn
- [x] `uiStore` - modals open/close, drawer state
- [x] `cartStore` - cart id, item count

---

### Phase 2: Catalog (P0) — 95% Done
> Mục tiêu: User có thể browse products

- [x] Category page - query `products` với filters, sort, pagination
- [x] Filter sidebar - aggregations từ product query
- [x] FilterModal - mobile version
- [x] Product Sort dropdown
- [x] ProductGallery grid/list view
- [x] Pagination
- [x] Product Card component
- [x] ProductLabel (sale, new, v.v.)
- [x] SearchBar + autocomplete
- [x] SearchPage full
- [x] FlashsaleProducts với countdown timer

**TODO:**
- [ ] SearchPopular — popular search terms (GQL `searchPopular.gql.js`)
- [ ] SuggestCategory — category suggestions in autocomplete (GQL `suggestCategory.gql.js`)

---

### Phase 3: Product Detail (P0) — 75% Done
> Mục tiêu: User có thể xem và thêm sản phẩm vào giỏ

**Done:**
- [x] ProductFullDetail layout
- [x] ProductImageCarousel (lightbox support)
- [x] Configurable product options (size, color swatches)
- [x] QuantityStepper
- [x] Add to cart → mutation `addProductsToCart`
- [x] StockStatusMessage
- [x] ProductLabel overlay on images

**TODO:**
- [ ] Reviews — list reviews + add review form (GQL `productDetailReviews.gql.js`, `createReviewMutation.gql.js`, `reviewRatingMetadata.gql.js`)
- [ ] TotalReviewsPercent — rating distribution chart
- [ ] DescriptionTabs — tabbed content (description, specs, reviews)
- [ ] AdditionalAttributes — product specs table
- [ ] RelatedUpsellProducts UI component (query exists, UI display missing)
- [ ] SimilarProducts component
- [ ] DNR products/labels — deal/promotion display (GQL `dnrProducts.gql.js`, source: `@theme/BaseComponents/Dnr/`)
- [ ] AlcoholDialog — age confirmation for alcohol products (source: `@theme/BaseComponents/Product/AlcoholDialog/`)
- [ ] AlcoholCheckoutDialog — alcohol warning at checkout
- [ ] Wishlist toggle button on PDP
- [ ] Schema / SEO meta tags (source: `override/Components/Head/`)
- [ ] Price component — custom formatting with VAT logic
- [ ] RichContent — PageBuilder content render in description

---

### Phase 4: Cart + Checkout (P0) — 60% Done
> Mục tiêu: User có thể mua hàng end-to-end

**Cart — Done:**
- [x] MiniCart drawer
- [x] CartPage full layout
- [x] Update quantity, remove item
- [x] Coupon/discount code
- [x] Cart price summary (basic)
- [x] Cross-sell products query

**Cart — TODO:**
- [ ] Cart item comment/note field (source: `override/Components/CartPage/noteField.js`)
- [ ] PriceSummary sub-components — discount detail, shipping summary (source: `override/Talons/CartPage/PriceSummary/`)
- [ ] DNR products in cart — deal labels, same-promotion grouping (source: `override/Components/CartPage/ProductListing/dealDnr.js`, `samePromotion.js`)
- [ ] Check price change flow (query exists in cart.ts)

**Checkout — Done:**
- [x] Address form with Vietnam cascade (city → district → ward)
- [x] GET_CITIES, GET_DISTRICTS, GET_WARDS queries
- [x] VietnamLocationCascade component
- [x] Basic shipping/payment step UI
- [x] Place order mutation

**Checkout — TODO (CRITICAL FOR MVP):**
- [ ] **Payment methods VN** — Momo, VNPay, ZaloPay, COD (source: `@theme/BaseComponents/CheckoutPage/PaymentInformation/`)
  - [ ] cashOnDelivery payment component
  - [ ] Momo payment redirect
  - [ ] VNPay payment redirect
  - [ ] ZaloPay payment redirect
  - [ ] Payment method GQL queries (`paymentMethod.gql.js`, `paymentMethods.gql.js`)
  - [ ] Payment redirect handling (`pay_url` from `orderV2` response)
- [ ] **DeliveryTime picker** — chọn giờ giao hàng (GQL `deliveryTime.gql.js`, source: `@theme/Talons/DeliveryTime/`)
- [ ] **IncludeVAT toggle** — hiển thị giá VAT (GQL `includeVat.gql.js`, source: `@theme/Talons/IncludeVat/`)
- [ ] **MCard payment integration** — loyalty card (GQL `useMCard.gql.js`, source: `@theme/Talons/MCard/`)
- [ ] **OrderConfirmationPage** — trang xác nhận đơn hàng sau khi đặt (GQL `orderConfirmationPage.gql.js`)
- [ ] **StoreSwitcher trong checkout** — chọn cửa hàng pickup (source: `@theme/BaseComponents/ProductFullDetail/StoreSwitcher/`)
- [ ] Shipping method selection (proper UI with delivery time integration)
- [ ] Address book selection for logged-in users (GQL `GET_CUSTOMER_ADDRESSES`)
- [ ] Guest checkout flow with email
- [ ] AlcoholCheckoutDialog — alcohol warning during checkout
- [ ] Checkout dialog/confirmation modal before place order

---

### Phase 5: Account (P1) — 30% Done
> Mục tiêu: Đầy đủ tính năng account management

**Done:**
- [x] My Account dashboard (info cards, recent orders, loyalty points)
- [x] MyAccountLayout with sidebar navigation
- [x] AccountSidebar with menu and sign out
- [x] AccountInformationPage (edit name, email, phone, customer_no, VAT fields, password change)
- [x] Account GraphQL queries (account.ts)

**TODO:**
- [ ] **AddressBookPage** — CRUD addresses with Vietnam cascade
  - [ ] Address list view (AddressCard component exists)
  - [ ] Add/Edit address dialog (AddEditAddressDialog component exists)
  - [ ] Delete address confirmation
  - [ ] Set default billing/shipping
  - [ ] Vietnam cascade integration (reuse from checkout)
  - [ ] GQL: `addressBookPage.gql.js`, `addressBookFragments.gql.js`
- [ ] **OrderHistoryPage** — order list with filtering
  - [ ] Order list with pagination
  - [ ] Order status filter (GQL `availableStatus.gql.js`)
  - [ ] OrderRow component with status badge
  - [ ] OrderDetailPage — full order breakdown
  - [ ] OrderProgressBar — visual order status
  - [ ] DeliveryProgressBar — delivery tracking
  - [ ] DeliveryTracking — shipment tracking details
  - [ ] OrderItems — item list with images
  - [ ] OrderTotal — price breakdown
  - [ ] Reorder button (GQL `reorder.gql.js`)
  - [ ] GQL: `orderHistoryPage.gql.js`, `orderDetailPage.gql.js`
- [ ] **WishlistPage** — wishlist management
  - [ ] Wishlist items grid
  - [ ] Add to cart from wishlist
  - [ ] Remove from wishlist
  - [ ] Create multiple wishlists (EE feature)
  - [ ] Rename/delete wishlist
  - [ ] WishlistDialog — add-to-wishlist modal
  - [ ] GQL: `wishlist.gql.js`, `wishlistItem.gql.js`, `wishlistPage.gql.js`, `createWishlist.gql.js`
- [ ] **UpdateCustomerEmail** page (GQL `updateCustomerEmail.gql.js`)
- [ ] **UpdatePhoneNumber** page (source: `@theme/BaseComponents/UpdatePhoneNumber/`)
- [ ] **Change Password** — standalone page (currently embedded in AccountInfo)
- [ ] **LoginAsCustomer** — admin impersonate (GQL `loginAsCustomer.gql.js`)
- [ ] **ResetPassword** — password reset from account (source: `override/Components/MyAccount/ResetPassword/`)
- [ ] **Guest Order tracking** — track order without login (source: `override/Components/OrderHistoryPage/guestOrderDetail.js`, `orderGuest.js`, GQL `orderGuest.gql.js`)
- [ ] **Dashboard recent orders** — functional order display (currently placeholder)

---

### Phase 6: CMS + Content (P1) — 0% Done
> Mục tiêu: Tất cả CMS pages render đúng, Home page hoạt động

**CRITICAL: Home page phụ thuộc ContentTypes — cần làm sớm**

- [ ] CMS Page renderer (query `cmsPage`)
- [ ] CmsBlock component (query `cmsBlocks`) — used in Footer, Home, many places
- [ ] RichContent HTML sanitizer
- [ ] **ContentTypes / PageBuilder renderers (11 types từ source):**
  - [ ] Banner (source: `override/ContentTypes/Banner/`)
  - [ ] Slider (source: `override/ContentTypes/Slider/`)
  - [ ] Row (source: `override/ContentTypes/Row/`)
  - [ ] ColumnGroup (source: `override/ContentTypes/ColumnGroup/`)
  - [ ] ColumnLine (source: `override/ContentTypes/ColumnLine/`)
  - [ ] Html (source: `override/ContentTypes/Html/`)
  - [ ] Image (source: `override/ContentTypes/Image/`)
  - [ ] Text (source: `override/ContentTypes/Text/`)
  - [ ] Products/Carousel (source: `override/ContentTypes/Products/`) — with GQL
  - [ ] FlashsaleProducts CT (source: `override/ContentTypes/FlashsaleProducts/`) — GQL `flashsaleProducts.gql.js`
  - [ ] ProductRecommendation CT (source: `override/ContentTypes/ProductRecommendation/`) — GQL `productRecommendation.gql.js`
- [ ] Home page — CMS-driven với ContentTypes rendering
- [ ] MagentoRoute — URL resolver cho dynamic CMS pages

---

### Phase 7: Blog + Extras (P2) — 0% Done
> Mục tiêu: Tính năng bổ sung

**Blog (full feature — 4 GQL files):**
- [ ] Blog List page (GQL `blog.gql.js`)
- [ ] Blog Detail page (GQL `blogDetail.gql.js`)
- [ ] Blog Search page (GQL `blogSearchPage.gql.js`)
- [ ] Blog Sidebar — categories, recent posts, search (GQL `sidebar.gql.js`)

**Store & Contact:**
- [ ] StoreLocator với Goong Maps (GQL `storeLocator.gql.js`, `sourceType.gql.js`)
- [ ] Contact Form (GQL `contactForm.gql.js`)
- [ ] FAQ Page (GQL `faqPage.gql.js`)

**Commerce extras:**
- [ ] QuickOrder — đặt hàng nhanh theo SKU (GQL `quickOrder.gql.js`, `updateCartItems.gql.js`)
- [ ] ListPdf — PDF catalog list (GQL `listPdf.gql.js`, `pdfCategory.gql.js`)

**AI & Search:**
- [ ] AIChatbox (Freshchat integration — 17 source files)
- [ ] SearchAI / SearchAIDialog / SearchMultiple
- [ ] VoiceTextField / VoiceMicField (react-speech-recognition)

**Popups & Misc:**
- [ ] AdvancedPopup — popup campaigns (GQL `advancedPopup.gql.js`)
- [ ] UploadFileField, UploadImageField

---

### Phase 8: PWA + Performance (P1, parallel) — 0% Done
> Chạy song song với các phase khác

- [ ] Service Worker (offline cache strategy)
- [ ] App manifest (icons, theme color)
- [ ] Install prompt
- [ ] Push notification setup
- [ ] Image optimization (WebP, lazy load)
- [ ] Code splitting (route-based lazy loading)
- [ ] Prefetch / preload critical routes
- [ ] Core Web Vitals optimization
- [ ] Bundle analysis + tree shaking (current: 612KB, target: < 300KB gzip)

---

### Phase 9: Testing + Launch — 0% Done
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

## 📊 GraphQL QUERIES — Full Inventory

### Migrated (7 files, ~45 queries)
| File | Queries | Status |
|------|---------|--------|
| `queries/navigation.ts` | categoryList, megaMenu | ✓ |
| `queries/auth.ts` | signIn, createAccount, forgotPassword, getCustomer | ✓ |
| `queries/catalog.ts` | products, category, filters, search, autocomplete, flashsale | ✓ |
| `queries/product.ts` | productDetail, addToCart, reviews, related/upsell | ✓ |
| `queries/cart.ts` | miniCart, cartPage, create/update/remove, coupon, comment, crossSell | ✓ |
| `queries/checkout.ts` | checkout details, address, shipping, payment, placeOrder, cities/districts/wards | ✓ |
| `queries/account.ts` | customer CRUD, orders, wishlist, address CRUD | ✓ |
| `queries/location.ts` | GET_CITIES, GET_DISTRICTS, GET_WARDS | ✓ |

### NOT Migrated (~35 GQL files from source)
| GQL File | Feature | Priority |
|----------|---------|----------|
| `deliveryTime.gql.js` | Delivery time slots | P0 |
| `includeVat.gql.js` | VAT toggle | P0 |
| `useMCard.gql.js` | MCard checkout payment | P0 |
| `orderConfirmationPage.gql.js` | Order confirmation | P0 |
| `paymentMethod.gql.js` | Payment method details | P0 |
| `paymentMethods.gql.js` | Available payment methods | P0 |
| `socialLogin.gql.js` | Google/Facebook auth | P1 |
| `mCardLogin.gql.js` | MCard loyalty login | P1 |
| `loginAsCustomer.gql.js` | Admin impersonate | P1 |
| `updateCustomerEmail.gql.js` | Email update | P1 |
| `storeLocation.gql.js` | Store info popup | P1 |
| `deliveryAddressDefault.gql.js` | Default delivery address | P1 |
| `storeSwitcher.gql.js` | Store switching | P1 |
| `addressBookPage.gql.js` | Address book CRUD | P1 |
| `addressBookFragments.gql.js` | Address fragments | P1 |
| `orderHistoryPage.gql.js` | Order history list | P1 |
| `orderDetailPage.gql.js` | Order detail | P1 |
| `availableStatus.gql.js` | Order status list | P1 |
| `reorder.gql.js` | Reorder from history | P1 |
| `orderGuest.gql.js` | Guest order tracking | P1 |
| `wishlist.gql.js` | Wishlist CRUD | P1 |
| `wishlistItem.gql.js` | Wishlist items | P1 |
| `wishlistPage.gql.js` | Wishlist page | P1 |
| `wishlistDialog.gql.js` | Wishlist dialog | P1 |
| `createWishlist.gql.js` | Create new wishlist | P1 |
| `wishlistItemFragments.gql.js` | Wishlist item fragment | P1 |
| `searchPopular.gql.js` | Popular search terms | P1 |
| `suggestCategory.gql.js` | Category suggestions | P1 |
| `productDetailReviews.gql.js` | Review list | P1 |
| `productDetailReviewsDistribution.gql.js` | Review distribution | P1 |
| `createReviewMutation.gql.js` | Add review | P1 |
| `reviewRatingMetadata.gql.js` | Rating metadata | P1 |
| `dnrProducts.gql.js` | DNR/promotion products | P1 |
| `blog.gql.js` | Blog list | P2 |
| `blogDetail.gql.js` | Blog detail | P2 |
| `blogSearchPage.gql.js` | Blog search | P2 |
| `sidebar.gql.js` | Blog sidebar | P2 |
| `storeLocator.gql.js` | Store locator | P2 |
| `contactForm.gql.js` | Contact form | P2 |
| `faqPage.gql.js` | FAQ page | P2 |
| `quickOrder.gql.js` | Quick order | P2 |
| `updateCartItems.gql.js` | Quick order cart | P2 |
| `listPdf.gql.js` | PDF catalog | P2 |
| `pdfCategory.gql.js` | PDF categories | P2 |
| `advancedPopup.gql.js` | Popup campaigns | P2 |
| `flashsaleProducts.gql.js` (CT) | Flashsale content type | P2 |
| `productRecommendation.gql.js` (CT) | Product recommendation CT | P2 |
| `log.gql.js` | App logging | P2 |
| `useUserAgentCheck.gql.js` | Device detection | P2 |
| `categoryContent.gql.js` (Root) | Category URL resolver | P2 |

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
  - Payment (MCard, Momo, VNPay, ZaloPay, COD), Address cascade

Agent 5: CMS + Content
  - CMS renderer, PageBuilder (11 ContentTypes), Blog
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

- [ ] All 27 pages render đúng với data thật từ Magento (was 24, now 27 after audit)
- [ ] Auth flow hoạt động (login, logout, register, reset password, social login)
- [ ] Checkout flow end-to-end (add to cart → payment VN → confirmation)
- [ ] All VN payment methods work (COD, Momo, VNPay, ZaloPay)
- [ ] Lighthouse score: Performance ≥ 90, PWA ≥ 90
- [ ] TypeScript: 0 `any` types, strict mode
- [ ] Bundle size < 300KB gzipped (initial load)
- [ ] Offline mode: browse catalog khi mất mạng
- [ ] Mobile-first, responsive 320px → 1440px
- [ ] AlcoholDialog works for is_alcohol products
- [ ] Vietnam location cascade works in checkout + address book

---

## 🌐 EXTERNAL INTEGRATIONS CẦN MIGRATE

| Service | Purpose | Action | Status |
|---------|---------|--------|--------|
| Google reCAPTCHA | Form validation (login, register) | `react-google-recaptcha` | ❌ |
| Google Analytics 4 | Analytics (ID: GA-M860NB9VH2) | `react-ga4` | ❌ |
| Google Tag Manager | Container: GTM-KXH7R829 | Inject qua `index.html` | ❌ |
| Antsomi CDP | Customer data platform + SW tracking | Inject SDK | ❌ |
| Freshchat | Customer support chat | `react-freshchat` in AIChatbox | ❌ |
| Braintree | Payment gateway | `braintree-web-drop-in` | ❌ |
| Goong Maps | Store locator bản đồ VN | `@goongmaps/goong-map-react` | ❌ |
| Facebook Login | Social auth | `reactjs-social-login` | ❌ |
| Google Login | Social auth | `reactjs-social-login` | ❌ |
| react-speech-recognition | Voice search | Giữ nguyên | ❌ |
| Momo Payment | VN payment | Redirect-based | ❌ |
| VNPay | VN payment | Redirect-based | ❌ |
| ZaloPay | VN payment | Redirect-based | ❌ |

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

**7 ngôn ngữ cần migrate từ source:**
| Locale | File source | Priority | Status |
|--------|-------------|----------|--------|
| vi-VN | `@theme/translate/vi-VN.json` + `i18n/vi_VN.json` | P0 - primary | 🚧 Partial |
| en-US | `@theme/translate/en-US.json` + `i18n/en_US.json` | P0 | 🚧 Partial |
| en-GB | `@theme/translate/en-GB.json` | P1 | ❌ |
| th-TH | `@theme/translate/th-TH.json` | P1 | ❌ |
| ko-KR | `@theme/translate/ko-KR.json` | P2 | ❌ |
| zh-CN | `@theme/translate/zh-CN.json` | P2 | ❌ |
| fr-FR | `@theme/translate/fr-FR.json` | P2 | ❌ |

**Approach:** Merge tất cả strings từ source vào `apps/web/src/i18n/{locale}.json` dùng với `react-i18next`.

---

## ⚠️ RỦI RO & MITIGATION

| Rủi ro | Xác suất | Mitigation |
|--------|----------|------------|
| GQL schema khác với source | Cao | Test từng query với backend thật sớm |
| Business logic phức tạp (Checkout, MCard) | Cao | Read source code kỹ, test E2E sớm |
| Payment redirect flow (Momo/VNPay/ZaloPay) | Cao | Test với sandbox accounts sớm |
| AlcoholDialog compliance | Trung bình | Implement sớm, test với is_alcohol products |
| i18n string thiếu | Trung bình | Export toàn bộ strings từ source i18n/ |
| CORS issues BFF | Trung bình | Cấu hình Cloudflare headers sớm |
| Magento auth token flow | Trung bình | Test token refresh, cookie/header forward |
| PageBuilder content types (11 types) | Cao | Cần render toàn bộ content types từ source |
| Home page blocked by CMS | Cao | Prioritize Phase 6 CMS earlier |
| Performance regression | Trung bình | Bundle 612KB → target 300KB, needs aggressive splitting |
| DNR/promotion logic complexity | Trung bình | Copy business logic 1:1 from source |

---

## 📁 FILES QUAN TRỌNG CẦN REFER

```
pwacng-release-backup/pwacng-release/
├── src/
│   ├── @theme/
│   │   ├── BaseComponents/        # 38 component directories
│   │   │   ├── CheckoutPage/      # Payment methods, DeliveryTime, IncludeVAT, MCard
│   │   │   ├── Product/           # AlcoholDialog, ProductFrame
│   │   │   ├── City/              # City selector + GQL
│   │   │   ├── District/          # District selector + GQL
│   │   │   ├── Ward/              # Ward selector + GQL
│   │   │   ├── Dnr/               # Deal/promotion component
│   │   │   ├── AIChatbox/         # 17 files, Freshchat integration
│   │   │   ├── SearchBar/         # SearchAI, VoiceMic, SearchPopular
│   │   │   └── ...
│   │   ├── Talons/                # 18 custom hook directories
│   │   │   ├── DeliveryTime/      # useDeliveryTime + GQL
│   │   │   ├── IncludeVat/        # useIncludeVat + GQL
│   │   │   ├── MCard/             # useMCard + GQL
│   │   │   ├── SocialLogin/       # useSocialLogin + GQL
│   │   │   └── ...
│   │   └── Hooks/                 # 5 shared hook directories
│   │       ├── EncryptPassword/   # useEncryptPassword
│   │       └── ...
│   └── override/
│       ├── Components/            # 52 override directories
│       │   ├── CheckoutPage/      # Full checkout: AddressBook, PaymentInfo, ShippingInfo, OrderSummary, OrderConfirmation
│       │   ├── OrderHistoryPage/  # Order list, detail, progress bars, tracking
│       │   ├── WishlistPage/      # Multi-wishlist, items management
│       │   ├── CartPage/          # PriceSummary, ProductListing with DNR
│       │   └── ...
│       ├── ContentTypes/          # 11 PageBuilder renderers
│       └── Talons/                # Override hooks
├── i18n/                          # i18n strings (migrate)
├── upward.yml                     # BFF routing rules → ref cho CF Worker
├── local-intercept.js             # Peregrine intercepts → business logic hints
└── lastCachedGraphQLSchema.json   # GQL schema (QUAN TRỌNG - ref cho queries)
```

---

## 🐛 CRITICAL BUGS IN CURRENT CODE (Audit 2026-02-18)

> Phải fix TRƯỚC khi tiếp tục implement features mới

### CRITICAL (5 bugs — app không hoạt động đúng)

| # | File | Bug | Impact |
|---|------|-----|--------|
| 1 | `queries/cart.ts:1` | `import { gql } from '@apollo/client'` thay vì `graphql-request` | Cart page crash — `gql` tạo `DocumentNode` thay vì string |
| 2 | `stores/cartStore.ts:89` | `fetchCart` chỉ `console.log` — placeholder | Cart count/items không bao giờ update sau add-to-cart |
| 3 | 7 files | Hardcode `GRAPHQL_ENDPOINT` bypass `gqlClient` | Auth token không gửi — checkout/cart fail cho logged-in users |
| 4 | `CheckoutPage.tsx:267` | Auto-select shipping dùng wrong query key `['cartDetails']` | `getQueryData` luôn `undefined` → shipping không set → place order fail |
| 5 | `CategoryPage.tsx:18` + `ProductPage.tsx:18` | `useParams` mismatch with wildcard `/*` routes | Params luôn `undefined` → Category và Product page trắng |

**Files hardcode GRAPHQL_ENDPOINT (bug #3):** CheckoutPage, CartPage, SearchPage, ProductPage, MiniCart, FlashsaleProducts, Header — tất cả phải chuyển sang dùng `gqlClient` từ `lib/graphql-client.ts`

### HIGH (20 bugs)

| # | File:Line | Bug |
|---|-----------|-----|
| 6 | `Header.tsx:306` | Cart count badge hardcode `0` |
| 7 | `Header.tsx:262` | Account link luôn "Sign In" kể cả khi đã login |
| 8 | `Header.tsx:338` | Language switcher không có `onChange` |
| 9 | `MiniCart.tsx:232` | "View cart"/"Checkout" buttons chỉ close drawer, không navigate |
| 10 | `ProductPage.tsx:191` | Discount badge dùng `amount_off` thay vì `percent_off` |
| 11 | `ProductGrid.tsx:69` | Product links dùng `/product/` prefix sai format |
| 12 | `VietnamLocationCascade.tsx:60` | Wards fetch theo city thay vì district |
| 13 | `CheckoutPage.tsx:241` | `city` field gửi code thay vì name |
| 14 | `CheckoutPage.tsx:244` | Thiếu `district_code` trong shipping custom_attributes |
| 15 | `CheckoutPage.tsx:203` | Postcode hardcode `700000` (HCMC) cho mọi city |
| 16 | `AddressBookPage.tsx:121` | `lastname` missing trong address payload |
| 17 | `AddEditAddressDialog.tsx:163` | `districtCode` luôn empty khi edit |
| 18 | `OrderHistoryPage.tsx:173` | Route `/account/orders/:id` không tồn tại |
| 19 | `WishlistPage.tsx:51` | Wrong query key invalidation `['cart']` |
| 20 | `CategoryPage.tsx:326` | `dangerouslySetInnerHTML` không sanitize — XSS risk |
| 21 | `AccountInformationPage.tsx:169` | Dùng native `alert()` thay vì toast |
| 22 | `AccountInformationPage.tsx:160` | Password field dual-use gây unintended password change |
| 23 | `WishlistPage.tsx:106` | Product URLs dùng `/product/` prefix sai |
| 24 | `OrderHistoryPage.tsx:12` | Pagination non-functional (page luôn 1) |
| 25 | `DashboardPage.tsx:69` | Back button mobile là no-op |

### MEDIUM (15 bugs)

| # | File | Bug |
|---|------|-----|
| 26 | `graphql-client.ts:18` | `setAuthToken` override cookie expiry |
| 27 | `useMediaQuery.ts:5` | SSR-unsafe, layout flicker |
| 28 | `SignIn.tsx`, `CreateAccount.tsx`, `ForgotPassword.tsx` | Hardcoded English, no i18n |
| 29 | `ProductPage.tsx:225,233` | `dangerouslySetInnerHTML` XSS risk |
| 30 | `ProductImageCarousel.tsx:37` | Hardcoded image base URL |
| 31 | `AddressBookPage.tsx:158` | Pagination off-by-one |
| 32 | `DashboardPage.tsx:62` | `loyalty_points` always 0 (not in GQL) |
| 33 | `AddEditAddressDialog.tsx:163` | `districtCode` always empty on edit |
| 34 | `CheckoutPage.tsx:451` | Error message discards backend details |
| 35 | `VietnamLocationCascade.tsx:181` | Ward disabled depends on city not district |
| 36 | `SearchPage.tsx:92` | Sort split on `_` is fragile |
| 37 | `StockStatusMessage.tsx:16` | Hardcoded Vietnamese, no i18n |
| 38 | `OrderHistoryPage.tsx:125` | Order thumbnails empty placeholder |
| 39 | `checkout.ts:538` | Duplicate old-format location queries conflict with `location.ts` |
| 40 | `useAuth.ts:8` | `initializeAuth` called twice on startup |

---

## 🔍 GQL QUERY FIELD-LEVEL MISMATCHES (Migrated but incorrect)

> Queries đã migrate nhưng thiếu fields hoặc sai structure so với source

### cart.ts
- **CRITICAL:** Mutation sai tên `addCommentToCartItem` → phải là `updateCommentOnCartItem` + `removeCommentFromCartItem`
- Cross-sell products thiếu `allow_pickup`, `unit_ecom`, `art_no`, `rating_summary`, `product_label`, `categories`
- `REMOVE_ITEM_FROM_CART` response thiếu price summary fields

### checkout.ts
- **CRITICAL:** `CHECKOUT_PAGE_FRAGMENT` thiếu `delivery_date { date, time_interval_id, comment, from, to }` và `vat_address { customer_vat_id, company_name, company_vat_number, company_address }`
- **CRITICAL:** `SET_SHIPPING_METHOD` thiếu `$deliveryDate: DeliveryDateInput` và `$pickupDate: PickupDateInput` inputs
- **CRITICAL:** `SET_BILLING_ADDRESS` thiếu `city_code` và `ward_code` trong address input
- **CRITICAL:** Duplicate location queries (old API) conflict với `location.ts` (correct API) — phải xóa từ checkout.ts
- Thiếu `GET_PAYMENT_INFORMATION` query hoàn toàn
- Thiếu `GET_PICKUP_LOCATIONS` query
- `shipping_addresses` thiếu `customer_address_id`, `district`, `district_code`, `is_new_administrative`, `pickup_location_code`
- `available_payment_methods` thiếu `note` và `available` fields
- `ITEMS_REVIEW_FRAGMENT` thiếu `product.description.html`

### account.ts
- **CRITICAL:** `GET_CUSTOMER_ORDERS` thiếu: `status_code`, `delivery_information`, `pickup_date_order`, `pickup_location_order`, `vat_information`, product fields (`unit_ecom`, `ecom_name`, `is_alcohol`, `thumbnail`, `dnr_price`), `pay_url`, `base_total_after_discount`
- Thiếu `GET_DELIVERY_DETAIL` (delivery tracking query: `getDeliveryTracking`)
- Thiếu dashboard query với `loyalty_points`, `addressesV2`, recent orders
- `GET_CUSTOMER_ADDRESSES_PAGINATED` thiếu `countries { id, full_name_locale }`

### product.ts
- `GET_RELATED_UPSELL_PRODUCTS` dùng `url_key` filter thay vì `sku` filter (source dùng sku)
- Related/upsell products thiếu `mm_product_type`, `art_no`, `allow_pickup`, `product_label`, `dnr_price_search_page`, `categories`, `rating_summary`
- Thiếu `GET_SEARCH_CONFIG_QUERY` (autocomplete config from storeConfig)

### catalog.ts
- Thiếu `GET_PRODUCT_FILTERS_BY_SEARCH` (chỉ có by-category variant)

### auth.ts
- `MERGE_CARTS_MUTATION` thiếu `...CheckoutPageFragment` spread (cache không primed)

---

## 🏗️ MM-SPECIFIC BUSINESS LOGIC — THIẾU HOÀN TOÀN

> Phát hiện từ deep-dive source code. Không có trong plan cũ.

### Checkout Logic (CRITICAL cho MVP)

| # | Feature | Source File | GQL Needed | Priority |
|---|---------|------------|------------|----------|
| 1 | **Store-address validation** trước placeOrder | `useCheckoutPage.js:398-447` | `storeView(street, city, ward, language, website)` | CRITICAL |
| 2 | **Delivery time picker** (date + time interval) | `DeliveryTime/deliveryTime.js` | `getDeliveryDateConfiguration`, `getTimeInterval` | CRITICAL |
| 3 | **VAT invoice export** (company name, VAT number, address) | `IncludeVAT/includeVat.js` | `setVatInformationOnCart` | HIGH (legal) |
| 4 | **MCard loyalty number** (13/16 digit) | `Mcard/mCard.js` | `setCustomerNoOnCart` | HIGH |
| 5 | **Call before delivery** checkbox | `IncludeVAT/includeVat.js` | `setCallBeforeDeliveryOnCart` | MEDIUM |
| 6 | **Price change detection** | `useCartPage.js`, `useShippingInformation.js` | `CheckPriceChange(cart_id)` | MEDIUM |
| 7 | **Order confirmation page** (payment result + chatbot) | `OrderConfirmationPage/` | `paymentResult(input: { response_params })` | HIGH |
| 8 | **Chatbot auto-step** (`?step=2` URL param) | `useCheckoutPage.js:363-379` | N/A (client logic) | MEDIUM |
| 9 | **Guest address persistence** (sessionStorage) | `useGuestForm.js:35-53` | N/A (client logic) | LOW |

### Cart Logic

| # | Feature | Source File | GQL Needed | Priority |
|---|---------|------------|------------|----------|
| 10 | **Deal/DNR companion products** | `dealDnrProducts.js` | `getGreatDealCartItem(cart_id, cart_item_id)` | MEDIUM |
| 11 | **Same promotion products** drawer | `samePromotionDnrProducts.js` | Uses `dnr_price.event_id` | MEDIUM |
| 12 | **Remove all cart items** button | `cartPage.gql.js` | `removeAllCartItems` (already in cart.ts) | LOW |

### Product Logic

| # | Feature | Source File | GQL Needed | Priority |
|---|---------|------------|------------|----------|
| 13 | **Alcohol age verification dialog** | `Product/alcoholDialog.js` | Check `is_alcohol` field | HIGH (legal) |
| 14 | **Alcohol checkout dialog** | `Product/alcoholCheckoutDialog.js` | Check cart items `is_alcohol` | HIGH (legal) |
| 15 | **ecom_name \|\| name** display pattern | Throughout source | N/A (UI pattern) | MEDIUM |

### Auth Logic

| # | Feature | Source File | GQL Needed | Priority |
|---|---------|------------|------------|----------|
| 16 | **Password encrypt for Remember Me** | `Hooks/EncryptPassword/` | N/A (CryptoJS AES) | LOW |
| 17 | **Social Login** (Google/Facebook) | `SocialLogin/socialLogin.js` | `socialLogin(input: { provider, token })` | MEDIUM |
| 18 | **Location-based store switching at login** | `useSignIn.js:180-212` | Uses `location_user` from login response | MEDIUM |

### Store/Location Logic

| # | Feature | Source File | GQL Needed | Priority |
|---|---------|------------|------------|----------|
| 19 | **locationUser by GPS** | `storeLocation.gql.js` | `locationUser(lat, long, language, website)` | LOW |
| 20 | **removeItemNotVisibleFromCart** on store switch | `storeLocation.gql.js` | `removeItemNotVisibleFromCart(cart_id)` | MEDIUM |
| 21 | **addressDefault** query | `deliveryAddressDefault.gql.js` | `addressDefault { city_code, city_name, ward_code, ward_name }` | LOW |

### Analytics (Major Gap)

| # | Feature | Description | Priority |
|---|---------|-------------|----------|
| 22 | **CDP tracking** (`window.web_event.track`) | view_cart, checkout, purchase, sign_in events | MEDIUM |
| 23 | **ReactGA4 event tracking** | All commerce events | MEDIUM |
| 24 | **Antsomi SDK** | Customer data platform | LOW |

---

## 🎯 RECOMMENDED NEXT PRIORITIES

Dựa trên audit, thứ tự ưu tiên đề xuất:

### Priority 0: Fix Critical Bugs (NGAY LẬP TỨC)
- Fix 5 critical bugs (cart.ts import, fetchCart stub, hardcoded endpoint, route params, query keys)
- Fix GQL query mismatches (checkout.ts delivery_date, billing city_code, duplicate location queries)

### Priority 1: Complete Checkout (MVP Critical)
- Payment methods VN (Momo, VNPay, ZaloPay, COD)
- DeliveryTime picker + GQL
- OrderConfirmationPage
- Store-address validation (storeView query)
- VAT invoice + Call before delivery
- MCard loyalty number

### Priority 2: CMS + Home Page
- ContentTypes renderers (11 types) — Home page blocked by this
- CmsBlock fetcher

### Priority 3: Product Detail Completion
- Reviews, DNR, AlcoholDialog (legal)
- DescriptionTabs, AdditionalAttributes

### Priority 4: Account Completion
- OrderHistory + OrderDetail + delivery tracking
- Wishlist, AddressBook CRUD
- ConfirmPassword page

### Priority 5: Auth Completion
- SocialLogin (Google/Facebook)
- ConfirmPassword page

### Priority 6: Performance + PWA
- Bundle optimization (612KB → 300KB)
- Code splitting, lazy loading

### Priority 7: Extras
- Blog, StoreLocator, Contact, FAQ, QuickOrder

### Priority 8: Testing + Launch
- Unit/Integration/E2E tests
- Lighthouse audit
- Production deploy

---

*Kế hoạch này là living document. Last full audit: 2026-02-18. Update khi có thay đổi về scope hoặc tech decisions.*
