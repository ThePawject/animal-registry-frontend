import { test, expect } from '../fixtures'
import {
  createAnimal,
  navigateToAnimalByName,
  deleteCurrentAnimal,
} from '../handlers/animal.handler'
import { ANIMALS, EDIT_RESULTS } from '../config'

test('edit animal - change name and breed', async ({
  authenticatedPage: page,
}) => {
  await createAnimal(page, ANIMALS.editNameBreed)
  await navigateToAnimalByName(page, ANIMALS.editNameBreed.name!)

  await page.getByTestId('edit-tab-link').click()
  await page.waitForURL(/\/edit$/)
  await page.waitForLoadState('networkidle')

  await page.getByTestId('name-input').fill(EDIT_RESULTS.nameBreed.name)
  await page.getByTestId('breed-input').fill(EDIT_RESULTS.nameBreed.breed)

  await page.getByTestId('submit-edit-animal').click()
  await page.waitForURL(/\/animal\/[^/]+$/)
  await page.waitForLoadState('networkidle')

  await expect(page.getByTestId('animal-name-heading')).toContainText(EDIT_RESULTS.nameBreed.name)
  await expect(page.getByTestId('animal-breed')).toContainText(EDIT_RESULTS.nameBreed.breed)

  // cleanup
  await deleteCurrentAnimal(page)
})

test('edit animal - change species and sex', async ({
  authenticatedPage: page,
}) => {
  await createAnimal(page, ANIMALS.editSpeciesSex)
  await navigateToAnimalByName(page, ANIMALS.editSpeciesSex.name!)

  await page.getByTestId('edit-tab-link').click()
  await page.waitForURL(/\/edit$/)
  await page.waitForLoadState('networkidle')

  await page.getByTestId('species-select').click()
  await page.getByRole('option', { name: EDIT_RESULTS.speciesSex.species }).click()

  await page.getByTestId('sex-select').click()
  await page.getByRole('option', { name: EDIT_RESULTS.speciesSex.sex }).click()

  await page.getByTestId('submit-edit-animal').click()
  await page.waitForURL(/\/animal\/[^/]+$/)
  await page.waitForLoadState('networkidle')

  // verify via edit form selects
  await page.getByTestId('edit-tab-link').click()
  await page.waitForURL(/\/edit$/)
  await expect(page.getByTestId('species-select')).toContainText(EDIT_RESULTS.speciesSex.species)
  await expect(page.getByTestId('sex-select')).toContainText(EDIT_RESULTS.speciesSex.sex)

  // cleanup
  await page.goto(page.url().replace('/edit', ''))
  await page.waitForLoadState('networkidle')
  await deleteCurrentAnimal(page)
})
