import { AnimalFormPage } from '../pages/animal-form.page.ts'
import {
  AnimalEventsPage,
  AnimalHealthRecordsPage,
} from '../pages/animal-records.page.ts'
import { captureDownload, expectPdfDownload } from '../pages/components.ts'
import { PanelPage } from '../pages/panel.page.ts'
import { asCardDate, buildAnimal, daysAgo } from '../support/data.ts'
import {
  EMPTY_VALUE,
  SEX_LABEL,
  SHELTER_STATUS_LABEL,
  SPECIES_LABEL,
} from '../support/domain.ts'
import { expect, test } from '../support/fixtures.ts'

/**
 * The animal card at `/animal/:id`: the fact sheet, navigation to the other
 * tabs, the single-animal report and deleting the animal. The photo gallery
 * is covered in `animal-photos.spec.ts`.
 */

test.describe('Animal card', () => {
  test('shows everything known about the animal', async ({
    api,
    animalDetails,
    breadcrumbs,
  }) => {
    const animal = await api.createAnimal(
      buildAnimal({
        species: 'cat',
        sex: 'male',
        breed: 'Syjamski',
        color: 'Kremowy',
        distinguishingMarks: 'Niebieskie oczy',
        birthDate: daysAgo(1000),
      }),
    )

    await animalDetails.goto(animal.id)

    await expect(animalDetails.heading).toHaveText(animal.name!)
    await animalDetails.expectDetails({
      Gatunek: SPECIES_LABEL.cat,
      Płeć: SEX_LABEL.male,
      Sygnatura: animal.signature,
      Umaszczenie: 'Kremowy',
      Rasa: 'Syjamski',
      'Znaki szczególne': 'Niebieskie oczy',
      'Data urodzenia': asCardDate(daysAgo(1000)),
      'Data dodania': asCardDate(daysAgo(0)),
    })
    await expect(animalDetails.statusBadge).toHaveText(
      SHELTER_STATUS_LABEL.inShelter,
    )
    await breadcrumbs.expectTrail(['Lista Zwierząt', animal.name!])
  })

  test('marks missing optional data instead of leaving gaps', async ({
    api,
    animalDetails,
    breadcrumbs,
  }) => {
    const animal = await api.createAnimal({ species: 'dog' })

    await animalDetails.goto(animal.id)

    await expect(animalDetails.heading).toHaveText(EMPTY_VALUE.details)
    await animalDetails.expectDetails({
      Gatunek: SPECIES_LABEL.dog,
      Płeć: SEX_LABEL.unknown,
      Sygnatura: animal.signature,
      Umaszczenie: EMPTY_VALUE.details,
      Rasa: EMPTY_VALUE.details,
      'Znaki szczególne': EMPTY_VALUE.details,
      'Data urodzenia': '-',
    })
    await breadcrumbs.expectTrail(['Lista Zwierząt', 'Szczegóły zwierzęcia'])
  })

  test('shows when the animal is no longer in the shelter', async ({
    api,
    animalDetails,
  }) => {
    const animal = await api.createAnimal(buildAnimal())
    await api.addEvent(animal.id, {
      type: 'adoption',
      occurredOn: daysAgo(2),
      description: 'Nowy dom',
    })

    await animalDetails.goto(animal.id)

    await expect(animalDetails.statusBadge).toHaveText(
      SHELTER_STATUS_LABEL.outOfShelter,
    )
  })

  test('links to the edit form, events and medical records', async ({
    api,
    animalDetails,
    animalForm,
    events,
    healthRecords,
    breadcrumbs,
    page,
  }) => {
    const animal = await api.createAnimal(buildAnimal())
    const name = animal.name!

    await test.step('edit form', async () => {
      await animalDetails.goto(animal.id)
      await animalDetails.editLink.click()
      await expect(page).toHaveURL(
        new RegExp(`${AnimalFormPage.editPath(animal.id)}/?$`),
      )
      await expect(animalForm.saveButton).toBeVisible()
      await breadcrumbs.expectTrail([
        'Lista Zwierząt',
        name,
        'Edycja zwierzęcia',
      ])
    })

    await test.step('breadcrumb with the animal name leads back to the card', async () => {
      await breadcrumbs.link(name).click()
      await animalDetails.expectOpen(animal.id)
    })

    await test.step('events', async () => {
      await animalDetails.eventsLink.click()
      await expect(page).toHaveURL(
        new RegExp(`${AnimalEventsPage.path(animal.id)}/?$`),
      )
      await expect(events.heading).toBeVisible()
      await breadcrumbs.expectTrail(['Lista Zwierząt', name, 'Wydarzenia'])
      await breadcrumbs.link(name).click()
      await animalDetails.expectOpen(animal.id)
    })

    await test.step('medical records', async () => {
      await animalDetails.medicalLink.click()
      await expect(page).toHaveURL(
        new RegExp(`${AnimalHealthRecordsPage.path(animal.id)}/?$`),
      )
      await expect(healthRecords.heading).toBeVisible()
      await breadcrumbs.expectTrail(['Lista Zwierząt', name, 'Medyczne'])
    })

    await test.step('the first breadcrumb returns to the register', async () => {
      await breadcrumbs.link('Lista Zwierząt').click()
      await expect(page).toHaveURL(new RegExp(`${PanelPage.path}`))
    })
  })

  test('the header logo always leads back to the register', async ({
    api,
    animalDetails,
    auth,
    user,
    panel,
    page,
  }) => {
    const animal = await api.createAnimal(buildAnimal())
    await animalDetails.goto(animal.id)

    await auth.header
      .getByRole('link', { name: `Panel ${user.shelterName}` })
      .click()

    await expect(page).toHaveURL(new RegExp(`${PanelPage.path}`))
    await panel.expectLoaded()
  })

  test('"Pobierz raport" downloads a PDF about this animal', async ({
    api,
    animalDetails,
    page,
  }) => {
    const animal = await api.createAnimal(buildAnimal())
    await animalDetails.goto(animal.id)

    const reportRequest = page.waitForRequest((request) =>
      request.url().includes('/reports/animals/selected'),
    )
    const download = await captureDownload(page, () =>
      animalDetails.downloadReportButton.click(),
    )

    await expectPdfDownload(download)
    expect(
      new URL((await reportRequest).url()).searchParams.getAll('ids'),
    ).toEqual([animal.id])
    await expect(animalDetails.downloadReportButton).toBeEnabled()
  })
})

