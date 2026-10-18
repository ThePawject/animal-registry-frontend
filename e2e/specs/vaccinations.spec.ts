import { VaccinationsPage } from '../pages/vaccinations.page.ts'
import { buildAnimal, daysAgo, unique } from '../support/data.ts'
import { expect, test } from '../support/fixtures.ts'

test.use({ admin: true })

test.beforeEach(async ({ api }) => {
  await api.setFeature('animal-vaccinations', true)
})

test.describe('Vaccinations of an animal', () => {
  test('can be added with only a name and a date', async ({
    api,
    vaccinations,
  }) => {
    const animal = await api.createAnimal(buildAnimal())
    const name = unique('Nobivac')
    await vaccinations.goto(animal.id)
    await expect(vaccinations.row(name)).toHaveCount(0)

    await vaccinations.addButton.click()
    await vaccinations.fill({
      vaccineName: name,
      administeredOn: daysAgo(3),
    })
    await vaccinations.save()

    await expect(vaccinations.row(name)).toBeVisible()
    await expect(vaccinations.status(name)).toHaveText('Bez terminu ważności')
  })

  test('shows how long each one stays valid', async ({ api, vaccinations }) => {
    const animal = await api.createAnimal(buildAnimal())
    const valid = unique('Dlugo wazna')
    const soon = unique('Wkrotce')
    const expired = unique('Wygasla')
    await api.createVaccination(animal.id, {
      vaccineName: valid,
      administeredOn: daysAgo(10),
      validUntil: daysAgo(-300),
    })
    await api.createVaccination(animal.id, {
      vaccineName: soon,
      administeredOn: daysAgo(10),
      validUntil: daysAgo(-5),
    })
    await api.createVaccination(animal.id, {
      vaccineName: expired,
      administeredOn: daysAgo(100),
      validUntil: daysAgo(10),
    })

    await vaccinations.goto(animal.id)

    await expect(vaccinations.status(valid)).toHaveText('Ważne')
    await expect(vaccinations.status(soon)).toHaveText(/^Wygasa za \d+ dni$/)
    await expect(vaccinations.status(expired)).toHaveText('Wygasło')
  })

  test('cannot be valid until before they were given', async ({
    api,
    vaccinations,
  }) => {
    const animal = await api.createAnimal(buildAnimal())
    await vaccinations.goto(animal.id)

    await vaccinations.addButton.click()
    await vaccinations.fill({
      vaccineName: unique('Nobivac'),
      administeredOn: daysAgo(3),
      validUntil: daysAgo(10),
    })

    await expect(vaccinations.validUntilField.error).toHaveText(
      'Termin ważności nie może być wcześniejszy niż data podania',
    )
    await expect(vaccinations.saveButton).toBeDisabled()
  })
})

