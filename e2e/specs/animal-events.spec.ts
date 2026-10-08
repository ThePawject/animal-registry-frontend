import { EVENT_COLUMN, RECORD_ERRORS } from '../pages/animal-records.page.ts'
import { chooseOption, expectOptions } from '../pages/components.ts'
import {
  asTableDate,
  buildAnimal,
  daysAgo,
  tomorrow,
  unique,
} from '../support/data.ts'
import {
  EVENT_TYPE,
  EVENT_TYPE_LABEL,
  GENERIC_ERROR_MESSAGE,
  SHELTER_STATUS_LABEL,
} from '../support/domain.ts'
import { expect, test } from '../support/fixtures.ts'
import { failBackendRequests } from '../support/network.ts'
import { createColleagueOf } from '../support/users.ts'
import type { SeededAnimal } from '../support/api-client.ts'

const EVENT_TYPE_PLACEHOLDER = 'Wybierz typ wydarzenia'

test.describe('Animal events', () => {
  let animal: SeededAnimal

  test.beforeEach(async ({ api }) => {
    animal = await api.createAnimal(buildAnimal())
  })

  test('a new animal has no events yet', async ({ events }) => {
    await events.goto(animal.id)

    await events.expectEmpty()
    await expect(events.addForm).toBeHidden()
  })

  test('an event can be added and is attributed to the signed-in user', async ({
    events,
    api,
    user,
  }) => {
    const event = {
      type: 'deworming',
      occurredOn: daysAgo(4),
      description: unique('Tabletka na odrobaczenie'),
    } as const
    await events.goto(animal.id)

    await events.addEvent(event)

    const row = events.row(event.description)
    await expect(row.cell(EVENT_COLUMN.date)).toHaveText(
      asTableDate(event.occurredOn),
    )
    await expect(row.cell(EVENT_COLUMN.type)).toHaveText(
      EVENT_TYPE_LABEL.deworming,
    )
    await expect(row.cell(EVENT_COLUMN.description)).toHaveText(
      event.description,
    )
    await expect(row.cell(EVENT_COLUMN.performedBy)).toHaveText(user.email)
    await expect(events.rows).toHaveCount(1)

    const stored = await api.getAnimal(animal.id)
    expect(stored.events).toHaveLength(1)
    expect(stored.events[0]).toMatchObject({
      type: EVENT_TYPE.deworming,
      description: event.description,
      performedBy: user.email,
    })
  })

  test('the add form offers every event type and defaults to today', async ({
    events,
  }) => {
    await events.goto(animal.id)
    await events.openAddForm()

    await expect(events.dateField.input).toHaveValue(daysAgo(0))
    await expect(events.typeField.select).toHaveText(EVENT_TYPE_PLACEHOLDER)
    await expectOptions(
      events.typeField.select,
      Object.values(EVENT_TYPE_LABEL),
    )
  })

  test('the add form validates type, date and description', async ({
    events,
    api,
  }) => {
    await events.goto(animal.id)
    await events.openAddForm()

    await test.step('type and description are required', async () => {
      await events.saveButton.click()
      await expect(events.typeField.error).toHaveText(
        RECORD_ERRORS.eventTypeRequired,
      )
      await expect(events.descriptionField.error).toHaveText(
        RECORD_ERRORS.descriptionRequired,
      )
    })

    await test.step('a description of only spaces does not count', async () => {
      await events.descriptionField.input.fill('   ')
      await expect(events.descriptionField.error).toHaveText(
        RECORD_ERRORS.descriptionRequired,
      )
    })

    await test.step('the date is required and cannot be in the future', async () => {
      await events.dateField.input.fill(tomorrow())
      await expect(events.dateField.error).toHaveText(
        RECORD_ERRORS.eventDateInFuture,
      )
      await events.dateField.input.fill('')
      await expect(events.dateField.error).toHaveText(
        RECORD_ERRORS.eventDateRequired,
      )
    })

    await test.step('nothing was saved', async () => {
      await events.saveButton.click()
      await expect(events.addForm).toBeVisible()
      expect((await api.getAnimal(animal.id)).events).toHaveLength(0)
    })
  })

  test('the add form can be cancelled and starts clean next time', async ({
    events,
  }) => {
    await events.goto(animal.id)
    await events.openAddForm()
    await events.fillAddForm({ type: 'walk', description: 'Do wyrzucenia' })

    await events.cancelButton.click()

    await expect(events.addForm).toBeHidden()
    await events.expectEmpty()

    await events.openAddForm()
    await expect(events.descriptionField.input).toHaveValue('')
    await expect(events.typeField.select).toHaveText(EVENT_TYPE_PLACEHOLDER)
  })

  test('a failed save is reported and keeps the form open', async ({
    events,
    page,
  }) => {
    await failBackendRequests(page, {
      method: 'POST',
      pathname: `/animals/${animal.id}/events`,
    })
    await events.goto(animal.id)
    await events.openAddForm()
    await events.fillAddForm({ type: 'walk', description: 'Nie zapisze sie' })

    await events.saveButton.click()

    await expect(events.addForm.getByText(GENERIC_ERROR_MESSAGE)).toBeVisible()
    await expect(events.descriptionField.input).toHaveValue('Nie zapisze sie')
  })
})

