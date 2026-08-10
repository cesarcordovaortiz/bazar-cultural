import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/tests',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5173',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: true,
    timeout: 120_000,
  },
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:5173',
    browserName: 'chromium',
    headless: true,
    viewport: { width: 1280, height: 800 },
    actionTimeout: 10_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
