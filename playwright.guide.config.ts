import { defineConfig, devices } from '@playwright/test'
import baseConfig from './playwright.config.ts'

export default defineConfig({
  ...baseConfig,
  testDir: './e2e/guide',
  testMatch: '*.guide.ts',

  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],

  projects: [
    {
      name: 'guide',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1680, height: 950 },
      },
    },
  ],
})