test.describe('Editing and deleting events', () => {
  let animal: SeededAnimal
  const original = {
    type: 'walk',
    occurredOn: daysAgo(5),
    description: 'Spacer po lesie',
  } as const

  test.beforeEach(async ({ api, events }) => {
    animal = await api.createAnimal(buildAnimal())
    await api.addEvent(animal.id, original)
    await api.addEvent(animal.id, {
      type: 'weighing',
      occurredOn: daysAgo(2),
      description: 'Inne wydarzenie',
    })
    await events.goto(animal.id)
  })

  test('an event is edited in place', async ({ events, api }) => {
    const description = unique('Spacer nad rzeka')
    const editor = await events.edit(original.description)

    await test.step('the editor starts with the current values', async () => {
      await expect(editor.dateInput).toHaveValue(original.occurredOn)
      await expect(editor.descriptionInput).toHaveValue(original.description)
      await expect(editor.typeSelect).toHaveText(EVENT_TYPE_LABEL.walk)
    })

    await chooseOption(editor.typeSelect, EVENT_TYPE_LABEL.condition)
    await editor.dateInput.fill(daysAgo(6))
    await editor.descriptionInput.fill(description)
    await events.saveEdit()

    const row = events.row(description)
    await expect(row.cell(EVENT_COLUMN.date)).toHaveText(
      asTableDate(daysAgo(6)),
    )
    await expect(row.cell(EVENT_COLUMN.type)).toHaveText(
      EVENT_TYPE_LABEL.condition,
    )
    await expect(events.rows).toHaveCount(2)
    await expect(events.row(original.description).root).toHaveCount(0)

    const stored = await api.getAnimal(animal.id)
    expect(stored.events.map((event) => event.description).sort()).toEqual(
      ['Inne wydarzenie', description].sort(),
    )
  })

  test('cancelling an edit leaves the event untouched', async ({
    events,
    api,
  }) => {
    const editor = await events.edit(original.description)
    await editor.descriptionInput.fill('Zmiana, ktorej nie bedzie')

    await events.cancelEdit()

    await expect(events.row(original.description).root).toBeVisible()
    const stored = await api.getAnimal(animal.id)
    expect(stored.events.map((event) => event.description)).toContain(
      original.description,
    )
  })

  test('only one event is edited at a time', async ({ events }) => {
    await events.edit(original.description)
    await expect(events.rows).toHaveCount(2)

    await events.row('Inne wydarzenie').editButton.click()

    await expect(events.editingRow.root).toHaveCount(1)
    await expect(events.editingRow.descriptionInput).toHaveValue(
      'Inne wydarzenie',
    )
    await expect(events.row(original.description).root).toBeVisible()
  })

  test('an edit cannot move the event into the future', async ({
    events,
    api,
  }) => {
    const editor = await events.edit(original.description)

    await editor.dateInput.fill(tomorrow())

    await expect(
      events.inlineError(RECORD_ERRORS.eventDateInFuture),
    ).toBeVisible()

    await editor.saveButton.click()
    await expect(editor.saveButton).toBeVisible()
    const stored = await api.getAnimal(animal.id)
    expect(
      stored.events.find((event) => event.description === original.description)
        ?.occurredOn,
    ).toContain(original.occurredOn)
  })

  test('deleting asks for confirmation and can be cancelled', async ({
    events,
    api,
  }) => {
    await events.requestDelete(original.description)
    await expect(events.deleteDialog).toContainText(
      'Czy na pewno chcesz usunąć to wydarzenie?',
    )

    await events.cancelDeleteButton.click()

    await expect(events.deleteDialog).toBeHidden()
    await expect(events.rows).toHaveCount(2)
    expect((await api.getAnimal(animal.id)).events).toHaveLength(2)
  })

  test('a confirmed delete removes only that event', async ({
    events,
    api,
  }) => {
    await events.requestDelete(original.description)
    await events.confirmDelete()

    await expect(events.row(original.description).root).toHaveCount(0)
    await expect(events.rows).toHaveCount(1)
    await expect(events.row('Inne wydarzenie').root).toBeVisible()
    await expect
      .poll(async () => (await api.getAnimal(animal.id)).events.length)
      .toBe(1)
  })
})

