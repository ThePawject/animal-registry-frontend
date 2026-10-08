import {
  ANIMAL_FORM_ERRORS,
  AnimalFormPage,
  SIGNATURE_PATTERN,
} from '../pages/animal-form.page.ts'
import { PanelPage } from '../pages/panel.page.ts'
import {
  asCardDate,
  buildAnimal,
  currentYear,
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
import {
  failBackendRequests,
  forbidBackendRequests,
} from '../support/network.ts'

const CREATE_ANIMAL = { method: 'POST', pathname: '/animals' } as const

test.describe('Adding an animal', () => {
  test.beforeEach(async ({ animalForm }) => {
    await animalForm.gotoCreate()
  })

  test('with only the required data', async ({
    animalForm,
    panel,
    api,
    page,
  }) => {
    const name = unique('Minimalny')

    await animalForm.fill({ name, species: 'dog' })
    const { generated: signature } = await animalForm.generateSignature()
    await animalForm.submitCreate()

    await expect(page).toHaveURL(new RegExp(`${PanelPage.path}`))
    await panel.search(name)
    await panel.expectAnimals([name])
    await expect(panel.row(name).cell('Oznaczenie')).toHaveText(signature)

    await test.step('optional fields are stored empty', async () => {
      const { items } = await api.listAnimals(name)
      expect(items).toHaveLength(1)
      expect(items[0]).toMatchObject({
        name,
        signature,
        species: SPECIES.dog,
        sex: SEX.unknown,
        breed: '',
        color: '',
        distinguishingMarks: '',
        transponderCode: null,
        birthDate: null,
        isInShelter: true,
      })
    })
  })

  test('with every field filled in', async ({
    animalForm,
    panel,
    animalDetails,
    page,
  }) => {
    const animal = {
      name: unique('Komplet'),
      transponderCode: '616093900054321',
      species: 'cat',
      breed: 'Maine Coon',
      distinguishingMarks: 'Biała łapa',
      sex: 'female',
      color: 'Pręgowany',
      birthDate: daysAgo(400),
    } as const

    await animalForm.fill(animal)
    const { generated: signature } = await animalForm.generateSignature()
    await animalForm.submitCreate()

    await expect(page).toHaveURL(new RegExp(`${PanelPage.path}`))

    await test.step('the register shows the new animal', async () => {
      await panel.search(animal.name)
      const row = panel.row(animal.name)
      await expect(row.cell('Oznaczenie')).toHaveText(signature)
      await expect(row.cell('Rasa')).toHaveText(animal.breed)
      await expect(row.cell('Znaki szczególne')).toHaveText(
        animal.distinguishingMarks,
      )
      await expect(row.cell('Gatunek')).toHaveText(SPECIES_LABEL.cat)
      await expect(row.cell('Płeć')).toHaveText(SEX_LABEL.female)
      await expect(row.cell('Umaszczenie')).toHaveText(animal.color)
      await expect(row.cell('Wiek')).toHaveText(/^1 lat/)
    })

    await test.step('the animal card shows everything that was entered', async () => {
      await panel.openDetails(animal.name)
      await expect(animalDetails.heading).toHaveText(animal.name)
      await animalDetails.expectDetails({
        Gatunek: SPECIES_LABEL.cat,
        Płeć: SEX_LABEL.female,
        Sygnatura: signature,
        Umaszczenie: animal.color,
        Rasa: animal.breed,
        'Znaki szczególne': animal.distinguishingMarks,
        'Data urodzenia': asCardDate(animal.birthDate),
        'Data dodania': asCardDate(daysAgo(0)),
      })
    })
  })

  test('without a name: the animal is identified by its signature', async ({
    animalForm,
    panel,
    animalDetails,
  }) => {
    const marks = unique('Bezimienny')

    await animalForm.fill({ species: 'dog', distinguishingMarks: marks })
    const { generated: signature } = await animalForm.generateSignature()
    await animalForm.submitCreate()

    await panel.search(marks)
    const row = panel.row(marks)
    await expect(row.cell('Imię')).toHaveText(EMPTY_VALUE.table)
    await expect(row.cell('Oznaczenie')).toHaveText(signature)

    await row.detailsLink.click()
    await expect(animalDetails.heading).toHaveText(EMPTY_VALUE.details)
    await animalDetails.expectDetails({ Sygnatura: signature })
  })

  test('"Anuluj" returns to the register without saving', async ({
    animalForm,
    api,
    panel,
    page,
  }) => {
    const name = unique('Porzucony')
    await animalForm.fill({ name, species: 'dog' })
    await animalForm.generateSignature()

    await animalForm.cancelButton.click()

    await expect(page).toHaveURL(new RegExp(`${PanelPage.path}`))
    await panel.expectLoaded()
    expect((await api.listAnimals(name)).totalCount).toBe(0)
  })

  test('breadcrumbs show where the form sits', async ({ breadcrumbs }) => {
    await breadcrumbs.expectTrail(['Lista Zwierząt', 'Dodaj zwierzę'])
  })
})

test.describe('Signature generator', () => {
  test.use({ shelter: 'isolated' })

  test.beforeEach(async ({ animalForm }) => {
    await animalForm.gotoCreate()
  })

  test('needs a species before it can generate', async ({ animalForm }) => {
    await expect(animalForm.generateSignatureButton).toBeDisabled()

    await animalForm.selectSpecies('dog')

    await expect(animalForm.generateSignatureButton).toBeEnabled()
  })

  test('numbers animals per year and per species', async ({
    animalForm,
    api,
    page,
  }) => {
    const year = currentYear()

    await test.step('the first dog of the year gets number 0001', async () => {
      await animalForm.selectSpecies('dog')
      const { generated } = await animalForm.generateSignature()
      expect(generated).toBe(`${year}/0001`)
    })

    await test.step('once it is taken, the next dog gets 0002', async () => {
      await api.createAnimal(buildAnimal({ species: 'dog' }))
      const { generated } = await animalForm.generateSignature()
      expect(generated).toBe(`${year}/0002`)
    })

    await test.step('cats are counted separately', async () => {
      await animalForm.selectSpecies('cat')
      const { generated } = await animalForm.generateSignature()
      expect(generated).toBe(`${year}/0001`)
    })

    await test.step('a freed number is offered again', async () => {
      await api.createAnimals([
        buildAnimal({ species: 'cat', signature: `${year}/0001` }),
        buildAnimal({ species: 'cat', signature: `${year}/0003` }),
      ])
      await page.reload()
      await animalForm.selectSpecies('cat')
      const { generated } = await animalForm.generateSignature()
      expect(generated).toBe(`${year}/0002`)
    })
  })

  test('a signature typed by hand is accepted', async ({
    animalForm,
    panel,
  }) => {
    const name = unique('Reczny')
    const signature = `${currentYear() - 1}/0042`

    await animalForm.fill({ name, species: 'dog', signature })
    await animalForm.submitCreate()

    await panel.search(name)
    await expect(panel.row(name).cell('Oznaczenie')).toHaveText(signature)
  })

  test('explains the signature format on demand', async ({ animalForm }) => {
    await animalForm.signatureInfoButton.click()

    await expect(animalForm.signatureInfoPopover).toBeVisible()
    await expect(animalForm.signatureInfoPopover).toContainText('RRRR/NNNN')
  })
})

test.describe('Animal form validation', () => {
  test.beforeEach(async ({ animalForm }) => {
    await animalForm.gotoCreate()
  })

  test('species and signature are required', async ({ animalForm, page }) => {
    const backend = await forbidBackendRequests(page, CREATE_ANIMAL)

    await animalForm.submitCreate()

    await expect(animalForm.speciesField.error).toHaveText(
      ANIMAL_FORM_ERRORS.speciesRequired,
    )
    await expect(animalForm.signatureField.error).toHaveText(
      ANIMAL_FORM_ERRORS.signatureRequired,
    )
    await expect(page).toHaveURL(new RegExp(`${AnimalFormPage.createPath}/?$`))
    await backend.expectNoneSent()

    await test.step('errors clear once the fields are filled', async () => {
      await animalForm.selectSpecies('dog')
      await animalForm.generateSignature()
      await expect(animalForm.speciesField.error).toBeHidden()
      await expect(animalForm.signatureField.error).toBeHidden()
    })
  })

  test('signature must follow the RRRR/NNNN format', async ({ animalForm }) => {
    for (const malformed of ['2026', '26/1', '2026-0001', 'abcd/efgh']) {
      await test.step(`"${malformed}" is rejected`, async () => {
        await animalForm.signature.fill(malformed)
        await expect(animalForm.signatureField.error).toHaveText(
          ANIMAL_FORM_ERRORS.signatureFormat,
        )
      })
    }

    await animalForm.signature.fill('2026/0001')
    await expect(animalForm.signatureField.error).toBeHidden()
    await expect(animalForm.signature).toHaveValue(SIGNATURE_PATTERN)
  })

  test('breed and distinguishing marks are limited to 100 characters', async ({
    animalForm,
  }) => {
    const tooLong = 'x'.repeat(101)
    const longest = 'x'.repeat(100)

    await animalForm.breed.fill(tooLong)
    await expect(animalForm.breedField.error).toHaveText(
      ANIMAL_FORM_ERRORS.breedTooLong,
    )
    await animalForm.breed.fill(longest)
    await expect(animalForm.breedField.error).toBeHidden()

    await animalForm.distinguishingMarks.fill(tooLong)
    await expect(animalForm.marksField.error).toHaveText(
      ANIMAL_FORM_ERRORS.marksTooLong,
    )
    await animalForm.distinguishingMarks.fill(longest)
    await expect(animalForm.marksField.error).toBeHidden()
  })

  test('birth date cannot be in the future', async ({ animalForm, page }) => {
    const backend = await forbidBackendRequests(page, CREATE_ANIMAL)
    await animalForm.fill({
      name: unique('Przyszlosc'),
      species: 'dog',
      birthDate: tomorrow(),
    })
    await animalForm.generateSignature()

    await expect(animalForm.birthDateField.error).toHaveText(
      ANIMAL_FORM_ERRORS.birthDateInFuture,
    )

    await test.step('an invalid form is not submitted', async () => {
      await animalForm.submitCreate()
      await expect(page).toHaveURL(
        new RegExp(`${AnimalFormPage.createPath}/?$`),
      )
      await backend.expectNoneSent()
    })

    await test.step('today is accepted', async () => {
      await animalForm.birthDate.fill(daysAgo(0))
      await expect(animalForm.birthDateField.error).toBeHidden()
    })
  })

  test('a signature already used for the species is refused', async ({
    animalForm,
    api,
    panel,
    page,
  }) => {
    const existing = await api.createAnimal(buildAnimal({ species: 'dog' }))
    const name = unique('Duplikat')

    await animalForm.fill({
      name,
      species: 'dog',
      signature: existing.signature,
    })
    await animalForm.submitCreate()

    await expect(animalForm.signatureField.error).toHaveText(
      ANIMAL_FORM_ERRORS.signatureTaken,
    )
    await expect(page).toHaveURL(new RegExp(`${AnimalFormPage.createPath}/?$`))
    await expect(animalForm.name).toHaveValue(name)

    await test.step('generating a free signature fixes it', async () => {
      const { generated } = await animalForm.generateSignature()
      expect(generated).not.toBe(existing.signature)
      await animalForm.submitCreate()

      await expect(page).toHaveURL(new RegExp(`${PanelPage.path}`))
      await panel.search(name)
      await expect(panel.row(name).cell('Oznaczenie')).toHaveText(generated)
    })
  })

  test('a server failure is reported and nothing typed is lost', async ({
    animalForm,
    page,
  }) => {
    const name = unique('Awaria')
    await failBackendRequests(page, CREATE_ANIMAL)

    await animalForm.fill({ name, species: 'dog' })
    await animalForm.generateSignature()
    await animalForm.submitCreate()

    await expect(animalForm.genericError).toHaveText(GENERIC_ERROR_MESSAGE)
    await expect(page).toHaveURL(new RegExp(`${AnimalFormPage.createPath}/?$`))
    await expect(animalForm.name).toHaveValue(name)
    await expect(animalForm.createButton).toBeEnabled()
  })
})
