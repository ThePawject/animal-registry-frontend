import process from 'node:process'
import { defineConfig, devices } from '@playwright/test'
import {
  AUTH,
  BROWSER_LOCALE,
  BROWSER_TIMEZONE,
  HEALTH_URLS,
  IS_CI,
  PATHS,
  PORTS,
  TIMEOUTS,
  URLS,
} from './e2e/config/env.ts'

/**
 * End-to-end suite. `playwright test` boots the whole stack locally:
 * SQL Server + Azurite (Docker), a mock identity provider, the real backend
 * from the sibling repository and the Vite dev server. See `e2e/README.md`.
 */

const stackScript = (name: string) => `node --import tsx e2e/stack/${name}.ts`

/** Let every service shut down cleanly (and the containers get removed). */
const gracefulShutdown = { signal: 'SIGTERM', timeout: 60_000 } as const

const webServerDefaults = {
  reuseExistingServer: !IS_CI,
  timeout: TIMEOUTS.stackStart,
  gracefulShutdown,
  stdout: 'pipe',
  stderr: 'pipe',
} as const

export default defineConfig({
  testDir: './e2e/specs',
  outputDir: `${PATHS.artifactsDir}/test-results`,
  globalSetup: './e2e/global-setup.ts',

  fullyParallel: true,
  forbidOnly: IS_CI,
  // Tests are isolated by shelter, so a retry starts from clean data. Retries
  // absorb the rare stall that outlasts even the generous timeouts below.
  retries: IS_CI ? 2 : 1,
  // The dev stack is the bottleneck, not the browsers: more workers mostly
  // means more stalls.
  workers: process.env.E2E_WORKERS ? Number(process.env.E2E_WORKERS) : 3,

  timeout: TIMEOUTS.test,
  expect: { timeout: TIMEOUTS.slow },

  reporter: [
    ['list'],
    ['html', { outputFolder: `${PATHS.artifactsDir}/report`, open: 'never' }],
  ],

  use: {
    baseURL: URLS.frontend,
    actionTimeout: TIMEOUTS.slow,
    navigationTimeout: TIMEOUTS.slow,
    locale: BROWSER_LOCALE,
    timezoneId: BROWSER_TIMEZONE,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],

  webServer: [
    {
      ...webServerDefaults,
      name: 'infra',
      command: stackScript('infra'),
      url: HEALTH_URLS.infra,
    },
    {
      ...webServerDefaults,
      name: 'auth',
      command: stackScript('mock-auth-server'),
      url: HEALTH_URLS.auth,
    },
    {
      ...webServerDefaults,
      name: 'backend',
      command: stackScript('backend'),
      url: HEALTH_URLS.backend,
    },
    {
      ...webServerDefaults,
      name: 'frontend',
      command: `node node_modules/vite/bin/vite.js dev --port ${PORTS.frontend} --strictPort`,
      url: HEALTH_URLS.frontend,
      env: {
        VITE_AUTH0_DOMAIN: URLS.auth,
        VITE_AUTH0_CLIENT_ID: AUTH.clientId,
        VITE_AUTH0_REDIRECT_URI: `${URLS.frontend}/`,
        VITE_BACKEND_URL: URLS.backend,
      },
    },
  ],
})
