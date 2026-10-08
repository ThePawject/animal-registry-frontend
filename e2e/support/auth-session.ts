import { expect } from '@playwright/test'
import { AUTH, URLS } from '../config/env.ts'
import { AuthScreens, MockLoginPage } from '../pages/auth.page.ts'
import { PanelPage } from '../pages/panel.page.ts'
import { retry } from './retry.ts'
import type { Browser, BrowserContext, Page } from '@playwright/test'
import type { TestUser } from './users.ts'

export type StorageState = Awaited<ReturnType<BrowserContext['storageState']>>

/** Key the search box uses to remember that its help popover was dismissed. */
export const SEARCH_INFO_DISMISSED_KEY = 'animal-search-info-dismissed'

/**
 * A browser context without any session. Inside a test `browser.newContext()`
 * inherits the signed-in state of the test, so the empty state is explicit.
 */
export function newAnonymousContext(browser: Browser) {
  return browser.newContext({
    baseURL: URLS.frontend,
    storageState: { cookies: [], origins: [] },
  })
}

/**
 * Signs in the way a person does: open the panel, press "Zaloguj się", fill
 * in the identity provider's form, land back in the app.
 *
 * `page` must not have a session yet.
 */
export async function signInThroughUi(page: Page, user: TestUser) {
  const auth = new AuthScreens(page)
  await page.goto(PanelPage.path)
  await auth.expectLoginCard()
  await auth.loginCardSignIn.click()
  await new MockLoginPage(page).signInAs(user)
  await expect(page).toHaveURL(new RegExp(`^${URLS.frontend}/`))
}

/**
 * Produces the browser state (cookies + localStorage) of a signed-in user,
 * ready to be handed to `browser.newContext({ storageState })`.
 *
 * The login runs once in a throwaway context; tests then start already
 * signed in instead of repeating the login flow.
 */
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
          // The help popover opens on the first focus of the search box and
          // would cover the table; individual tests opt back in to test it.
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

/**
 * Makes the cached session unusable without a new login, the state a user
 * ends up in when their refresh token has been revoked or has expired.
 */
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

/** Caches signed-in browser state per user for the lifetime of a worker. */
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
