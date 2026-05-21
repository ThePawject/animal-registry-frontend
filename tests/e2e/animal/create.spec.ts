import { test, expect } from '../fixtures'
import {
  navigateToCreateAnimal,
  fillAnimalForm,
  submitAnimalForm,
  createAnimal,
  navigateToAnimalByName,
  deleteCurrentAnimal,
} from '../handlers/animal.handler'
import { ANIMALS } from '../config'

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
  await createAnimal(page, ANIMALS.createList)

  await page.getByTestId('animal-search-input').fill(ANIMALS.createList.name!)
  await expect(page.getByTestId('animals-table').locator('tbody tr').filter({ hasText: ANIMALS.createList.name! }).first()).toBeVisible()

  await navigateToAnimalByName(page, ANIMALS.createList.name!)
  await deleteCurrentAnimal(page)
})
