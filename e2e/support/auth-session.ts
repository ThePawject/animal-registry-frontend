import { expect } from '@playwright/test'
import { AUTH, URLS } from '../config/env.ts'
import { AuthScreens, MockLoginPage } from '../pages/auth.page.ts'
import { PanelPage } from '../pages/panel.page.ts'
import { retry } from './retry.ts'
import type { Browser, BrowserContext, Page } from '@playwright/test'
import type { TestUser } from './users.ts'

export type StorageState = Awaited<ReturnType<BrowserContext['storageState']>>

export const SEARCH_INFO_DISMISSED_KEY = 'animal-search-info-dismissed'

export function newAnonymousContext(browser: Browser) {
  return browser.newContext({
    baseURL: URLS.frontend,
    storageState: { cookies: [], origins: [] },
  })
}

export async function signInThroughUi(page: Page, user: TestUser) {
  const auth = new AuthScreens(page)
  await page.goto(PanelPage.path)
  await auth.expectLoginCard()
  await auth.loginCardSignIn.click()
  await new MockLoginPage(page).signInAs(user)
  await expect(page).toHaveURL(new RegExp(`^${URLS.frontend}/`))
}

export async function createSignedInState(
  browser: Browser,
  user: TestUser,
): Promise<StorageState> {
  return retry(
    async () => {
      const context = await newAnonymousContext(browser)
      try {
        const page = await context.newPage()
        await signInThroughUi(page, user)
        if (user.shelterId) {
          await new PanelPage(page).expectLoaded()
          await page.evaluate(
            (key) => localStorage.setItem(key, 'true'),
            SEARCH_INFO_DISMISSED_KEY,
          )
        }
        return await context.storageState()
      } finally {
        await context.close()
      }
    },
    { description: `Signing in as ${user.email}`, timeoutMs: 5 * 60_000 },
  )
}

export async function expireSession(page: Page) {
  await page.evaluate((clientId) => {
    for (const key of Object.keys(localStorage)) {
      if (!key.startsWith('@@auth0spajs@@') || !key.includes(clientId)) continue
      const entry = JSON.parse(localStorage.getItem(key) ?? '{}')
      if (!entry.body?.access_token) continue
      entry.expiresAt = 0
      entry.body.expires_in = 0
      delete entry.body.refresh_token
      localStorage.setItem(key, JSON.stringify(entry))
    }
  }, AUTH.clientId)
}

export class AuthStateCache {
  private readonly states = new Map<string, Promise<StorageState>>()

  constructor(private readonly browser: Browser) {}

  get(user: TestUser) {
    let state = this.states.get(user.id)
    if (!state) {
      state = createSignedInState(this.browser, user)
      this.states.set(user.id, state)
    }
    return state
  }
}
