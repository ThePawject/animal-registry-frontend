import { test, expect } from '../fixtures'
import {
  navigateToCreateAnimal,
  fillAnimalForm,
  submitAnimalForm,
  createAnimal,
  searchAnimalRowByName,
  navigateToAnimalByName,
  deleteCurrentAnimal,
} from '../handlers/animal.handler'
import { ANIMALS, requiredAnimalName } from '../config'

test('create animal - minimum required fields (species + signature)', async ({
  authenticatedPage: page,
}) => {
  await navigateToCreateAnimal(page)
  await fillAnimalForm(page, ANIMALS.createMinimum)
  await submitAnimalForm(page)

  await expect(page).toHaveURL(/localhost:3000\/?(\?.*)?$/)
})

test('create animal - all fields filled', async ({
  authenticatedPage: page,
}) => {
  await navigateToCreateAnimal(page)
  await fillAnimalForm(page, ANIMALS.createFull)
  await submitAnimalForm(page)

  await expect(page).toHaveURL(/localhost:3000\/?(\?.*)?$/)
})

test('created animal appears in the list', async ({
  authenticatedPage: page,
}) => {
  const animalName = requiredAnimalName(ANIMALS.createList, 'ANIMALS.createList')

  await createAnimal(page, ANIMALS.createList)

  const row = await searchAnimalRowByName(page, animalName)
  await expect(row).toBeVisible()

  await navigateToAnimalByName(page, animalName)
  await deleteCurrentAnimal(page)
})
