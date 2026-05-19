import { test, expect } from '../fixtures'
import {
  createAnimal,
  navigateToAnimalByName,
  deleteCurrentAnimal,
} from '../handlers/animal.handler'
import { ANIMALS } from '../config'

test('view animal details - all data visible', async ({
  authenticatedPage: page,
}) => {
  await createAnimal(page, ANIMALS.viewAllData)
  await navigateToAnimalByName(page, ANIMALS.viewAllData.name!)

  await expect(page.getByTestId('animal-name-heading')).toContainText(ANIMALS.viewAllData.name!)
  await expect(page.getByTestId('animal-breed')).toContainText(ANIMALS.viewAllData.breed!)
  await expect(page.getByTestId('animal-color')).toContainText(ANIMALS.viewAllData.color!)
  await expect(page.getByTestId('animal-distinguishing-marks')).toContainText(ANIMALS.viewAllData.distinguishingMarks!)
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
  await createAnimal(page, ANIMALS.viewTabs)
  await navigateToAnimalByName(page, ANIMALS.viewTabs.name!)
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