test.describe('Renewing a vaccination', () => {
  test('marks the old one as replaced', async ({ api, vaccinations }) => {
    const animal = await api.createAnimal(buildAnimal())
    const old = unique('Stara')
    const renewed = unique('Nowa')
    await api.createVaccination(animal.id, {
      vaccineName: old,
      administeredOn: daysAgo(60),
      validUntil: daysAgo(-3),
    })
    await vaccinations.goto(animal.id)

    await vaccinations.renewButton(old).click()
    await expect(vaccinations.dialog).toContainText('Odnów szczepienie')
    await expect(vaccinations.nameField.input).toHaveValue(old)
    await expect(vaccinations.replacesField.select).toContainText(old)
    await vaccinations.fill({
      vaccineName: renewed,
      administeredOn: daysAgo(1),
      validUntil: daysAgo(-300),
    })
    await vaccinations.save()

    await expect(vaccinations.status(old)).toHaveText('Zastąpione nowszym')
    await expect(vaccinations.renewButton(old)).toBeHidden()
    await expect(vaccinations.row(old)).toContainText(`Zastąpione przez`)
    await expect(vaccinations.row(old)).toContainText(renewed)
    await expect(vaccinations.row(renewed)).toContainText('Zastępuje')
    await expect(vaccinations.renewButton(renewed)).toBeVisible()
  })

  test('cannot replace a vaccination twice', async ({ api, vaccinations }) => {
    const animal = await api.createAnimal(buildAnimal())
    const old = unique('Stara')
    const newer = unique('Nowa')
    const oldVaccination = await api.createVaccination(animal.id, {
      vaccineName: old,
      administeredOn: daysAgo(60),
    })
    await api.createVaccination(animal.id, {
      vaccineName: newer,
      administeredOn: daysAgo(30),
      replacesVaccinationId: oldVaccination.id,
    })
    await vaccinations.goto(animal.id)

    await vaccinations.addButton.click()
    await vaccinations.replacesField.select.click()

    const replacedOption = vaccinations.page.getByRole('option', { name: old })
    await expect(replacedOption).toHaveAttribute('aria-disabled', 'true')
    await expect(replacedOption).toContainText('już zastąpione')
    await expect(
      vaccinations.page.getByRole('option', { name: newer }),
    ).not.toHaveAttribute('aria-disabled', 'true')
  })

  test('deleting the newer vaccination frees the old one', async ({
    api,
    vaccinations,
  }) => {
    const animal = await api.createAnimal(buildAnimal())
    const old = unique('Stara')
    const newer = unique('Nowa')
    const oldVaccination = await api.createVaccination(animal.id, {
      vaccineName: old,
      administeredOn: daysAgo(60),
    })
    await api.createVaccination(animal.id, {
      vaccineName: newer,
      administeredOn: daysAgo(30),
      replacesVaccinationId: oldVaccination.id,
    })
    await vaccinations.goto(animal.id)
    await expect(vaccinations.renewButton(old)).toBeHidden()

    await vaccinations.row(newer).getByRole('button', { name: 'Usuń' }).click()
    await vaccinations.dialog.getByRole('button', { name: 'Usuń' }).click()

    await expect(vaccinations.row(newer)).toHaveCount(0)
    await expect(vaccinations.renewButton(old)).toBeVisible()
    await expect(vaccinations.status(old)).toHaveText('Bez terminu ważności')
  })
})

test.describe('Expiring vaccinations', () => {
  test('leave out those that were already renewed', async ({
    api,
    vaccinations,
  }) => {
    const [renewedAnimal, dueAnimal] = await api.createAnimals([
      buildAnimal(),
      buildAnimal(),
    ])
    const renewed = await api.createVaccination(renewedAnimal.id, {
      vaccineName: unique('Odnowiona'),
      administeredOn: daysAgo(300),
      validUntil: daysAgo(-5),
    })
    await api.createVaccination(renewedAnimal.id, {
      vaccineName: unique('Nowsza'),
      administeredOn: daysAgo(1),
      validUntil: daysAgo(-360),
      replacesVaccinationId: renewed.id,
    })
    await api.createVaccination(dueAnimal.id, {
      vaccineName: unique('Konczaca sie'),
      administeredOn: daysAgo(300),
      validUntil: daysAgo(-5),
    })

    await vaccinations.gotoExpiring()

    await expect(vaccinations.expiringRows).toHaveCount(1)
    await expect(vaccinations.expiringRow(dueAnimal.name!)).toContainText(
      /Wygasa za \d+ dni/,
    )
    await expect(vaccinations.expiringRow(renewedAnimal.name!)).toHaveCount(0)
  })

  test('are empty when nothing is about to expire', async ({
    vaccinations,
  }) => {
    await vaccinations.gotoExpiring()

    await expect(vaccinations.expiringEmpty).toBeVisible()
  })

  test('are linked from the navbar', async ({ addons, page }) => {
    await page.goto('/panel')

    await addons.navLink('Szczepienia').click()

    await expect(page).toHaveURL(VaccinationsPage.expiringPath)
  })
})
