import type { Page } from '@playwright/test'

const EMAIL = process.env.TEST_LOGIN_EMAIL ?? ''
const PASSWORD = process.env.TEST_LOGIN_PASSWORD ?? ''

export async function login(page: Page) {
  await page.goto('/')
  await page.waitForLoadState('networkidle')

  await page.getByRole('button', { name: 'Zaloguj się' }).click()

  await page.waitForURL(/hbcrew\.eu\.auth0\.com/)
  await page.waitForLoadState('networkidle')

  await page.getByLabel(/nazwa użytkownika lub e-mail/i).fill(EMAIL)
  await page.locator('input[name="password"]').fill(PASSWORD)
  await page.getByRole('button', { name: /kontynuuj/i }).click()

  await page.waitForURL(/localhost:3000/, { timeout: 15000 })
  await page.waitForLoadState('networkidle')
}
