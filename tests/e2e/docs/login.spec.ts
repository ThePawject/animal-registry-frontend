import { test, expect } from '../fixtures'

test('can log in', async ({ authenticatedPage: page }) => {
  await expect(page).toHaveURL(/localhost:3000/)
})
