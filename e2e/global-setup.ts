import process from 'node:process'
import { HEALTH_URLS, TIMEOUTS } from './config/env.ts'
import { waitForHttp } from './stack/process.ts'
import { ApiClient } from './support/api-client.ts'
import { daysAgo } from './support/data.ts'
import { pdfDocument, pngImage } from './support/files.ts'
import { createShelterUser } from './support/users.ts'

const log = (message: string) =>
  process.stdout.write(`[e2e:warmup] ${message}\n`)

async function waitForStack() {
  await Promise.all(
    Object.entries(HEALTH_URLS).map(([name, url]) =>
      waitForHttp(url, { timeoutMs: TIMEOUTS.stackStart, scope: name }),
    ),
  )
}

async function warmBackend() {
  const api = await ApiClient.forUser(createShelterUser('warmup'))
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
    await Promise.all([
      api.fetchReport('animals/dump'),
      api.fetchReport('animals/selected', { ids: animal.id }),
      api.fetchReport('events', { periods: 'Week' }),
      api.fetchReport('animals/date-range', {
        startDate: daysAgo(7),
        endDate: daysAgo(0),
      }),
    ])
  } finally {
    await api.dispose()
  }
}

export default async function globalSetup() {
  const startedAt = Date.now()

  log('waiting for the stack to be reachable')
  await waitForStack()

  log('warming up the backend')
  await warmBackend()

  log(`ready after ${Math.round((Date.now() - startedAt) / 1000)}s`)
}
