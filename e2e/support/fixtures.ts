import { test as base, request } from '@playwright/test'
import { BLOB, URLS } from '../config/env.ts'
import { AnimalDetailsPage, Breadcrumbs } from '../pages/animal-details.page.ts'
import { AnimalFormPage } from '../pages/animal-form.page.ts'
import {
  AnimalEventsPage,
  AnimalHealthRecordsPage,
} from '../pages/animal-records.page.ts'
import { AuthScreens, MockLoginPage } from '../pages/auth.page.ts'
import { LandingPage } from '../pages/landing.page.ts'
import { PanelPage } from '../pages/panel.page.ts'
import {
  DateRangeReportDialog,
  EventReportDialog,
} from '../pages/report-dialogs.ts'
import { ApiClient } from './api-client.ts'
import { AuthStateCache } from './auth-session.ts'
import { pngImage } from './files.ts'
import { createShelterUser } from './users.ts'
import type { APIRequestContext } from '@playwright/test'
import type { TestUser } from './users.ts'

/**
 * The single `test` every spec imports.
 *
 * What a test gets by default:
 *   - `page` is already signed in as `user`, a staff member of a shelter;
 *   - `api` talks to the backend as that same user, for arranging data;
 *   - page objects (`panel`, `animalForm`, ...) are bound to `page`.
 *
 * Options, set with `test.use({ ... })`:
 *   - `shelter: 'shared'` (default) reuses one shelter for all tests of a
 *     worker. Fast, but other tests add animals to it, so only assert on
 *     data the test created itself (search for it by its unique name).
 *   - `shelter: 'isolated'` gives the test a brand new, empty shelter. Use
 *     it whenever a test counts rows, pages or expects an empty state.
 *   - `signedIn: false` starts without a session, for login-flow tests.
 */

type Options = {
  shelter: 'shared' | 'isolated'
  signedIn: boolean
}

type TestFixtures = {
  user: TestUser
  api: ApiClient
  /** Creates an API client for another user; disposed automatically. */
  apiFor: (user: TestUser) => Promise<ApiClient>

  landing: LandingPage
  auth: AuthScreens
  mockLogin: MockLoginPage
  panel: PanelPage
  animalForm: AnimalFormPage
  animalDetails: AnimalDetailsPage
  events: AnimalEventsPage
  healthRecords: AnimalHealthRecordsPage
  breadcrumbs: Breadcrumbs
  eventReport: EventReportDialog
  dateRangeReport: DateRangeReportDialog

  blobProxy: void
}

type WorkerFixtures = {
  workerUser: TestUser
  authStates: AuthStateCache
  blobStorage: APIRequestContext
}

/** Matches the public URL the backend generates for every stored blob. */
const BLOB_URL = new RegExp(
  `^https://${BLOB.accountName}\\.blob\\.core\\.windows\\.net/`,
)

const PLACEHOLDER_IMAGE_URL = /^https:\/\/placehold\.co\//

/** Rewrites a public blob URL to the same blob in the local Azurite. */
export function toLocalBlobUrl(publicUrl: string) {
  const { pathname } = new URL(publicUrl)
  return `${URLS.azurite}/${BLOB.accountName}${pathname}`
}

export const test = base.extend<TestFixtures & Options, WorkerFixtures>({
  shelter: ['shared', { option: true }],
  signedIn: [true, { option: true }],

  // -- worker scope ---------------------------------------------------------

  workerUser: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      await use(createShelterUser('worker'))
    },
    { scope: 'worker' },
  ],

  authStates: [
    async ({ browser }, use) => {
      await use(new AuthStateCache(browser))
    },
    { scope: 'worker' },
  ],

  blobStorage: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const context = await request.newContext()
      await use(context)
      await context.dispose()
    },
    { scope: 'worker' },
  ],

  // -- identity -------------------------------------------------------------

  user: async ({ shelter, workerUser }, use) => {
    await use(shelter === 'isolated' ? createShelterUser() : workerUser)
  },

  storageState: async ({ signedIn, user, authStates }, use) => {
    await use(signedIn ? await authStates.get(user) : undefined)
  },

  // eslint-disable-next-line no-empty-pattern
  apiFor: async ({}, use) => {
    const clients: Array<ApiClient> = []
    await use(async (user) => {
      const client = await ApiClient.forUser(user)
      clients.push(client)
      return client
    })
    await Promise.all(clients.map((client) => client.dispose()))
  },

  api: async ({ user, apiFor }, use) => {
    await use(await apiFor(user))
  },

  // -- environment ----------------------------------------------------------

  /**
   * The backend always builds blob URLs for the real Azure host
   * (`https://<account>.blob.core.windows.net/...`), even when it stores the
   * files in the local Azurite. Serving those URLs from Azurite keeps photos
   * and documents working offline, exactly as they do in production.
   */
  blobProxy: [
    async ({ context, blobStorage }, use) => {
      await context.route(BLOB_URL, async (route) => {
        const response = await blobStorage.get(
          toLocalBlobUrl(route.request().url()),
        )
        await route.fulfill({ response })
      })
      // The "no photo" placeholder is the app's only other external request;
      // answering it locally keeps the suite independent of the internet.
      await context.route(PLACEHOLDER_IMAGE_URL, (route) =>
        route.fulfill({
          contentType: 'image/png',
          body: pngImage('placeholder.png').buffer,
        }),
      )
      await use()
    },
    { auto: true },
  ],

  // -- page objects ---------------------------------------------------------

  landing: async ({ page }, use) => use(new LandingPage(page)),
  auth: async ({ page }, use) => use(new AuthScreens(page)),
  mockLogin: async ({ page }, use) => use(new MockLoginPage(page)),
  panel: async ({ page }, use) => use(new PanelPage(page)),
  animalForm: async ({ page }, use) => use(new AnimalFormPage(page)),
  animalDetails: async ({ page }, use) => use(new AnimalDetailsPage(page)),
  events: async ({ page }, use) => use(new AnimalEventsPage(page)),
  healthRecords: async ({ page }, use) =>
    use(new AnimalHealthRecordsPage(page)),
  breadcrumbs: async ({ page }, use) => use(new Breadcrumbs(page)),
  eventReport: async ({ page }, use) => use(new EventReportDialog(page)),
  dateRangeReport: async ({ page }, use) =>
    use(new DateRangeReportDialog(page)),
})

export { expect } from '@playwright/test'