test.describe('Sorting events', () => {
  test('newest first by default, sortable by date and type', async ({
    api,
    events,
  }) => {
    const animal = await api.createAnimal(buildAnimal())
    await api.addEvent(animal.id, {
      type: 'walk',
      occurredOn: daysAgo(5),
      description: 'srodkowe',
    })
    await api.addEvent(animal.id, {
      type: 'weighing',
      occurredOn: daysAgo(9),
      description: 'najstarsze',
    })
    await api.addEvent(animal.id, {
      type: 'deworming',
      occurredOn: daysAgo(1),
      description: 'najnowsze',
    })
    await events.goto(animal.id)

    await test.step('default: newest first', async () => {
      await events.expectSortedBy('Data wydarzenia', 'descending')
      await events.expectColumn(EVENT_COLUMN.description, [
        'najnowsze',
        'srodkowe',
        'najstarsze',
      ])
    })

    await test.step('by date, oldest first', async () => {
      await events.sortBy('Data wydarzenia', 'ascending')
      await events.expectColumn(EVENT_COLUMN.description, [
        'najstarsze',
        'srodkowe',
        'najnowsze',
      ])
    })

    await test.step('by type, alphabetically', async () => {
      await events.sortBy('Typ wydarzenia', 'ascending')
      await events.expectSortedBy('Data wydarzenia', 'none')
      await events.expectColumn(EVENT_COLUMN.type, [
        EVENT_TYPE_LABEL.deworming,
        EVENT_TYPE_LABEL.walk,
        EVENT_TYPE_LABEL.weighing,
      ])

      await events.sortBy('Typ wydarzenia', 'descending')
      await events.expectColumn(EVENT_COLUMN.type, [
        EVENT_TYPE_LABEL.weighing,
        EVENT_TYPE_LABEL.walk,
        EVENT_TYPE_LABEL.deworming,
      ])
    })
  })
})

test.describe('Events of a shared shelter', () => {
  test('show who recorded each event and sort by that person', async ({
    api,
    apiFor,
    user,
    events,
  }) => {
    const animal = await api.createAnimal(buildAnimal())
    const first = await apiFor(createColleagueOf(user, 'aaa'))
    const last = await apiFor(createColleagueOf(user, 'zzz'))
    await last.addEvent(animal.id, {
      type: 'walk',
      occurredOn: daysAgo(1),
      description: 'Wpis ostatniej osoby',
    })
    await first.addEvent(animal.id, {
      type: 'walk',
      occurredOn: daysAgo(2),
      description: 'Wpis pierwszej osoby',
    })

    await events.goto(animal.id)

    await expect(
      events.row('Wpis pierwszej osoby').cell(EVENT_COLUMN.performedBy),
    ).toHaveText(first.user.email)
    await expect(
      events.row('Wpis ostatniej osoby').cell(EVENT_COLUMN.performedBy),
    ).toHaveText(last.user.email)

    await events.sortBy('Wykonane przez', 'ascending')
    await events.expectColumn(EVENT_COLUMN.performedBy, [
      first.user.email,
      last.user.email,
    ])

    await events.sortBy('Wykonane przez', 'descending')
    await events.expectColumn(EVENT_COLUMN.performedBy, [
      last.user.email,
      first.user.email,
    ])
  })
})

test.describe('Events and shelter status', () => {
  test('leaving and returning events move the animal out of and back into the shelter', async ({
    api,
    events,
    animalDetails,
  }) => {
    const animal = await api.createAnimal(buildAnimal())

    await test.step('an adoption marks the animal as out of the shelter', async () => {
      await events.goto(animal.id)
      await events.addEvent({
        type: 'adoption',
        occurredOn: daysAgo(3),
        description: 'Adopcja przez nowa rodzine',
      })
      await animalDetails.goto(animal.id)
      await expect(animalDetails.statusBadge).toHaveText(
        SHELTER_STATUS_LABEL.outOfShelter,
      )
    })

    await test.step('a later admission brings it back', async () => {
      await events.goto(animal.id)
      await events.addEvent({
        type: 'admission',
        occurredOn: daysAgo(1),
        description: 'Zwrot z adopcji',
      })
      await animalDetails.goto(animal.id)
      await expect(animalDetails.statusBadge).toHaveText(
        SHELTER_STATUS_LABEL.inShelter,
      )
    })
  })

  test('removing the event that took the animal out restores its status', async ({
    api,
    events,
    animalDetails,
  }) => {
    const animal = await api.createAnimal(buildAnimal())
    await api.addEvent(animal.id, {
      type: 'pickedUpByOwner',
      occurredOn: daysAgo(2),
      description: 'Odbior pomylkowy',
    })
    await animalDetails.goto(animal.id)
    await expect(animalDetails.statusBadge).toHaveText(
      SHELTER_STATUS_LABEL.outOfShelter,
    )

    await events.goto(animal.id)
    await events.requestDelete('Odbior pomylkowy')
    await events.confirmDelete()
    await events.expectEmpty()

    await animalDetails.goto(animal.id)
    await expect(animalDetails.statusBadge).toHaveText(
      SHELTER_STATUS_LABEL.inShelter,
    )
  })

  test('routine events do not affect the status', async ({
    api,
    events,
    animalDetails,
  }) => {
    const animal = await api.createAnimal(buildAnimal())
    await events.goto(animal.id)

    await events.addEvent({
      type: 'rabiesVaccination',
      occurredOn: daysAgo(1),
      description: 'Szczepienie okresowe',
    })

    await animalDetails.goto(animal.id)
    await expect(animalDetails.statusBadge).toHaveText(
      SHELTER_STATUS_LABEL.inShelter,
    )
  })
})
