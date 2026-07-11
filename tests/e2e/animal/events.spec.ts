import { test, expect } from '../fixtures'
import { createAnimal, navigateToAnimalByName, deleteCurrentAnimal, navigateToAnimalView } from '../handlers/animal.handler'
import { navigateToEvents, addEvent, editFirstEvent, deleteEventByDescription, findEventRowByDescription } from '../handlers/event.handler'
import { ANIMALS, EVENTS, requiredAnimalName, requiredValue } from '../config'

test('add event to animal', async ({ authenticatedPage: page }) => {
  const animalName = requiredAnimalName(ANIMALS.eventAdd, 'ANIMALS.eventAdd')

  await createAnimal(page, ANIMALS.eventAdd)
  await navigateToAnimalByName(page, animalName)
  await navigateToEvents(page)

  await addEvent(page, EVENTS.add)

  await expect(page.getByTestId('events-table')).toContainText(EVENTS.add.type)
  await expect(page.getByTestId('events-table')).toContainText(EVENTS.add.description)

  // cleanup
  await navigateToAnimalView(page)
  await deleteCurrentAnimal(page)
})

test('edit event', async ({ authenticatedPage: page }) => {
  const animalName = requiredAnimalName(ANIMALS.eventEdit, 'ANIMALS.eventEdit')
  const editedDescription = requiredValue(EVENTS.edit.editedDescription, 'EVENTS.edit.editedDescription')

  await createAnimal(page, ANIMALS.eventEdit)
  await navigateToAnimalByName(page, animalName)
  await navigateToEvents(page)

  await addEvent(page, EVENTS.edit)
  await editFirstEvent(page, editedDescription)

  await expect(page.getByTestId('events-table')).toContainText(editedDescription)

  // cleanup
  await navigateToAnimalView(page)
  await deleteCurrentAnimal(page)
})

test('delete event', async ({ authenticatedPage: page }) => {
  const animalName = requiredAnimalName(ANIMALS.eventDelete, 'ANIMALS.eventDelete')

  await createAnimal(page, ANIMALS.eventDelete)
  await navigateToAnimalByName(page, animalName)
  await navigateToEvents(page)

  await addEvent(page, EVENTS.delete)

  const eventRow = await findEventRowByDescription(page, EVENTS.delete.description)
  await expect(eventRow).toBeVisible()
  await deleteEventByDescription(page, EVENTS.delete.description)

  await expect(page.getByTestId('events-table')).not.toContainText(EVENTS.delete.description)

  await navigateToAnimalView(page)
  await deleteCurrentAnimal(page)
})
