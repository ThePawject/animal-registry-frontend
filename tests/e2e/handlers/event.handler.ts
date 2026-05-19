import type { Page } from '@playwright/test'

export type EventData = {
  type: string
  date: string
  description: string
}

export async function navigateToAnimalView(page: Page) {
  // strip sub-path (e.g. /events) and go to animal root
  const url = page.url().replace(/\/(events|medical-records|edit).*$/, '')
  await page.goto(url)
  await page.waitForLoadState('networkidle')
}

export async function navigateToEvents(page: Page) {
  await page.getByTestId('events-tab-link').click()
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
