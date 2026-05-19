import { test, expect } from '../fixtures'
import {
  createAnimal,
  navigateToAnimalByName,
  deleteCurrentAnimal,
} from '../handlers/animal.handler'

test('view animal details - all data visible', async ({
  authenticatedPage: page,
}) => {
  await createAnimal(page, {
    name: 'PodgladTest E2E',
    species: 'Kot',
    sex: 'Samica',
    breed: 'Perski',
    color: 'Biały',
    distinguishingMarks: 'Czarny nos',
    birthDate: '2021-06-10',
  })
  await navigateToAnimalByName(page, 'PodgladTest E2E')

  await expect(page.getByTestId('animal-name-heading')).toContainText('PodgladTest E2E')
  await expect(page.getByTestId('animal-breed')).toContainText('Perski')
  await expect(page.getByTestId('animal-color')).toContainText('Biały')
  await expect(page.getByTestId('animal-distinguishing-marks')).toContainText('Czarny nos')
  await expect(page.getByTestId('edit-tab-link')).toBeVisible()
  await expect(page.getByTestId('events-tab-link')).toBeVisible()
  await expect(page.getByTestId('medical-records-tab-link')).toBeVisible()
  await expect(page.getByTestId('delete-animal-btn')).toBeVisible()

  // cleanup
  await deleteCurrentAnimal(page)
})

test('view animal - navigate between tabs', async ({
  authenticatedPage: page,
}) => {
  await createAnimal(page, { name: 'TabyTest E2E', species: 'Pies' })
  await navigateToAnimalByName(page, 'TabyTest E2E')
  const animalUrl = page.url()

  await page.getByTestId('events-tab-link').click()
  await expect(page).toHaveURL(/\/events/)

  await page.goto(animalUrl)
  await page.waitForLoadState('networkidle')

  await page.getByTestId('medical-records-tab-link').click()
  await expect(page).toHaveURL(/\/medical-records/)

  await page.goto(animalUrl)
  await page.waitForLoadState('networkidle')

  await page.getByTestId('edit-tab-link').click()
  await expect(page).toHaveURL(/\/edit/)

  // cleanup
  await page.goto(animalUrl)
  await page.waitForLoadState('networkidle')
  await deleteCurrentAnimal(page)
})
