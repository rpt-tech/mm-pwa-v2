# DEPLOY TO VERCEL - MANUAL STEPS

## Quick Deploy via Vercel Dashboard

### Step 1: Go to Vercel Dashboard
Open: https://vercel.com/new

### Step 2: Import Git Repository
1. Click "Import Git Repository"
2. Select: `rpt-tech/mm-pwa-v2`
3. Click "Import"

### Step 3: Configure Project
- **Framework Preset:** Vite
- **Root Directory:** `apps/web`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### Step 4: Add Environment Variables
Click "Environment Variables" and add:

```
VITE_MAGENTO_URL=https://online.mmvietnam.com/graphql
```

Optional (for later):
```
VITE_FACEBOOK_APP_ID=1031510681791734
VITE_GOOGLE_CLIENT_ID=222045128234-12sq1ekidc61s0d2ffafof71eqegg893.apps.googleusercontent.com
VITE_GA4_ID=G-M860NB9VH2
VITE_GTM_ID=GTM-KXH7R829
```

### Step 5: Deploy
1. Click "Deploy"
2. Wait for build to complete (~2-3 minutes)
3. Get deployment URL

---

## Alternative: Deploy via GitHub Integration

### Step 1: Connect GitHub
1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import `rpt-tech/mm-pwa-v2`

### Step 2: Configure
Same as above (Framework: Vite, Root: apps/web, etc.)

### Step 3: Enable Auto-Deploy
- Production branch: `main`
- Preview branch: `dev`

Every push to `dev` will auto-deploy to preview URL.

---

## Expected Deployment URL

After deployment, you'll get:
- **Production:** https://mm-pwa-v2.vercel.app (or custom domain)
- **Preview (dev):** https://mm-pwa-v2-git-dev-admin-rpts-projects.vercel.app

---

## Post-Deployment Testing

Test these flows:
1. Browse products (category, search)
2. View product detail
3. Add to cart
4. Checkout (guest)
5. Create account
6. Login
7. View order history
8. Manage addresses
9. Manage wishlist

---

## Current Build Status

- **Branch:** dev
- **Commit:** 9e8d81e
- **Build Size:** 884.72 KiB (150.72 KiB gzip)
- **Status:** ✅ Ready

---

## Troubleshooting

### Build fails?
- Check environment variables are set
- Verify `VITE_MAGENTO_URL` is correct
- Check build logs for errors

### App loads but API fails?
- Verify Magento backend is accessible
- Check CORS settings on Magento
- Check GraphQL endpoint URL

### Payment redirect fails?
- Verify payment gateway credentials in Magento admin
- Check payment method configuration

---

**Ready to deploy!** Follow steps above to get your deployment URL.
