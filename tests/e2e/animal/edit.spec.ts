import { test, expect } from '../fixtures'
import {
  createAnimal,
  navigateToAnimalByName,
  deleteCurrentAnimal,
  navigateToEditTab,
  submitEditAnimalForm,
  navigateToAnimalView,
  selectAnimalSpecies,
  selectAnimalSex,
} from '../handlers/animal.handler'
import { ANIMALS, EDIT_RESULTS, requiredAnimalName } from '../config'

test('edit animal - change name and breed', async ({
  authenticatedPage: page,
}) => {
  const animalName = requiredAnimalName(ANIMALS.editNameBreed, 'ANIMALS.editNameBreed')

  await createAnimal(page, ANIMALS.editNameBreed)
  await navigateToAnimalByName(page, animalName)

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
  const animalName = requiredAnimalName(ANIMALS.editSpeciesSex, 'ANIMALS.editSpeciesSex')

  await createAnimal(page, ANIMALS.editSpeciesSex)
  await navigateToAnimalByName(page, animalName)

  await navigateToEditTab(page)

  await selectAnimalSpecies(page, EDIT_RESULTS.speciesSex.species)
  await selectAnimalSex(page, EDIT_RESULTS.speciesSex.sex)

  await submitEditAnimalForm(page)

  await navigateToEditTab(page)
  await expect(page.getByTestId('species-select')).toContainText(EDIT_RESULTS.speciesSex.species)
  await expect(page.getByTestId('sex-select')).toContainText(EDIT_RESULTS.speciesSex.sex)

  await navigateToAnimalView(page)
  await deleteCurrentAnimal(page)
})
