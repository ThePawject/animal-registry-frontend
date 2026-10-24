import { expect } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

export class AddonsPage {
  static readonly path = '/addons'
  static detailPath = (key: string) => `/addons/${key}`

  readonly toggleButton: Locator
  readonly statusBadge: Locator
  readonly adminOnlyNotice: Locator
  readonly mainNavigation: Locator

  constructor(readonly page: Page) {
    this.toggleButton = page.getByRole('button', { name: /dodatek$/ })
    this.statusBadge = page
      .locator('[data-slot="card"]')
      .first()
      .locator('[data-slot="badge"]')
    this.adminOnlyNotice = page.getByText(
      'Dodatek może włączać i wyłączać tylko administrator schroniska.',
    )
    this.mainNavigation = page.getByRole('navigation', {
      name: 'Nawigacja główna',
    })
  }

  card(name: string) {
    return this.page
      .getByRole('link')
      .filter({ has: this.page.locator('[data-slot="card"]') })
      .filter({ hasText: name })
  }

  navLink(name: string) {
    return this.mainNavigation.getByRole('link', { name, exact: true })
  }

  async goto() {
    await this.page.goto(AddonsPage.path)
    await expect(this.card('Szczepienia')).toBeVisible()
  }

  async gotoDetail(key: string) {
    await this.page.goto(AddonsPage.detailPath(key))
    await expect(this.statusBadge).toBeVisible()
  }

  async enable() {
    await this.page.getByRole('button', { name: 'Włącz dodatek' }).click()
    await expect(this.statusBadge).toHaveText('Włączony')
  }

  async disable() {
    await this.page.getByRole('button', { name: 'Wyłącz dodatek' }).click()
    await expect(this.statusBadge).toHaveText('Wyłączony')
  }
}
