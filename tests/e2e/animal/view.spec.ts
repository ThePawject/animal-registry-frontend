import { test, expect } from '../fixtures'
import {
  createAnimal,
  navigateToAnimalByName,
  deleteCurrentAnimal,
  navigateToEditTab,
  navigateToAnimalView,
} from '../handlers/animal.handler'
import { navigateToEvents } from '../handlers/event.handler'
import { navigateToMedicalRecords } from '../handlers/health-record.handler'
import { ANIMALS, requiredAnimalName, requiredValue } from '../config'

test('view animal details - all data visible', async ({
  authenticatedPage: page,
}) => {
  const animalName = requiredAnimalName(ANIMALS.viewAllData, 'ANIMALS.viewAllData')
  const breed = requiredValue(ANIMALS.viewAllData.breed, 'ANIMALS.viewAllData.breed')
  const color = requiredValue(ANIMALS.viewAllData.color, 'ANIMALS.viewAllData.color')
  const distinguishingMarks = requiredValue(
    ANIMALS.viewAllData.distinguishingMarks,
    'ANIMALS.viewAllData.distinguishingMarks'
  )

  await createAnimal(page, ANIMALS.viewAllData)
  await navigateToAnimalByName(page, animalName)

  await expect(page.getByTestId('animal-name-heading')).toContainText(animalName)
  await expect(page.getByTestId('animal-breed')).toContainText(breed)
  await expect(page.getByTestId('animal-color')).toContainText(color)
  await expect(page.getByTestId('animal-distinguishing-marks')).toContainText(distinguishingMarks)
  await expect(page.getByTestId('edit-tab-link')).toBeVisible()
  await expect(page.getByTestId('events-tab-link')).toBeVisible()
  await expect(page.getByTestId('medical-records-tab-link')).toBeVisible()
  await expect(page.getByTestId('delete-animal-btn')).toBeVisible()

  await deleteCurrentAnimal(page)
})

test('view animal - navigate between tabs', async ({
  authenticatedPage: page,
}) => {
  const animalName = requiredAnimalName(ANIMALS.viewTabs, 'ANIMALS.viewTabs')

  await createAnimal(page, ANIMALS.viewTabs)
  await navigateToAnimalByName(page, animalName)

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
