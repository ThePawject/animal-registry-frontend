import { test, expect } from '../fixtures'
import {
  createAnimal,
  navigateToCreateAnimal,
  fillAnimalForm,
  submitAnimalForm,
  navigateToAnimalByName,
  deleteCurrentAnimal,
  navigateToEditTab,
  submitEditAnimalForm,
} from '../handlers/animal.handler'
import { uploadPhoto, deletePhoto, setMainPhoto, TEST_PHOTO_PATH } from '../handlers/photo.handler'
import { ANIMALS, requiredAnimalName } from '../config'

test('upload photo when creating animal', async ({ authenticatedPage: page }) => {
  const animalName = requiredAnimalName(ANIMALS.photoUpload, 'ANIMALS.photoUpload')

  await navigateToCreateAnimal(page)
  await fillAnimalForm(page, ANIMALS.photoUpload)
  await uploadPhoto(page)

  await expect(page.getByTestId('photo-preview')).toBeVisible()

  await submitAnimalForm(page)

  await navigateToAnimalByName(page, animalName)
  await deleteCurrentAnimal(page)
})

test('delete photo before submitting', async ({ authenticatedPage: page }) => {
  await navigateToCreateAnimal(page)
  await fillAnimalForm(page, ANIMALS.createMinimum)
  await uploadPhoto(page)

  await expect(page.getByTestId('photo-preview')).toBeVisible()

  await deletePhoto(page)

  await expect(page.getByTestId('photo-preview')).not.toBeVisible()
})

test('upload photo in edit tab', async ({ authenticatedPage: page }) => {
  const animalName = requiredAnimalName(ANIMALS.photoEdit, 'ANIMALS.photoEdit')

  await createAnimal(page, ANIMALS.photoEdit)
  await navigateToAnimalByName(page, animalName)

  await navigateToEditTab(page)
  await uploadPhoto(page)

  await expect(page.getByTestId('photo-preview')).toBeVisible()

  await submitEditAnimalForm(page)

  await expect(page.getByTestId('animal-main-photo')).toBeVisible()

  await deleteCurrentAnimal(page)
})

test('upload multiple photos and set main', async ({ authenticatedPage: page }) => {
  await navigateToCreateAnimal(page)
  await fillAnimalForm(page, ANIMALS.createMinimum)
  await uploadPhoto(page, [TEST_PHOTO_PATH, TEST_PHOTO_PATH])

  await expect(page.getByTestId('photo-preview')).toBeVisible()
  await expect(page.getByTestId('set-main-photo-btn')).toBeVisible()

  await setMainPhoto(page)
})
