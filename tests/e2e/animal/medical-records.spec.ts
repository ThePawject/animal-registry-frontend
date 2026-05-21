import { test, expect } from '../fixtures'
import { createAnimal, navigateToAnimalByName, deleteCurrentAnimal } from '../handlers/animal.handler'
import { navigateToAnimalView } from '../handlers/event.handler'
import { navigateToMedicalRecords, addHealthRecord, editFirstHealthRecord, deleteFirstHealthRecord } from '../handlers/health-record.handler'
import { ANIMALS, HEALTH_RECORDS } from '../config'

test('add health record', async ({ authenticatedPage: page }) => {
  await createAnimal(page, ANIMALS.medRecordAdd)
  await navigateToAnimalByName(page, ANIMALS.medRecordAdd.name!)
  await navigateToMedicalRecords(page)

  await addHealthRecord(page, HEALTH_RECORDS.add)

  await expect(page.getByTestId('health-records-table')).toContainText(HEALTH_RECORDS.add.description)

  await navigateToAnimalView(page)
  await deleteCurrentAnimal(page)
})

test('edit health record', async ({ authenticatedPage: page }) => {
  await createAnimal(page, ANIMALS.medRecordEdit)
  await navigateToAnimalByName(page, ANIMALS.medRecordEdit.name!)
  await navigateToMedicalRecords(page)

  await addHealthRecord(page, HEALTH_RECORDS.edit)
  await editFirstHealthRecord(page, HEALTH_RECORDS.edit.editedDescription!)

  await expect(page.getByTestId('health-records-table')).toContainText(HEALTH_RECORDS.edit.editedDescription!)

  await navigateToAnimalView(page)
  await deleteCurrentAnimal(page)
})

test('delete health record', async ({ authenticatedPage: page }) => {
  await createAnimal(page, ANIMALS.medRecordDelete)
  await navigateToAnimalByName(page, ANIMALS.medRecordDelete.name!)
  await navigateToMedicalRecords(page)

  await addHealthRecord(page, HEALTH_RECORDS.delete)
  await expect(page.getByTestId('health-records-table')).toContainText(HEALTH_RECORDS.delete.description)

  await deleteFirstHealthRecord(page)
  await expect(page.getByTestId('health-records-table')).not.toContainText(HEALTH_RECORDS.delete.description)

  await navigateToAnimalView(page)
  await deleteCurrentAnimal(page)
})
