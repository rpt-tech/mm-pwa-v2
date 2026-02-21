import { test, expect } from '@playwright/test';

const BFF_URL = 'https://mm-bff.hi-huythanh.workers.dev';

test('homepage loads', async ({ page }) => {
  test.setTimeout(15000);
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect.soft(page).toHaveTitle(/MM/);
  await expect.soft(page.locator('text=Error')).not.toBeVisible();
  await expect.soft(page.locator('text=500')).not.toBeVisible();
});

test('sign-in page loads', async ({ page }) => {
  test.setTimeout(15000);
  await page.goto('/sign-in', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
});

test('search page loads', async ({ page }) => {
  test.setTimeout(15000);
  const response = await page.goto('/search?query=test', { waitUntil: 'domcontentloaded' });
  expect(response?.status()).toBe(200);
});

test('404 page works', async ({ page }) => {
  test.setTimeout(15000);
  await page.goto('/this-page-does-not-exist-xyz', { waitUntil: 'domcontentloaded' });
  const body = await page.content();
  const has404 = body.includes('404') || body.includes('not found') || body.includes('Not Found') || body.includes('Không tìm thấy');
  expect(has404).toBeTruthy();
});

test('BFF health check', async ({ request }) => {
  test.setTimeout(15000);
  const response = await request.get(`${BFF_URL}/health`);
  expect(response.ok()).toBeTruthy();
});
