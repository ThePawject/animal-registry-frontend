import type { Page } from '@playwright/test'
import { getCurrentAnimalId } from './animal.handler'

export type EventData = {
  type: string
  date: string
  description: string
}

export async function navigateToEvents(page: Page) {
  const animalId = getCurrentAnimalId(page, 'navigateToEvents')
  await page.goto(`/animal/${animalId}/events`)
  await page.waitForLoadState('networkidle')
}

export async function findEventRowByDescription(page: Page, description: string) {
  return page.getByTestId('events-table').locator('tbody tr').filter({ hasText: description }).first()
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
  const row = await findEventRowByDescription(page, description)
  await row.getByTestId('delete-event-btn').click()
  await page.getByTestId('confirm-delete-event-btn').click()
  await page.waitForLoadState('networkidle')
}
