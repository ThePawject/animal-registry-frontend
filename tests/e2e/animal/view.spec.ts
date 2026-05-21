import { test, expect } from '../fixtures'
import {
  createAnimal,
  navigateToAnimalByName,
  deleteCurrentAnimal,
  navigateToEditTab,
} from '../handlers/animal.handler'
import { navigateToEvents, navigateToAnimalView } from '../handlers/event.handler'
import { navigateToMedicalRecords } from '../handlers/health-record.handler'
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

  await deleteCurrentAnimal(page)
})

test('view animal - navigate between tabs', async ({
  authenticatedPage: page,
}) => {
  await createAnimal(page, ANIMALS.viewTabs)
  await navigateToAnimalByName(page, ANIMALS.viewTabs.name!)

  await navigateToEvents(page)
  await expect(page).toHaveURL(/\/events/)

  await navigateToAnimalView(page)

  await navigateToMedicalRecords(page)
  await expect(page).toHaveURL(/\/medical-records/)

  await navigateToAnimalView(page)

  await navigateToEditTab(page)
  await expect(page).toHaveURL(/\/edit/)

  await navigateToAnimalView(page)
  await deleteCurrentAnimal(page)
})
