import { test, expect } from '../fixtures'
import { createAnimal, navigateToAnimalByName, deleteCurrentAnimal } from '../handlers/animal.handler'
import { navigateToAnimalView } from '../handlers/event.handler'
import { navigateToMedicalRecords, addHealthRecord, editFirstHealthRecord, deleteFirstHealthRecord } from '../handlers/health-record.handler'

test('add health record', async ({ authenticatedPage: page }) => {
  await createAnimal(page, { name: 'MedTest E2E', species: 'Pies' })
  await navigateToAnimalByName(page, 'MedTest E2E')
  await navigateToMedicalRecords(page)

  await addHealthRecord(page, { date: '2024-05-15', description: 'Wizyta kontrolna E2E' })

  await expect(page.getByTestId('health-records-table')).toContainText('Wizyta kontrolna E2E')

  // cleanup
  await navigateToAnimalView(page)
  await deleteCurrentAnimal(page)
})

test('edit health record', async ({ authenticatedPage: page }) => {
  await createAnimal(page, { name: 'EditMedTest E2E', species: 'Kot' })
  await navigateToAnimalByName(page, 'EditMedTest E2E')
  await navigateToMedicalRecords(page)

  await addHealthRecord(page, { date: '2024-04-20', description: 'Pierwotna karta E2E' })
  await editFirstHealthRecord(page, 'Zaktualizowana karta E2E')

  await expect(page.getByTestId('health-records-table')).toContainText('Zaktualizowana karta E2E')

  // cleanup
  await navigateToAnimalView(page)
  await deleteCurrentAnimal(page)
})

test('delete health record', async ({ authenticatedPage: page }) => {
  await createAnimal(page, { name: 'DelMedTest E2E', species: 'Pies' })
  await navigateToAnimalByName(page, 'DelMedTest E2E')
  await navigateToMedicalRecords(page)

  await addHealthRecord(page, { date: '2024-03-10', description: 'Karta do usunięcia E2E' })
  await expect(page.getByTestId('health-records-table')).toContainText('Karta do usunięcia E2E')

  await deleteFirstHealthRecord(page)
  await expect(page.getByTestId('health-records-table')).not.toContainText('Karta do usunięcia E2E')

  // cleanup
  await navigateToAnimalView(page)
  await deleteCurrentAnimal(page)
})