test.describe('Deleting an animal', () => {
  test('asks for confirmation and can be cancelled', async ({
    api,
    animalDetails,
  }) => {
    const animal = await api.createAnimal(buildAnimal())
    await animalDetails.goto(animal.id)

    await animalDetails.openDeleteDialog()
    await expect(animalDetails.deleteDialog).toContainText(
      `Czy na pewno chcesz usunąć ${animal.name}? Ta operacja jest nieodwracalna.`,
    )
    await animalDetails.cancelDeleteButton.click()

    await expect(animalDetails.deleteDialog).toBeHidden()
    await animalDetails.expectOpen(animal.id)
    expect(await api.getAnimalStatus(animal.id)).toBe(200)
  })

  test('removes the animal from the register once confirmed', async ({
    api,
    animalDetails,
    panel,
    page,
  }) => {
    const [doomed, survivor] = await api.createAnimals([
      buildAnimal(),
      buildAnimal(),
    ])
    await animalDetails.goto(doomed.id)

    await animalDetails.openDeleteDialog()
    await animalDetails.confirmDeleteButton.click()

    await expect(page).toHaveURL(new RegExp(`${PanelPage.path}`))
    await expect.poll(() => api.getAnimalStatus(doomed.id)).toBe(404)

    await test.step('it is gone from the register, others are untouched', async () => {
      await panel.search(doomed.name!)
      await panel.expectEmpty()
      await panel.search(survivor.name!)
      await panel.expectAnimals([survivor.name!])
    })
  })
})
