import type { Page } from '@playwright/test'
import { getCurrentAnimalId } from './animal.handler'

export type HealthRecordData = {
  date: string
  description: string
  performedBy?: string
}

export async function navigateToMedicalRecords(page: Page) {
  const animalId = getCurrentAnimalId(page, 'navigateToMedicalRecords')
  await page.goto(`/animal/${animalId}/medical-records`)
  await page.waitForLoadState('networkidle')
}

export async function addHealthRecord(page: Page, data: HealthRecordData) {
  await page.getByTestId('add-health-record-btn').click()

  await page.getByTestId('health-record-date-input').fill(data.date)

  if (data.performedBy) {
    await page.getByTestId('performed-by-input').fill(data.performedBy)
  }

  await page.getByTestId('health-record-description-input').fill(data.description)

  await page.getByTestId('submit-add-health-record').click()
  await page.waitForLoadState('networkidle')
}

export async function findHealthRecordRowByDescription(page: Page, description: string) {
  return page.getByTestId('health-records-table').locator('tbody tr').filter({ hasText: description }).first()
}

export async function editFirstHealthRecord(page: Page, newDescription: string) {
  const firstRow = page.getByTestId('health-records-table').locator('tbody tr').first()
  await firstRow.getByTestId('edit-health-record-btn').click()
  await page.getByTestId('edit-health-record-description-input').fill(newDescription)
  await page.getByTestId('save-edit-health-record-btn').click()
  await page.waitForLoadState('networkidle')
}

export async function deleteFirstHealthRecord(page: Page) {
  const firstRow = page.getByTestId('health-records-table').locator('tbody tr').first()
  await firstRow.getByTestId('delete-health-record-btn').click()
  await page.getByTestId('confirm-delete-health-record-btn').click()
  await page.waitForLoadState('networkidle')
}
