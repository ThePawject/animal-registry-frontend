import { test as base, type Page } from '@playwright/test'

type Fixtures = {
  authenticatedPage: Page
}

export const test = base.extend<Fixtures>({
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await use(page)
  },
})

export { expect } from '@playwright/test'
