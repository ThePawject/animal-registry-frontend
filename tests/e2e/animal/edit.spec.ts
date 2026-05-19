import { test, expect } from '../fixtures'
import {
  createAnimal,
  navigateToAnimalByName,
  deleteCurrentAnimal,
} from '../handlers/animal.handler'

test('edit animal - change name and breed', async ({
  authenticatedPage: page,
}) => {
  await createAnimal(page, { name: 'DoEdycji E2E', species: 'Pies' })
  await navigateToAnimalByName(page, 'DoEdycji E2E')

  await page.getByTestId('edit-tab-link').click()
  await page.waitForURL(/\/edit$/)
  await page.waitForLoadState('networkidle')

  await page.getByTestId('name-input').fill('ZEdytowany E2E')
  await page.getByTestId('breed-input').fill('Labrador')

  await page.getByTestId('submit-edit-animal').click()
  await page.waitForURL(/\/animal\/[^/]+$/, { timeout: 15000 })
  await page.waitForLoadState('networkidle')

  await expect(page.getByTestId('animal-name-heading')).toContainText('ZEdytowany E2E')
  await expect(page.getByTestId('animal-breed')).toContainText('Labrador')

  // cleanup
  await deleteCurrentAnimal(page)
})

test('edit animal - change species and sex', async ({
  authenticatedPage: page,
}) => {
  await createAnimal(page, { name: 'ZmienGatunek E2E', species: 'Pies', sex: 'Samiec' })
  await navigateToAnimalByName(page, 'ZmienGatunek E2E')

  await page.getByTestId('edit-tab-link').click()
  await page.waitForURL(/\/edit$/)
  await page.waitForLoadState('networkidle')

  await page.getByTestId('species-select').click()
  await page.getByRole('option', { name: 'Kot' }).click()

  await page.getByTestId('sex-select').click()
  await page.getByRole('option', { name: 'Samica' }).click()

  await page.getByTestId('submit-edit-animal').click()
  await page.waitForURL(/\/animal\/[^/]+$/, { timeout: 15000 })
  await page.waitForLoadState('networkidle')

  // verify via edit form selects
  await page.getByTestId('edit-tab-link').click()
  await page.waitForURL(/\/edit$/)
  await expect(page.getByTestId('species-select')).toContainText('Kot')
  await expect(page.getByTestId('sex-select')).toContainText('Samica')

  // cleanup
  await page.goto(page.url().replace('/edit', ''))
  await page.waitForLoadState('networkidle')
  await deleteCurrentAnimal(page)
})
