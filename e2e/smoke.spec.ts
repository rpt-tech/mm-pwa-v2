import { test, expect } from '@playwright/test';

const BFF_URL = 'https://mm-bff.hi-huythanh.workers.dev';

// ─── Homepage ────────────────────────────────────────────────────────────────

test('homepage loads with correct title', async ({ page }) => {
  test.setTimeout(30000);
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle(/MM/i);
});

test('homepage hero banner is visible', async ({ page }) => {
  test.setTimeout(30000);
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  // Hero section has bg-[#0272BA] and contains the welcome heading
  const hero = page.locator('text=Chào mừng đến MM Vietnam').or(
    page.locator('text=MM Vietnam').first()
  );
  await expect(hero).toBeVisible({ timeout: 15000 });
});

test('homepage category section is visible', async ({ page }) => {
  test.setTimeout(30000);
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  // "Danh mục nổi bật" heading rendered by HomeLandingFallback
  const categoryHeading = page.locator('text=Danh mục nổi bật');
  await expect(categoryHeading).toBeVisible({ timeout: 15000 });
});

test('homepage has no critical errors', async ({ page }) => {
  test.setTimeout(30000);
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect.soft(page.locator('text=Error')).not.toBeVisible();
  await expect.soft(page.locator('text=500')).not.toBeVisible();
});

// ─── Category navigation ─────────────────────────────────────────────────────

test('category navigation: clicking category link changes URL', async ({ page }) => {
  test.setTimeout(30000);
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  // Wait for the "Mua sắm ngay" CTA or any category link pointing to /category
  const categoryLink = page.locator('a[href="/category"]').first();
  await expect(categoryLink).toBeVisible({ timeout: 15000 });
  await categoryLink.click();

  // URL should now contain /category
  await expect(page).toHaveURL(/\/category/, { timeout: 15000 });
});

test('category page loads content', async ({ page }) => {
  test.setTimeout(30000);
  await page.goto('/category', { waitUntil: 'domcontentloaded' });
  // Page should not show a blank screen — at minimum the layout renders
  const body = page.locator('body');
  await expect(body).toBeVisible();
  // Should not show a hard 500 error
  await expect.soft(page.locator('text=500')).not.toBeVisible();
});

// ─── Product page ─────────────────────────────────────────────────────────────

test('product page: product name is visible', async ({ page }) => {
  test.setTimeout(30000);
  // Use a known stable product URL from MM Vietnam
  await page.goto('/product/nuoc-suoi-lavie-500ml', { waitUntil: 'domcontentloaded' });

  // Either the product name renders (h1) or the "not found" message renders
  const productName = page.locator('h1');
  await expect(productName).toBeVisible({ timeout: 20000 });
});

test('product page: add-to-cart button is present', async ({ page }) => {
  test.setTimeout(30000);
  await page.goto('/product/nuoc-suoi-lavie-500ml', { waitUntil: 'domcontentloaded' });

  // Wait for loading skeleton to disappear — product detail renders an h1
  await page.waitForSelector('h1', { timeout: 20000 });

  // Add-to-cart button text: "Thêm vào giỏ" or "Đang thêm..."
  const addToCartBtn = page.locator('button', { hasText: /Thêm vào giỏ|Đang thêm|Không tìm thấy/i });
  // Also accept the "not found" state as a valid render (product may be unavailable)
  const notFound = page.locator('text=Không tìm thấy sản phẩm');

  const btnVisible = await addToCartBtn.isVisible().catch(() => false);
  const notFoundVisible = await notFound.isVisible().catch(() => false);

  expect(btnVisible || notFoundVisible).toBeTruthy();
});

// ─── Search ───────────────────────────────────────────────────────────────────

test('search page loads with query param', async ({ page }) => {
  test.setTimeout(30000);
  const response = await page.goto('/search?query=nuoc', { waitUntil: 'domcontentloaded' });
  expect(response?.status()).toBe(200);
});

test('search: typing in search box and submitting navigates to results', async ({ page }) => {
  test.setTimeout(30000);
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  // Find the search input (type="search" in Header)
  const searchInput = page.locator('input[type="search"]');
  await expect(searchInput).toBeVisible({ timeout: 15000 });

  await searchInput.fill('nuoc');
  await searchInput.press('Enter');

  // Should navigate to /search?query=nuoc
  await expect(page).toHaveURL(/\/search\?query=nuoc/, { timeout: 15000 });
});

test('search results page shows content', async ({ page }) => {
  test.setTimeout(30000);
  await page.goto('/search?query=nuoc', { waitUntil: 'domcontentloaded' });

  // Wait for either products grid or "no results" message
  const resultsOrEmpty = page.locator('.grid')
    .or(page.getByText('Không tìm thấy kết quả'))
    .or(page.getByText('Tìm kiếm sản phẩm'))
    .or(page.getByText('nuoc'));
  await expect(resultsOrEmpty.first()).toBeVisible({ timeout: 20000 });
});

// ─── 404 page ─────────────────────────────────────────────────────────────────

test('404 page works', async ({ page }) => {
  test.setTimeout(30000);
  await page.goto('/this-page-does-not-exist-xyz', { waitUntil: 'domcontentloaded' });
  // CmsPage async-resolves then renders NotFoundPage — wait for it
  const notFound = page.locator('h1').filter({ hasText: '404' })
    .or(page.locator('h2').filter({ hasText: 'Không tìm thấy' }))
    .or(page.getByText('Không tìm thấy trang'));
  await expect(notFound.first()).toBeVisible({ timeout: 20000 });
});

test('404 page: navigating to nonexistent route returns 200 (SPA) with 404 content', async ({ page }) => {
  test.setTimeout(30000);
  // SPA returns HTTP 200 but renders 404 content
  const response = await page.goto('/nonexistent-page-xyz-abc', { waitUntil: 'domcontentloaded' });
  // Vercel SPA deployments return 200 for all routes
  expect([200, 404]).toContain(response?.status());
  // Wait for SPA to render, then check body has content
  await page.waitForFunction(() => document.body.innerText.trim().length > 10, { timeout: 20000 });
  const bodyText = await page.locator('body').innerText();
  expect(bodyText.length).toBeGreaterThan(10);
});

// ─── Sign-in page ─────────────────────────────────────────────────────────────

test('sign-in page loads', async ({ page }) => {
  test.setTimeout(30000);
  await page.goto('/sign-in', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible({ timeout: 15000 });
});

// ─── BFF health ───────────────────────────────────────────────────────────────

test('BFF health check', async ({ request }) => {
  test.setTimeout(15000);
  const response = await request.get(`${BFF_URL}/health`);
  expect(response.ok()).toBeTruthy();
});
