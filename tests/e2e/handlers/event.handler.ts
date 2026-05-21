import type { Page } from '@playwright/test'

export type EventData = {
  type: string
  date: string
  description: string
}

export async function navigateToAnimalView(page: Page) {
  const match = page.url().match(/\/animal\/([^/?]+)/)
  if (!match) throw new Error('navigateToAnimalView: no animal ID in URL')
  await page.goto(`/animal/${match[1]}`)
  await page.waitForLoadState('networkidle')
  await page.getByTestId('delete-animal-btn').waitFor({ state: 'visible' })
  await page.waitForTimeout(200)
}

export async function navigateToEvents(page: Page) {
  const match = page.url().match(/\/animal\/([^/?]+)/)
  if (!match) throw new Error('navigateToEvents: no animal ID in URL')
  await page.goto(`/animal/${match[1]}/events`)
  await page.waitForLoadState('networkidle')
}

export async function addEvent(page: Page, data: EventData) {
  await page.getByTestId('add-event-btn').click()

  await page.getByTestId('event-type-select').click()
  await page.getByRole('option', { name: data.type }).click()

  await page.getByTestId('event-date-input').fill(data.date)
  await page.getByTestId('event-description-input').fill(data.description)

  await page.getByTestId('submit-add-event').click()
  await page.waitForLoadState('networkidle')
}

export async function editFirstEvent(page: Page, newDescription: string) {
  const firstRow = page.getByTestId('events-table').locator('tbody tr').first()
  await firstRow.getByTestId('edit-event-btn').click()
  await page.getByTestId('edit-event-description-input').fill(newDescription)
  await page.getByTestId('save-edit-event-btn').click()
  await page.waitForLoadState('networkidle')
}

export async function deleteFirstEvent(page: Page) {
  const firstRow = page.getByTestId('events-table').locator('tbody tr').first()
  await firstRow.getByTestId('delete-event-btn').click()
  await page.getByTestId('confirm-delete-event-btn').click()
  await page.waitForLoadState('networkidle')
}

export async function deleteEventByDescription(page: Page, description: string) {
  const row = page.getByTestId('events-table').locator('tbody tr').filter({ hasText: description })
  await row.getByTestId('delete-event-btn').click()
  await page.getByTestId('confirm-delete-event-btn').click()
  await page.waitForLoadState('networkidle')
}
