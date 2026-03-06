import {  chromium } from '@playwright/test'
import * as dotenv from 'dotenv'
import type {FullConfig} from '@playwright/test';

dotenv.config()

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use
  const email = process.env.TEST_LOGIN_EMAIL
  const password = process.env.TEST_LOGIN_PASSWORD

  if (!email || !password) {
    throw new Error(
      'TEST_LOGIN_EMAIL and TEST_LOGIN_PASSWORD must be set in environment variables',
    )
  }

  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    await page.goto(baseURL || 'http://localhost:3000', {
      waitUntil: 'networkidle',
      timeout: 60000,
    })

    await page.getByRole('button', { name: /zaloguj sie|zaloguj się/i }).click()

    await page.waitForLoadState('networkidle')

    const emailInput = page.locator(
      'input[type="email"], input[name="email"], input[name="username"]',
    )
    await emailInput.waitFor({ state: 'visible', timeout: 30000 })
    await emailInput.fill(email)

    const passwordInput = page.locator(
      'input[type="password"], input[name="password"]',
    )
    await passwordInput.waitFor({ state: 'visible', timeout: 30000 })
    await passwordInput.fill(password)

    await page.getByRole('button', { name: /kontynuuj|continue/i }).click()

    await page.waitForURL('**/', { timeout: 60000 })

    await page.waitForLoadState('networkidle')

    await page.context().storageState({
      path: './tests/.auth/user.json',
    })

    await browser.close()
  } catch (error) {
    await page.screenshot({ path: './tests/.auth/auth-error.png' })
    await browser.close()
    throw new Error(`Authentication failed: ${error}`)
  }
}

export default globalSetup
