import { test, expect } from '../fixtures'
import {
  createAnimal,
  navigateToAnimalByName,
  deleteCurrentAnimal,
  cancelDeleteAnimal,
  openDeleteAnimalDialog,
  confirmDeleteAnimal,
} from '../handlers/animal.handler'
import { ANIMALS, requiredAnimalName } from '../config'

test('delete animal - confirm in dialog', async ({
  authenticatedPage: page,
}) => {
  const animalName = requiredAnimalName(ANIMALS.deleteConfirm, 'ANIMALS.deleteConfirm')

  await createAnimal(page, ANIMALS.deleteConfirm)
  await navigateToAnimalByName(page, animalName)

  await openDeleteAnimalDialog(page)
  await expect(page.getByTestId('delete-dialog-title')).toBeVisible()
  await confirmDeleteAnimal(page)

  await expect(page).toHaveURL(/localhost:3000\/?(\?.*)?$/)
})

test('delete animal - cancel dialog does not delete', async ({
  authenticatedPage: page,
}) => {
  const animalName = requiredAnimalName(ANIMALS.deleteCancel, 'ANIMALS.deleteCancel')

  await createAnimal(page, ANIMALS.deleteCancel)
  await navigateToAnimalByName(page, animalName)

  const currentUrl = page.url()

  await cancelDeleteAnimal(page)

  await expect(page).toHaveURL(currentUrl)
  await expect(page.getByTestId('delete-animal-btn')).toBeVisible()

  await deleteCurrentAnimal(page)
})
