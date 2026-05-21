import { chromium } from '@playwright/test'
import { config } from 'dotenv'

config()

const BASE_URL = 'http://localhost:3000'
const BACKEND_URL = process.env.VITE_BACKEND_URL ?? ''
const EMAIL = process.env.TEST_LOGIN_EMAIL ?? ''
const PASSWORD = process.env.TEST_LOGIN_PASSWORD ?? ''

const GET_WARMUP_TIMEOUT_MS = 4 * 60 * 1000
const POST_WARMUP_TIMEOUT_MS = 10 * 60 * 1000
const WARMUP_INTERVAL_MS = 5000

async function warmupBackend(context: import('@playwright/test').BrowserContext) {
  const apiPage = await context.newPage()
  const deadline = Date.now() + GET_WARMUP_TIMEOUT_MS
  const startedAt = Date.now()
  let attempt = 0

  console.log(`\n[warmup] Pinging ${BACKEND_URL}animals ...`)

  while (Date.now() < deadline) {
    attempt++
    try {
      const res = await apiPage.request.get(`${BACKEND_URL}animals`, {
        params: { page: '1', pageSize: '20' },
        timeout: 30000,
      })
      if (res.status() < 500) {
        const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1)
        console.log(`[warmup] Backend ready after ${elapsed}s (attempt ${attempt})`)
        await apiPage.close()
        return
      }
    } catch {
      // intentionally empty
    }
    console.log(`[warmup] Not ready yet (attempt ${attempt}), retrying in ${WARMUP_INTERVAL_MS / 1000}s...`)
    await new Promise((r) => setTimeout(r, WARMUP_INTERVAL_MS))
  }

  await apiPage.close()
  throw new Error(`[warmup] Backend did not respond within ${GET_WARMUP_TIMEOUT_MS / 1000}s`)
}

async function warmupPost(context: import('@playwright/test').BrowserContext, token: string) {
  const apiPage = await context.newPage()
  const deadline = Date.now() + POST_WARMUP_TIMEOUT_MS
  let attempt = 0

  console.log(`\n[warmup] Warming POST ${BACKEND_URL}animals ...`)

  while (Date.now() < deadline) {
    attempt++
    try {
      const sigRes = await apiPage.request.get(`${BACKEND_URL}animals/signature`, {
        params: { species: '1' },
        headers: { Authorization: `Bearer ${token}` },
        timeout: WARMUP_INTERVAL_MS,
      })

      if (sigRes.status() >= 500) {
        console.log(`[warmup] POST not ready yet (attempt ${attempt}), retrying...`)
        await new Promise((r) => setTimeout(r, WARMUP_INTERVAL_MS))
        continue
      }

      const { signature } = await sigRes.json()
      const start = Date.now()

      const postRes = await apiPage.request.post(`${BACKEND_URL}animals`, {
        multipart: { species: '1', signature, color: '', breed: '', distinguishingMarks: '', sex: '0', mainPhotoIndex: '0' },
        headers: { Authorization: `Bearer ${token}` },
        timeout: POST_WARMUP_TIMEOUT_MS,
      })

      const elapsed = ((Date.now() - start) / 1000).toFixed(1)

      if (postRes.status() < 500) {
        console.log(`[warmup] POST /animals ready after ${elapsed}s (attempt ${attempt}, status ${postRes.status()})`)
        const body = await postRes.json().catch(() => null)
        if (body?.id) {
          await apiPage.request.delete(`${BACKEND_URL}animals/${body.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        }
        await apiPage.close()
        return
      }
    } catch (e) {
      console.log(`[warmup] POST attempt ${attempt} failed: ${e}`)
    }

    await new Promise((r) => setTimeout(r, WARMUP_INTERVAL_MS))
  }

  await apiPage.close()
  console.log(`[warmup] POST /animals warmup timed out after ${POST_WARMUP_TIMEOUT_MS / 1000}s — tests may be slow`)
}

export default async function globalSetup() {
  if (process.env.SKIP_WARMUP === '1') return

  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

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

  await context.storageState({ path: 'tests/e2e/.auth-state.json' })

  const token = await page.evaluate<string | null>(() => {
    const key = Object.keys(localStorage).find((k) => k.startsWith('@@auth0spajs@@'))
    if (!key) return null
    try {
      const data = JSON.parse(localStorage.getItem(key) ?? '{}')
      return data?.body?.access_token ?? null
    } catch {
      return null
    }
  })

  await warmupBackend(context)

  if (token) {
    await warmupPost(context, token)
  } else {
    console.log('[warmup] Could not extract token — skipping POST warmup')
  }

  await browser.close()
}
