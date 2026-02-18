# DEPLOYMENT INSTRUCTIONS

## ✅ App Ready for Deployment

**Build Status:** 696.40 KiB (150.42 KiB gzip)
**Branch:** dev
**Last Commit:** 865fe45 - OrderDetailPage

## Option 1: Deploy via Vercel Dashboard (RECOMMENDED)

1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Import from GitHub: `rpt-tech/mm-pwa-v2`
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `apps/web`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. Add Environment Variables (from .env):
   - `VITE_MAGENTO_URL`
   - `VITE_GRAPHQL_ENDPOINT`
   - Any other VITE_* variables
6. Click "Deploy"

## Option 2: Deploy via CLI (if interactive mode available)

```bash
cd /mnt/d/mm-new-pwa/apps/web
vercel --prod
# Follow interactive prompts
```

## Option 3: Deploy via GitHub Integration

1. Connect Vercel to GitHub repo
2. Enable auto-deploy for `dev` branch
3. Push triggers automatic deployment

## Deployment URLs

After deployment, you'll get:
- **Production:** https://[project-name].vercel.app
- **Preview:** https://[project-name]-git-dev-[team].vercel.app

## Post-Deployment Checklist

- [ ] Test auth flow (login/register)
- [ ] Test product browsing (category/search)
- [ ] Test add to cart
- [ ] Test checkout flow
- [ ] Test order history
- [ ] Check CMS pages render correctly
- [ ] Verify payment methods display

## Current Features Deployed

✓ Auth (login, register, forgot password)
✓ Navigation (Header, MegaMenu, Footer)
✓ Catalog (Category, Search, Filters)
✓ Product Detail (reviews, wishlist, specs)
✓ Cart + Checkout (Vietnam payment methods)
✓ Account (dashboard, orders, addresses, wishlist)
✓ CMS + ContentTypes (11/11 types)
✓ Business Logic (AlcoholDialog, DNR, Vietnam cascade)

## Known Limitations

- BFF not deployed (frontend calls Magento directly)
- Social Login not implemented yet
- DeliveryTime picker not implemented yet
- VAT toggle not implemented yet

These are non-blocking for staging testing.
