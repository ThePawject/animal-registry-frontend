import { expect } from '@playwright/test'
import { URLS } from '../config/env.ts'
import type { Locator, Page } from '@playwright/test'
import type { TestUser } from '../support/users.ts'

export class MockLoginPage {
  readonly heading: Locator
  private readonly email: Locator
  private readonly roles: Locator
  private readonly userId: Locator
  private readonly submit: Locator

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'E2E mock login' })
    this.email = page.getByLabel('Email')
    this.roles = page.getByLabel('Roles (comma separated)')
    this.userId = page.getByLabel('User id (optional)')
    this.submit = page.getByRole('button', { name: 'Sign in' })
  }

  async expectOpen() {
    await expect(this.page).toHaveURL(new RegExp(`^${URLS.auth}/authorize`))
    await expect(this.heading).toBeVisible()
  }

  async signInAs(user: TestUser) {
    await this.expectOpen()
    await this.email.fill(user.email)
    await this.roles.fill(user.roles.join(','))
    await this.userId.fill(user.id)
    await this.submit.click()
  }
}

export class AuthScreens {
  readonly loginCard: Locator
  readonly loginCardSignIn: Locator
  readonly learnMoreLink: Locator

  readonly noAccessHeading: Locator
  readonly backToLoginButton: Locator

  readonly header: Locator
  readonly logoutButton: Locator

  readonly sessionExpiredDialog: Locator

  constructor(readonly page: Page) {
    this.loginCard = page
      .locator('[data-slot="card"]')
      .filter({ hasText: 'Witaj z powrotem!' })
    this.loginCardSignIn = this.loginCard.getByRole('button', {
      name: 'Zaloguj się',
    })
    this.learnMoreLink = page.getByRole('link', {
      name: 'Dowiedz się więcej o MojeSchronisko.pl',
    })

    this.noAccessHeading = page.getByRole('heading', {
      name: 'Nie masz przypisanej roli',
    })
    this.backToLoginButton = page.getByRole('button', {
      name: 'Przejdź do strony logowania',
    })

    this.header = page.locator('header')
    this.logoutButton = this.header.getByRole('button', { name: 'Wyloguj się' })

    this.sessionExpiredDialog = page
      .getByRole('dialog')
      .filter({ hasText: 'MojeSchronisko.pl' })
  }

  async expectSignedInTo(user: TestUser) {
    await expect(
      this.header.getByRole('link', { name: `Panel ${user.shelterName}` }),
    ).toBeVisible()
    await expect(this.logoutButton).toBeVisible()
  }

  async expectLoginCard() {
    await expect(this.loginCard).toBeVisible()
    await expect(this.loginCardSignIn).toBeEnabled()
  }

  async logout() {
    await this.logoutButton.click()
  }
}
