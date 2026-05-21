import { test, expect } from '../fixtures'
import {
  createAnimal,
  navigateToAnimalByName,
  deleteCurrentAnimal,
  navigateToEditTab,
  submitEditAnimalForm,
} from '../handlers/animal.handler'
import { navigateToAnimalView } from '../handlers/event.handler'
import { ANIMALS, EDIT_RESULTS } from '../config'

test('edit animal - change name and breed', async ({
  authenticatedPage: page,
}) => {
  await createAnimal(page, ANIMALS.editNameBreed)
  await navigateToAnimalByName(page, ANIMALS.editNameBreed.name!)

  await navigateToEditTab(page)

  await page.getByTestId('name-input').fill(EDIT_RESULTS.nameBreed.name)
  await page.getByTestId('breed-input').fill(EDIT_RESULTS.nameBreed.breed)

  await submitEditAnimalForm(page)

  await expect(page.getByTestId('animal-name-heading')).toContainText(EDIT_RESULTS.nameBreed.name)
  await expect(page.getByTestId('animal-breed')).toContainText(EDIT_RESULTS.nameBreed.breed)

  await deleteCurrentAnimal(page)
})

test('edit animal - change species and sex', async ({
  authenticatedPage: page,
}) => {
  await createAnimal(page, ANIMALS.editSpeciesSex)
  await navigateToAnimalByName(page, ANIMALS.editSpeciesSex.name!)

  await navigateToEditTab(page)

  await page.getByTestId('species-select').click()
  await page.getByRole('option', { name: EDIT_RESULTS.speciesSex.species }).click()

  await page.getByTestId('sex-select').click()
  await page.getByRole('option', { name: EDIT_RESULTS.speciesSex.sex }).click()

  await submitEditAnimalForm(page)

  await navigateToEditTab(page)
  await expect(page.getByTestId('species-select')).toContainText(EDIT_RESULTS.speciesSex.species)
  await expect(page.getByTestId('sex-select')).toContainText(EDIT_RESULTS.speciesSex.sex)

  await navigateToAnimalView(page)
  await deleteCurrentAnimal(page)
})
