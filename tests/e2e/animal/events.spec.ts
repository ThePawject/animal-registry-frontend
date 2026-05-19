import { test, expect } from '../fixtures'
import { createAnimal, navigateToAnimalByName, deleteCurrentAnimal } from '../handlers/animal.handler'
import { navigateToEvents, navigateToAnimalView, addEvent, editFirstEvent, deleteFirstEvent } from '../handlers/event.handler'
import { ANIMALS, EVENTS } from '../config'

test('add event to animal', async ({ authenticatedPage: page }) => {
  await createAnimal(page, ANIMALS.eventAdd)
  await navigateToAnimalByName(page, ANIMALS.eventAdd.name!)
  await navigateToEvents(page)

  await addEvent(page, EVENTS.add)

  await expect(page.getByTestId('events-table')).toContainText(EVENTS.add.type)
  await expect(page.getByTestId('events-table')).toContainText(EVENTS.add.description)

  // cleanup
  await navigateToAnimalView(page)
  await deleteCurrentAnimal(page)
})

test('edit event', async ({ authenticatedPage: page }) => {
  await createAnimal(page, ANIMALS.eventEdit)
  await navigateToAnimalByName(page, ANIMALS.eventEdit.name!)
  await navigateToEvents(page)

  await addEvent(page, EVENTS.edit)
  await editFirstEvent(page, EVENTS.edit.editedDescription!)

  await expect(page.getByTestId('events-table')).toContainText(EVENTS.edit.editedDescription!)

  // cleanup
  await navigateToAnimalView(page)
  await deleteCurrentAnimal(page)
})

test('delete event', async ({ authenticatedPage: page }) => {
  await createAnimal(page, ANIMALS.eventDelete)
  await navigateToAnimalByName(page, ANIMALS.eventDelete.name!)
  await navigateToEvents(page)

  await addEvent(page, EVENTS.delete)
  await expect(page.getByTestId('events-table')).toContainText(EVENTS.delete.description)

  await deleteFirstEvent(page)
  await expect(page.getByTestId('events-table')).not.toContainText(EVENTS.delete.description)

  // cleanup
  await navigateToAnimalView(page)
  await deleteCurrentAnimal(page)
})
