import { defineConfig, devices } from '@playwright/test'
import { config } from 'dotenv'

config()

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './playwright-results',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [['html', { outputFolder: 'playwright-report' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
