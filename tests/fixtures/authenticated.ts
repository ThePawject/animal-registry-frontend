import {  test as base } from '@playwright/test'
import type {Page} from '@playwright/test';

type AuthenticatedFixtures = {
  authenticatedPage: Page
}

export const test = base.extend<AuthenticatedFixtures>({
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/', { waitUntil: 'networkidle' })

    await page.waitForLoadState('domcontentloaded')

    await use(page)
  },
})

export { expect } from '@playwright/test'
