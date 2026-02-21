import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: 2,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['github']],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'https://mm-pwa-v2.vercel.app',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  outputDir: 'playwright-report',
});
