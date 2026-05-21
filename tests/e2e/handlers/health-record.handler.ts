import type { Page } from '@playwright/test'

export type HealthRecordData = {
  date: string
  description: string
  performedBy?: string
}

export async function navigateToMedicalRecords(page: Page) {
  const match = page.url().match(/\/animal\/([^/?]+)/)
  if (!match) throw new Error('navigateToMedicalRecords: no animal ID in URL')
  await page.goto(`/animal/${match[1]}/medical-records`)
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
