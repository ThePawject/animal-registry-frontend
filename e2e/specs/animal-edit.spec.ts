import { URLS } from '../config/env.ts'
import {
  ANIMAL_FORM_ERRORS,
  AnimalFormPage,
} from '../pages/animal-form.page.ts'
import {
  asCardDate,
  buildAnimal,
  daysAgo,
  tomorrow,
  unique,
} from '../support/data.ts'
import {
  EMPTY_VALUE,
  GENERIC_ERROR_MESSAGE,
  SEX,
  SEX_LABEL,
  SPECIES,
  SPECIES_LABEL,
} from '../support/domain.ts'
import { expect, test } from '../support/fixtures.ts'

const ORIGINAL = {
  species: 'dog',
  sex: 'male',
  breed: 'Kundel',
  color: 'Brązowy',
  distinguishingMarks: 'Krótki ogon',
  transponderCode: '616093900011111',
  birthDate: daysAgo(500),
} as const

test.describe('Editing an animal', () => {
  test('opens with the stored data', async ({
    api,
    animalForm,
    breadcrumbs,
  }) => {
    const animal = await api.createAnimal(buildAnimal(ORIGINAL))

    await animalForm.gotoEdit(animal.id)

    await animalForm.expectValues({
      ...ORIGINAL,
      name: animal.name,
      signature: animal.signature,
    })
    await breadcrumbs.expectTrail([
      'Lista Zwierząt',
      animal.name!,
      'Edycja zwierzęcia',
    ])
  })

  test('can only be saved once something actually changed', async ({
    api,
    animalForm,
  }) => {
    const animal = await api.createAnimal(buildAnimal(ORIGINAL))
    await animalForm.gotoEdit(animal.id)

    await expect(animalForm.saveButton).toBeDisabled()

    await animalForm.color.fill('Czarny')
    await expect(animalForm.saveButton).toBeEnabled()

    await animalForm.color.fill(ORIGINAL.color)
    await expect(animalForm.saveButton).toBeDisabled()
  })

  test('saves changes to every field', async ({
    api,
    animalForm,
    animalDetails,
  }) => {
    const animal = await api.createAnimal(buildAnimal(ORIGINAL))
    const changes = {
      name: unique('Zmieniony'),
      transponderCode: '616093900099999',
      species: 'cat',
      breed: 'Brytyjski',
      distinguishingMarks: 'Złote oczy',
      sex: 'female',
      color: 'Niebieski',
      birthDate: daysAgo(300),
    } as const

    await animalForm.gotoEdit(animal.id)
    await animalForm.fill(changes)
    await animalForm.submitSave()

    await animalDetails.expectOpen(animal.id)
    await expect(animalDetails.heading).toHaveText(changes.name)
    await animalDetails.expectDetails({
      Gatunek: SPECIES_LABEL.cat,
      Płeć: SEX_LABEL.female,
      Sygnatura: animal.signature,
      Umaszczenie: changes.color,
      Rasa: changes.breed,
      'Znaki szczególne': changes.distinguishingMarks,
      'Data urodzenia': asCardDate(changes.birthDate),
    })

    await test.step('the changes are persisted', async () => {
      expect(await api.getAnimal(animal.id)).toMatchObject({
        name: changes.name,
        transponderCode: changes.transponderCode,
        species: SPECIES.cat,
        sex: SEX.female,
        breed: changes.breed,
        color: changes.color,
        distinguishingMarks: changes.distinguishingMarks,
        signature: animal.signature,
      })
    })

    await test.step('and offered again on the next edit', async () => {
      await animalForm.gotoEdit(animal.id)
      await animalForm.expectValues(changes)
    })
  })

  test('optional data can be cleared again', async ({
    api,
    animalForm,
    animalDetails,
  }) => {
    const animal = await api.createAnimal(buildAnimal(ORIGINAL))

    await animalForm.gotoEdit(animal.id)
    await animalForm.fill({
      name: '',
      transponderCode: '',
      breed: '',
      distinguishingMarks: '',
      color: '',
      birthDate: '',
    })
    await animalForm.submitSave()

    await animalDetails.expectOpen(animal.id)
    await expect(animalDetails.heading).toHaveText(EMPTY_VALUE.details)
    await animalDetails.expectDetails({
      Umaszczenie: EMPTY_VALUE.details,
      Rasa: EMPTY_VALUE.details,
      'Znaki szczególne': EMPTY_VALUE.details,
      'Data urodzenia': '-',
    })
    expect(await api.getAnimal(animal.id)).toMatchObject({
      name: null,
      transponderCode: null,
      birthDate: null,
    })
  })

  test('the updated animal shows up changed in the register', async ({
    api,
    animalForm,
    animalDetails,
    panel,
  }) => {
    const animal = await api.createAnimal(buildAnimal())
    const newName = unique('Przemianowany')

    await animalForm.gotoEdit(animal.id)
    await animalForm.fill({ name: newName, breed: 'Owczarek' })
    await animalForm.submitSave()
    await animalDetails.expectOpen(animal.id)

    await panel.goto()
    await panel.search(newName)
    await expect(panel.row(newName).cell('Rasa')).toHaveText('Owczarek')

    await panel.search(animal.name!)
    await panel.expectEmpty()
  })

  test('"Anuluj" discards the changes', async ({
    api,
    animalForm,
    animalDetails,
  }) => {
    const animal = await api.createAnimal(buildAnimal(ORIGINAL))

    await animalForm.gotoEdit(animal.id)
    await animalForm.fill({ name: unique('Niezapisany'), color: 'Zielony' })
    await animalForm.cancelButton.click()

    await animalDetails.expectOpen(animal.id)
    await expect(animalDetails.heading).toHaveText(animal.name!)
    await animalDetails.expectDetails({ Umaszczenie: ORIGINAL.color })
    expect(await api.getAnimal(animal.id)).toMatchObject({
      name: animal.name,
      color: ORIGINAL.color,
    })
  })
})

