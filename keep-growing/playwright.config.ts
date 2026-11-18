import { defineConfig, devices } from '@playwright/test';
import { existsSync, readFileSync } from 'fs';

// TEST_EMAIL / TEST_PASSWORD aus .env.local laden (Playwright lädt .env.local nicht automatisch)
if (existsSync('.env.local')) {
  readFileSync('.env.local', 'utf-8').split('\n').forEach(line => {
    const m = line.match(/^(TEST_\w+)=(.+)$/);
    if (m) process.env[m[1]] = m[2].trim();
  });
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
