import { chromium } from '@playwright/test'
import { config } from 'dotenv'

config()

const BASE_URL = 'http://localhost:3000'
const EMAIL = process.env.TEST_LOGIN_EMAIL ?? ''
const PASSWORD = process.env.TEST_LOGIN_PASSWORD ?? ''

export default async function globalSetup() {
  const browser = await chromium.launch()
  const page = await browser.newPage()

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

  await page.context().storageState({ path: 'tests/e2e/.auth-state.json' })

  await browser.close()
}