test.describe('Changing the signature', () => {
  test('a new unique signature can be generated', async ({
    api,
    animalForm,
    animalDetails,
  }) => {
    const animal = await api.createAnimal(buildAnimal())

    await animalForm.gotoEdit(animal.id)
    const { previous, generated } = await animalForm.generateSignature()
    expect(previous).toBe(animal.signature)
    expect(generated).not.toBe(animal.signature)
    await animalForm.submitSave()

    await animalDetails.expectOpen(animal.id)
    await animalDetails.expectDetails({ Sygnatura: generated })
  })

  test('a signature belonging to another animal is refused', async ({
    api,
    animalForm,
    page,
  }) => {
    const [first, second] = await api.createAnimals([
      buildAnimal({ species: 'dog' }),
      buildAnimal({ species: 'dog' }),
    ])

    await animalForm.gotoEdit(second.id)
    await animalForm.signature.fill(first.signature)
    await animalForm.submitSave()

    await expect(animalForm.signatureField.error).toHaveText(
      ANIMAL_FORM_ERRORS.signatureTaken,
    )
    await expect(page).toHaveURL(
      new RegExp(`${AnimalFormPage.editPath(second.id)}/?$`),
    )
    expect((await api.getAnimal(second.id)).signature).toBe(second.signature)
  })

  test('must keep the RRRR/NNNN format', async ({ api, animalForm, page }) => {
    const animal = await api.createAnimal(buildAnimal())
    await animalForm.gotoEdit(animal.id)

    await animalForm.signature.fill('bez-formatu')
    await expect(animalForm.signatureField.error).toHaveText(
      ANIMAL_FORM_ERRORS.signatureFormat,
    )

    await animalForm.signature.fill('')
    await expect(animalForm.signatureField.error).toHaveText(
      ANIMAL_FORM_ERRORS.signatureRequired,
    )

    await test.step('an invalid form is not saved', async () => {
      await animalForm.submitSave()
      await expect(page).toHaveURL(
        new RegExp(`${AnimalFormPage.editPath(animal.id)}/?$`),
      )
      expect((await api.getAnimal(animal.id)).signature).toBe(animal.signature)
    })
  })
})

test.describe('Edit form validation', () => {
  test('applies the same field rules as the create form', async ({
    api,
    animalForm,
    page,
  }) => {
    const animal = await api.createAnimal(buildAnimal(ORIGINAL))
    await animalForm.gotoEdit(animal.id)

    await animalForm.breed.fill('x'.repeat(101))
    await expect(animalForm.breedField.error).toHaveText(
      ANIMAL_FORM_ERRORS.breedTooLong,
    )

    await animalForm.distinguishingMarks.fill('x'.repeat(101))
    await expect(animalForm.marksField.error).toHaveText(
      ANIMAL_FORM_ERRORS.marksTooLong,
    )

    await animalForm.birthDate.fill(tomorrow())
    await expect(animalForm.birthDateField.error).toHaveText(
      ANIMAL_FORM_ERRORS.birthDateInFuture,
    )

    await animalForm.submitSave()
    await expect(page).toHaveURL(
      new RegExp(`${AnimalFormPage.editPath(animal.id)}/?$`),
    )
    expect(await api.getAnimal(animal.id)).toMatchObject({
      breed: ORIGINAL.breed,
      distinguishingMarks: ORIGINAL.distinguishingMarks,
    })
  })

  test('a server failure is reported and the changes stay in the form', async ({
    api,
    animalForm,
    page,
  }) => {
    const animal = await api.createAnimal(buildAnimal(ORIGINAL))
    await page.route(`${URLS.backend}/animals/${animal.id}`, (route) =>
      route.request().method() === 'PUT'
        ? route.fulfill({
            status: 500,
            headers: { 'Access-Control-Allow-Origin': URLS.frontend },
            body: 'boom',
          })
        : route.fallback(),
    )

    await animalForm.gotoEdit(animal.id)
    await animalForm.color.fill('Fioletowy')
    await animalForm.submitSave()

    await expect(animalForm.genericError).toHaveText(GENERIC_ERROR_MESSAGE)
    await expect(animalForm.color).toHaveValue('Fioletowy')
    await expect(animalForm.saveButton).toBeEnabled()
  })
})
