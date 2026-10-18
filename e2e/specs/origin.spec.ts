import { ANIMAL_ORIGIN_ERRORS } from '../pages/animal-form.page.ts'
import { MunicipalitiesPage } from '../pages/municipalities.page.ts'
import { buildAnimal, daysAgo, unique } from '../support/data.ts'
import { expect, test } from '../support/fixtures.ts'
import { forbidBackendRequests } from '../support/network.ts'

test.use({ admin: true })

test.beforeEach(async ({ api }) => {
  await api.setFeature('animal-origin', true)
})

test.describe('Municipalities', () => {
  test('explain that the list has to be filled in when it is empty', async ({
    municipalities,
  }) => {
    await municipalities.goto()
    await expect(municipalities.emptyNotice).toBeVisible()

    const name = unique('Gmina')
    await municipalities.emptyNotice
      .getByRole('button', { name: 'Dodaj pierwszą gminę' })
      .click()
    await municipalities.save(name)

    await expect(municipalities.row(name)).toBeVisible()
    await expect(municipalities.emptyNotice).toBeHidden()
  })

  test('can be renamed, archived and restored', async ({
    api,
    municipalities,
  }) => {
    const name = unique('Gmina')
    const renamed = unique('Zmieniona')
    await api.createMunicipality(name)
    await municipalities.goto()

    await test.step('renaming', async () => {
      await municipalities
        .row(name)
        .getByRole('button', { name: 'Edytuj' })
        .click()
      await expect(municipalities.nameField.input).toHaveValue(name)
      await municipalities.save(renamed)
      await expect(municipalities.row(renamed)).toBeVisible()
      await expect(municipalities.row(name)).toHaveCount(0)
    })

    await test.step('archiving hides it from the list', async () => {
      await municipalities
        .row(renamed)
        .getByRole('button', { name: 'Archiwizuj' })
        .click()
      await expect(municipalities.row(renamed)).toHaveCount(0)
    })

    await test.step('archived ones can be shown and restored', async () => {
      await municipalities.showArchived.check()
      await expect(municipalities.row(renamed)).toContainText('Zarchiwizowana')
      await municipalities
        .row(renamed)
        .getByRole('button', { name: 'Przywróć' })
        .click()
      await expect(municipalities.row(renamed)).not.toContainText(
        'Zarchiwizowana',
      )
    })
  })
})

test.describe('Animal origin', () => {
  test('the form asks to fill in the municipalities first', async ({
    animalForm,
    page,
  }) => {
    await animalForm.gotoCreate()

    await expect(animalForm.originSection).toBeVisible()
    await expect(animalForm.originNotice).toBeVisible()

    await animalForm.originNotice
      .getByRole('link', { name: 'Przejdź do listy gmin' })
      .click()
    await expect(page).toHaveURL(MunicipalitiesPage.path)
  })

  test('is required once the addon is on', async ({
    animalForm,
    api,
    page,
  }) => {
    await api.createMunicipality(unique('Gmina'))
    await animalForm.gotoCreate()
    await animalForm.fill({ name: unique('Burek'), species: 'dog' })
    await animalForm.generateSignature()
    const backend = await forbidBackendRequests(page, {
      method: 'POST',
      pathname: '/animals',
    })

    await animalForm.submitCreate()

    await expect(animalForm.originAdmissionDate.error).toHaveText(
      ANIMAL_ORIGIN_ERRORS.admissionDate,
    )
    await expect(animalForm.originAdmissionMethod.error).toHaveText(
      ANIMAL_ORIGIN_ERRORS.admissionMethod,
    )
    await expect(animalForm.originFoundStreet.error).toHaveText(
      ANIMAL_ORIGIN_ERRORS.foundStreet,
    )
    await expect(animalForm.originFoundMunicipality.error).toHaveText(
      ANIMAL_ORIGIN_ERRORS.foundMunicipality,
    )
    await expect(animalForm.originContractorMunicipality.error).toHaveText(
      ANIMAL_ORIGIN_ERRORS.contractorMunicipality,
    )
    await backend.expectNoneSent()
  })

  test('is saved with the animal and shown on its card', async ({
    animalForm,
    animalDetails,
    api,
    page,
  }) => {
    const found = unique('Gmina znalezienia')
    const contractor = unique('Gmina zlecajaca')
    await api.createMunicipality(found)
    await api.createMunicipality(contractor)
    const name = unique('Burek')
    await animalForm.gotoCreate()

    await animalForm.fill({ name, species: 'dog' })
    await animalForm.generateSignature()
    await animalForm.fillOrigin({
      admissionDate: daysAgo(2),
      admissionMethod: 'Podrzucony',
      foundStreet: 'Lesna 1',
      foundMunicipality: found,
      contractorMunicipality: contractor,
    })
    await animalForm.submitCreate()
    await expect(page).toHaveURL(/\/panel/)

    const { items } = await api.listAnimals(name)
    await animalDetails.goto(items[0].id)
    const origin = page
      .locator('[data-slot="card"]')
      .filter({ has: page.getByText('Pochodzenie', { exact: true }) })
    await expect(origin).toContainText('Podrzucony')
    await expect(origin).toContainText('Lesna 1')
    await expect(origin).toContainText(found)
    await expect(origin).toContainText(contractor)
  })

  test('older animals show that no origin was assigned', async ({
    animalDetails,
    api,
    page,
  }) => {
    await api.setFeature('animal-origin', false)
    const animal = await api.createAnimal(buildAnimal())
    await api.setFeature('animal-origin', true)

    await animalDetails.goto(animal.id)

    await expect(
      page
        .locator('[data-slot="card"]')
        .filter({ has: page.getByText('Pochodzenie', { exact: true }) }),
    ).toContainText('Brak przypisania')
  })
})
