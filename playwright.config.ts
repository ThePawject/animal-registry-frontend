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

const stackScript = (name: string) => `node --import tsx e2e/stack/${name}.ts`

const vite = 'node node_modules/vite/bin/vite.js'

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
  retries: IS_CI ? 2 : 1,
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
      command: `${vite} build --outDir ${PATHS.frontendBuild} --emptyOutDir && ${vite} preview --outDir ${PATHS.frontendBuild} --port ${PORTS.frontend} --strictPort`,
      url: HEALTH_URLS.frontend,
      reuseExistingServer: false,
      env: {
        VITE_AUTH0_DOMAIN: URLS.auth,
        VITE_AUTH0_CLIENT_ID: AUTH.clientId,
        VITE_AUTH0_REDIRECT_URI: `${URLS.frontend}/`,
        VITE_BACKEND_URL: URLS.backend,
      },
    },
  ],
})
