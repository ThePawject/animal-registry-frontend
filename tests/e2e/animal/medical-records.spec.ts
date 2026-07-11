import { test, expect } from '../fixtures'
import { createAnimal, navigateToAnimalByName, deleteCurrentAnimal, navigateToAnimalView } from '../handlers/animal.handler'
import {
  navigateToMedicalRecords,
  addHealthRecord,
  editFirstHealthRecord,
  deleteFirstHealthRecord,
  findHealthRecordRowByDescription,
} from '../handlers/health-record.handler'
import { ANIMALS, HEALTH_RECORDS, requiredAnimalName, requiredValue } from '../config'

test('add health record', async ({ authenticatedPage: page }) => {
  const animalName = requiredAnimalName(ANIMALS.medRecordAdd, 'ANIMALS.medRecordAdd')

  await createAnimal(page, ANIMALS.medRecordAdd)
  await navigateToAnimalByName(page, animalName)
  await navigateToMedicalRecords(page)

  await addHealthRecord(page, HEALTH_RECORDS.add)

  await expect(page.getByTestId('health-records-table')).toContainText(HEALTH_RECORDS.add.description)

  await navigateToAnimalView(page)
  await deleteCurrentAnimal(page)
})

test('edit health record', async ({ authenticatedPage: page }) => {
  const animalName = requiredAnimalName(ANIMALS.medRecordEdit, 'ANIMALS.medRecordEdit')
  const editedDescription = requiredValue(HEALTH_RECORDS.edit.editedDescription, 'HEALTH_RECORDS.edit.editedDescription')

  await createAnimal(page, ANIMALS.medRecordEdit)
  await navigateToAnimalByName(page, animalName)
  await navigateToMedicalRecords(page)

  await addHealthRecord(page, HEALTH_RECORDS.edit)
  await editFirstHealthRecord(page, editedDescription)

  await expect(page.getByTestId('health-records-table')).toContainText(editedDescription)

  await navigateToAnimalView(page)
  await deleteCurrentAnimal(page)
})

test('delete health record', async ({ authenticatedPage: page }) => {
  const animalName = requiredAnimalName(ANIMALS.medRecordDelete, 'ANIMALS.medRecordDelete')

  await createAnimal(page, ANIMALS.medRecordDelete)
  await navigateToAnimalByName(page, animalName)
  await navigateToMedicalRecords(page)

  await addHealthRecord(page, HEALTH_RECORDS.delete)
  const healthRecordRow = await findHealthRecordRowByDescription(page, HEALTH_RECORDS.delete.description)
  await expect(healthRecordRow).toBeVisible()

  await deleteFirstHealthRecord(page)
  await expect(page.getByTestId('health-records-table')).not.toContainText(HEALTH_RECORDS.delete.description)

  await navigateToAnimalView(page)
  await deleteCurrentAnimal(page)
})
