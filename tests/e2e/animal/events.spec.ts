import { test, expect } from '../fixtures'
import { createAnimal, navigateToAnimalByName, deleteCurrentAnimal } from '../handlers/animal.handler'
import { navigateToEvents, navigateToAnimalView, addEvent, editFirstEvent, deleteFirstEvent } from '../handlers/event.handler'

test('add event to animal', async ({ authenticatedPage: page }) => {
  await createAnimal(page, { name: 'EventTest E2E', species: 'Pies' })
  await navigateToAnimalByName(page, 'EventTest E2E')
  await navigateToEvents(page)

  await addEvent(page, { type: 'Spacer', date: '2024-05-01', description: 'Spacer testowy E2E' })

  await expect(page.getByTestId('events-table')).toContainText('Spacer')
  await expect(page.getByTestId('events-table')).toContainText('Spacer testowy E2E')

  // cleanup
  await navigateToAnimalView(page)
  await deleteCurrentAnimal(page)
})

test('edit event', async ({ authenticatedPage: page }) => {
  await createAnimal(page, { name: 'EditEventTest E2E', species: 'Kot' })
  await navigateToAnimalByName(page, 'EditEventTest E2E')
  await navigateToEvents(page)

  await addEvent(page, { type: 'Odrobaczenie', date: '2024-04-10', description: 'Pierwotny opis E2E' })
  await editFirstEvent(page, 'Zaktualizowany opis E2E')

  await expect(page.getByTestId('events-table')).toContainText('Zaktualizowany opis E2E')

  // cleanup
  await navigateToAnimalView(page)
  await deleteCurrentAnimal(page)
})

test('delete event', async ({ authenticatedPage: page }) => {
  await createAnimal(page, { name: 'DelEventTest E2E', species: 'Pies' })
  await navigateToAnimalByName(page, 'DelEventTest E2E')
  await navigateToEvents(page)

  await addEvent(page, { type: 'Szczepienie przeciw wściekliźnie', date: '2024-03-20', description: 'Szczepienie do usunięcia E2E' })
  await expect(page.getByTestId('events-table')).toContainText('Szczepienie do usunięcia E2E')

  await deleteFirstEvent(page)
  await expect(page.getByTestId('events-table')).not.toContainText('Szczepienie do usunięcia E2E')

  // cleanup
  await navigateToAnimalView(page)
  await deleteCurrentAnimal(page)
})
