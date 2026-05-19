import { test, expect } from '../fixtures'
import { createAnimal, navigateToAnimalByName, deleteCurrentAnimal } from '../handlers/animal.handler'
import { uploadPhoto, deletePhoto, TEST_PHOTO_PATH } from '../handlers/photo.handler'
import { ANIMALS } from '../config'

test('upload photo when creating animal', async ({ authenticatedPage: page }) => {
  await page.goto('/create')
  await page.waitForLoadState('networkidle')

  await page.getByTestId('species-select').click()
  await page.getByRole('option', { name: 'Pies' }).click()
  await page.getByTestId('generate-signature-btn').click()
  await page.waitForFunction(() => {
    const input = document.querySelector('#Oznaczenie') as HTMLInputElement
    return input && input.value.length > 0
  })
  await page.getByTestId('name-input').fill(ANIMALS.photoUpload.name!)

  await uploadPhoto(page)

  await expect(page.getByTestId('photo-preview')).toBeVisible()

  await page.getByTestId('submit-add-animal').click()
  await page.waitForURL(/localhost:3000\/?(\?.*)?$/)

  // cleanup
  await navigateToAnimalByName(page, ANIMALS.photoUpload.name!)
  await deleteCurrentAnimal(page)
})

test('delete photo before submitting', async ({ authenticatedPage: page }) => {
  await page.goto('/create')
  await page.waitForLoadState('networkidle')

  await page.getByTestId('species-select').click()
  await page.getByRole('option', { name: 'Pies' }).click()
  await page.getByTestId('generate-signature-btn').click()
  await page.waitForFunction(() => {
    const input = document.querySelector('#Oznaczenie') as HTMLInputElement
    return input && input.value.length > 0
  })

  await uploadPhoto(page)
  await expect(page.getByTestId('photo-preview')).toBeVisible()

  await deletePhoto(page)
  await expect(page.getByTestId('photo-preview')).not.toBeVisible()
})

test('upload photo in edit tab', async ({ authenticatedPage: page }) => {
  await createAnimal(page, ANIMALS.photoEdit)
  await navigateToAnimalByName(page, ANIMALS.photoEdit.name!)

  await page.getByTestId('edit-tab-link').click()
  await page.waitForURL(/\/edit$/)
  await page.waitForLoadState('networkidle')

  await uploadPhoto(page)
  await expect(page.getByTestId('photo-preview')).toBeVisible()

  await page.getByTestId('submit-edit-animal').click()
  await page.waitForURL(/\/animal\/[^/]+$/)
  await page.waitForLoadState('networkidle')

  await expect(page.getByTestId('animal-main-photo')).toBeVisible()

  // cleanup
  await deleteCurrentAnimal(page)
})

test('upload multiple photos and set main', async ({ authenticatedPage: page }) => {
  await page.goto('/create')
  await page.waitForLoadState('networkidle')

  await page.getByTestId('species-select').click()
  await page.getByRole('option', { name: 'Kot' }).click()
  await page.getByTestId('generate-signature-btn').click()
  await page.waitForFunction(() => {
    const input = document.querySelector('#Oznaczenie') as HTMLInputElement
    return input && input.value.length > 0
  })

  await page.getByTestId('photos-input').setInputFiles([TEST_PHOTO_PATH, TEST_PHOTO_PATH])
  await page.waitForFunction(() =>
    document.querySelector('[data-testid="photo-preview"]') !== null
  )

  await expect(page.getByTestId('photo-preview')).toBeVisible()
  await expect(page.getByTestId('set-main-photo-btn')).toBeVisible()

  await page.getByTestId('set-main-photo-btn').click()
})
