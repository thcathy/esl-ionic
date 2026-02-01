import {defineConfig, devices} from '@playwright/test';
import {chromium} from 'playwright';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'https://uat.funfunspell.com/';

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['line'], ['html', { open: 'never' }]] : [['list'], ['html']],
  use: {
    baseURL,
    // Avoid macOS crashes seen with chrome-headless-shell by forcing the regular Chromium binary.
    launchOptions: {
      executablePath: chromium.executablePath()
    },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});

