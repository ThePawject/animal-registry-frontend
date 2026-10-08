import process from 'node:process'
import { chromium } from '@playwright/test'
import { HEALTH_URLS, TIMEOUTS, URLS } from './config/env.ts'
import { AnimalDetailsPage } from './pages/animal-details.page.ts'
import { AnimalFormPage } from './pages/animal-form.page.ts'
import {
  AnimalEventsPage,
  AnimalHealthRecordsPage,
} from './pages/animal-records.page.ts'
import { LandingPage } from './pages/landing.page.ts'
import { PanelPage } from './pages/panel.page.ts'
import { waitForHttp } from './stack/process.ts'
import { ApiClient } from './support/api-client.ts'
import { signInThroughUi } from './support/auth-session.ts'
import { daysAgo } from './support/data.ts'
import { pdfDocument, pngImage } from './support/files.ts'
import { retry } from './support/retry.ts'
import { createShelterUser } from './support/users.ts'

const log = (message: string) =>
  process.stdout.write(`[e2e:warmup] ${message}\n`)

async function waitForStack() {
  const services = Object.entries(HEALTH_URLS)
  await Promise.all(
    services.map(([name, url]) =>
      waitForHttp(url, { timeoutMs: TIMEOUTS.stackStart, scope: name }),
    ),
  )
}

async function warmBackend() {
  const user = createShelterUser('warmup')
  const api = await ApiClient.forUser(user)
  try {
    const animal = await api.createAnimal({
      species: 'dog',
      name: 'Warmup',
      photos: [pngImage('warmup.png')],
    })
    await api.addEvent(animal.id, {
      type: 'walk',
      occurredOn: daysAgo(1),
      description: 'Warmup event',
    })
    await api.addHealthRecord(animal.id, {
      occurredOn: daysAgo(1),
      description: 'Warmup record',
      document: pdfDocument('warmup.pdf'),
    })
    await api.getAnimal(animal.id)
    await api.listAnimals('Warmup')
    return { user, animalId: animal.id }
  } finally {
    await api.dispose()
  }
}

async function warmFrontend(
  seed: Awaited<ReturnType<typeof warmBackend>>,
  attempt: number,
) {
  const browser = await chromium.launch()
  try {
    const context = await browser.newContext({ baseURL: URLS.frontend })
    context.setDefaultTimeout(TIMEOUTS.stackStart)
    context.setDefaultNavigationTimeout(TIMEOUTS.stackStart)
    const page = await context.newPage()

    log(`opening every route (attempt ${attempt})`)
    await new LandingPage(page).goto()
    await signInThroughUi(page, seed.user)

    const panel = new PanelPage(page)
    await panel.expectLoaded()
    await panel.eventReportButton.click()
    await page.keyboard.press('Escape')
    await panel.dateRangeReportButton.click()
    await page.keyboard.press('Escape')

    await new AnimalFormPage(page).gotoCreate()
    await new AnimalDetailsPage(page).goto(seed.animalId)
    await new AnimalFormPage(page).gotoEdit(seed.animalId)
    await new AnimalEventsPage(page).goto(seed.animalId)
    await new AnimalHealthRecordsPage(page).goto(seed.animalId)
  } finally {
    await browser.close()
  }
}

export default async function globalSetup() {
  const startedAt = Date.now()

  log('waiting for the stack to be reachable')
  await waitForStack()

  log('warming up the backend')
  const seed = await warmBackend()

  await retry((attempt) => warmFrontend(seed, attempt), {
    description: 'Warming up the frontend',
    timeoutMs: TIMEOUTS.stackStart,
    intervalMs: 2_000,
  })

  log(`ready after ${Math.round((Date.now() - startedAt) / 1000)}s`)
}
