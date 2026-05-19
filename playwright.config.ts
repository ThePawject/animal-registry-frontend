import { defineConfig, devices } from '@playwright/test'
import { config } from 'dotenv'

config()

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './playwright-results',
  globalSetup: './tests/e2e/global-setup.ts',
  fullyParallel: true,
  retries: 1,
  workers: 3,
  timeout: 60000,
  reporter: [['html', { outputFolder: 'playwright-report' }]],
  use: {
    baseURL: 'http://localhost:3000',
    storageState: 'tests/e2e/.auth-state.json',
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
