import path from 'path'
import { fileURLToPath } from 'url'
import type { Page } from '@playwright/test'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const TEST_PHOTO_PATH = path.join(__dirname, '../fixtures/test-photo.jpg')

export async function uploadPhoto(page: Page, photoPath = TEST_PHOTO_PATH) {
  await page.getByTestId('photos-input').setInputFiles(photoPath)
  await page.waitForFunction(() =>
    document.querySelector('[data-testid="photo-preview"]') !== null
  )
}

export async function deletePhoto(page: Page) {
  await page.getByTestId('delete-photo-btn').click()
}

export async function setMainPhoto(page: Page) {
  await page.getByTestId('set-main-photo-btn').click()
}
