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

type Options = {
  shelter: 'shared' | 'isolated'
  signedIn: boolean
}

type TestFixtures = {
  user: TestUser
  api: ApiClient
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

const BLOB_URL = new RegExp(
  `^https://${BLOB.accountName}\\.blob\\.core\\.windows\\.net/`,
)

const PLACEHOLDER_IMAGE_URL = /^https:\/\/placehold\.co\//

export function toLocalBlobUrl(publicUrl: string) {
  const { pathname } = new URL(publicUrl)
  return `${URLS.azurite}/${BLOB.accountName}${pathname}`
}

export const test = base.extend<TestFixtures & Options, WorkerFixtures>({
  shelter: ['shared', { option: true }],
  signedIn: [true, { option: true }],

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

  blobProxy: [
    async ({ context, blobStorage }, use) => {
      await context.route(BLOB_URL, async (route) => {
        try {
          const response = await blobStorage.get(
            toLocalBlobUrl(route.request().url()),
          )
          await route.fulfill({ response })
        } catch {
          await route.abort().catch(() => undefined)
        }
      })
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
