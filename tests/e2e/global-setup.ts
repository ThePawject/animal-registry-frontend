import { chromium } from '@playwright/test'
import { config } from 'dotenv'

config()

const BASE_URL = 'http://localhost:3000'
const BACKEND_URL = process.env.VITE_BACKEND_URL ?? ''
const EMAIL = process.env.TEST_LOGIN_EMAIL ?? ''
const PASSWORD = process.env.TEST_LOGIN_PASSWORD ?? ''

const WARMUP_TIMEOUT_MS = 4 * 60 * 1000 // 4 minutes — Azure free tier cold start
const WARMUP_INTERVAL_MS = 5000

async function warmupBackend(context: import('@playwright/test').BrowserContext) {
  const apiPage = await context.newPage()
  const deadline = Date.now() + WARMUP_TIMEOUT_MS
  let attempt = 0

  console.log(`\n[warmup] Pinging ${BACKEND_URL}animals ...`)

  while (Date.now() < deadline) {
    attempt++
    try {
      const res = await apiPage.request.get(`${BACKEND_URL}animals`, {
        timeout: WARMUP_INTERVAL_MS,
      })
      if (res.status() < 500) { // 200 or 401 both mean backend is awake
        const elapsed = ((Date.now() - (deadline - WARMUP_TIMEOUT_MS)) / 1000).toFixed(1)
        console.log(`[warmup] Backend ready after ${elapsed}s (attempt ${attempt})`)
        await apiPage.close()
        return
      }
    } catch {
      // still cold-starting
    }
    console.log(`[warmup] Not ready yet (attempt ${attempt}), retrying in ${WARMUP_INTERVAL_MS / 1000}s...`)
    await new Promise((r) => setTimeout(r, WARMUP_INTERVAL_MS))
  }

  await apiPage.close()
  throw new Error(`[warmup] Backend did not respond within ${WARMUP_TIMEOUT_MS / 1000}s`)
}

export default async function globalSetup() {
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  // 1. Login
  await page.goto(BASE_URL)
  await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: 'Zaloguj się' }).click()
  await page.waitForURL(/hbcrew\.eu\.auth0\.com/)
  await page.waitForLoadState('networkidle')
  await page.getByLabel(/nazwa użytkownika lub e-mail/i).fill(EMAIL)
  await page.locator('input[name="password"]').fill(PASSWORD)
  await page.getByRole('button', { name: /kontynuuj/i }).click()
  await page.waitForURL(/localhost:3000/, { timeout: 15000 })
  await page.waitForLoadState('networkidle')

  // 2. Save auth session (cookies + localStorage with Auth0 tokens)
  await context.storageState({ path: 'tests/e2e/.auth-state.json' })

  // 3. Warmup backend — wait until GET /animals responds before tests start
  await warmupBackend(context)

  await browser.close()
}
