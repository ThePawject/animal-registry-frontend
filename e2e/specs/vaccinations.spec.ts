import { captureDownload, expectPdfDownload } from '../pages/components.ts'
import { VaccinationsPage } from '../pages/vaccinations.page.ts'
import { buildAnimal, daysAgo, unique } from '../support/data.ts'
import { pdfDocument } from '../support/files.ts'
import { expect, test } from '../support/fixtures.ts'
import {
  forbidBackendRequests,
  queryValues,
  waitForBackendRequest,
} from '../support/network.ts'

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

test.describe('The renewal dialog', () => {
  test('refuses a date that is not later than the renewed vaccination', async ({
    api,
    vaccinations,
  }) => {
    const animal = await api.createAnimal(buildAnimal())
    const old = unique('Stara')
    await api.createVaccination(animal.id, {
      vaccineName: old,
      administeredOn: daysAgo(10),
    })
    await vaccinations.goto(animal.id)
    await vaccinations.renewButton(old).click()

    await vaccinations.fill({ administeredOn: daysAgo(10) })
    await expect(vaccinations.replacesField.error).toHaveText(
      'Zastępowane szczepienie musi być wcześniejsze niż to',
    )
    await expect(vaccinations.saveButton).toBeDisabled()

    await vaccinations.fill({ administeredOn: daysAgo(9) })
    await expect(vaccinations.replacesField.error).toBeHidden()
    await expect(vaccinations.saveButton).toBeEnabled()
  })

  test('can be used to add a vaccination that replaces nothing', async ({
    api,
    vaccinations,
  }) => {
    const animal = await api.createAnimal(buildAnimal())
    const old = unique('Stara')
    const another = unique('Inna')
    await api.createVaccination(animal.id, {
      vaccineName: old,
      administeredOn: daysAgo(10),
    })
    await vaccinations.goto(animal.id)
    await vaccinations.renewButton(old).click()

    await vaccinations.chooseReplaced('Nie zastępuje żadnego')
    await vaccinations.fill({ vaccineName: another })
    await vaccinations.save()

    await expect(vaccinations.row(another)).toBeVisible()
    await expect(vaccinations.renewButton(old)).toBeVisible()
    await expect(vaccinations.status(old)).toHaveText('Bez terminu ważności')
  })

  test('the link to the renewed vaccination can be removed when editing', async ({
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

    await vaccinations
      .row(newer)
      .getByRole('button', { name: 'Edytuj' })
      .click()
    await expect(vaccinations.replacesField.select).toContainText(old)
    await vaccinations.chooseReplaced('Nie zastępuje żadnego')
    await vaccinations.save()

    await expect(vaccinations.renewButton(old)).toBeVisible()
    await expect(vaccinations.row(newer)).not.toContainText('Zastępuje')
    const saved = await api.listVaccinations(animal.id)
    expect(saved.every((item) => item.replacesVaccinationId === null)).toBe(
      true,
    )
  })
})

test.describe('Vaccination attachments', () => {
  test('a scan is saved with the vaccination', async ({
    api,
    vaccinations,
  }) => {
    const animal = await api.createAnimal(buildAnimal())
    const name = unique('Nobivac')
    await vaccinations.goto(animal.id)

    await vaccinations.addButton.click()
    await vaccinations.fill({ vaccineName: name })
    await vaccinations.attach(pdfDocument('swiadectwo.pdf'))
    await vaccinations.save()

    await expect(vaccinations.attachment(name)).toHaveText('swiadectwo.pdf')
    const [saved] = await api.listVaccinations(animal.id)
    expect(saved.attachment?.fileName).toBe('swiadectwo.pdf')
  })

  test('only accepts documents and images', async ({ api, vaccinations }) => {
    const animal = await api.createAnimal(buildAnimal())
    await vaccinations.goto(animal.id)
    await vaccinations.addButton.click()

    await vaccinations.attach({
      name: 'notatki.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('to nie jest skan'),
    })

    await expect(vaccinations.fileError).toContainText('Niedozwolony typ pliku')
    await expect(vaccinations.dialog).not.toContainText('notatki.txt')
  })

  test('can be replaced and removed when editing', async ({
    api,
    vaccinations,
  }) => {
    const animal = await api.createAnimal(buildAnimal())
    const name = unique('Nobivac')
    await vaccinations.goto(animal.id)
    await vaccinations.addButton.click()
    await vaccinations.fill({ vaccineName: name })
    await vaccinations.attach(pdfDocument('pierwszy.pdf'))
    await vaccinations.save()
    await expect(vaccinations.attachment(name)).toHaveText('pierwszy.pdf')

    await test.step('a new file replaces the old one', async () => {
      await vaccinations
        .row(name)
        .getByRole('button', { name: 'Edytuj' })
        .click()
      await vaccinations.attach(pdfDocument('drugi.pdf'))
      await vaccinations.save()
      await expect(vaccinations.attachment(name)).toHaveText('drugi.pdf')
    })

    await test.step('removing it leaves the vaccination without a scan', async () => {
      await vaccinations
        .row(name)
        .getByRole('button', { name: 'Edytuj' })
        .click()
      await vaccinations.dialog.getByRole('button', { name: 'Usuń' }).click()
      await vaccinations.save()
      await expect(vaccinations.row(name)).toBeVisible()
      await expect(vaccinations.attachment(name)).toHaveCount(0)
      const [saved] = await api.listVaccinations(animal.id)
      expect(saved.attachment).toBeNull()
    })
  })
})

test.describe('Vaccination reports', () => {
  test('list the vaccinations given in the chosen period', async ({
    api,
    reportsPage,
    vaccinationsReport,
    page,
  }) => {
    const animal = await api.createAnimal(buildAnimal())
    const inside = unique('Wewnatrz')
    const outside = unique('Poza')
    await api.createVaccination(animal.id, {
      vaccineName: inside,
      administeredOn: daysAgo(5),
    })
    await api.createVaccination(animal.id, {
      vaccineName: outside,
      administeredOn: daysAgo(60),
    })
    await reportsPage.goto()

    await vaccinationsReport.setRange(daysAgo(10), daysAgo(0))
    const reportRequest = waitForBackendRequest(page, {
      method: 'GET',
      pathname: '/reports/vaccinations',
    })
    const download = await captureDownload(page, () =>
      vaccinationsReport.generateButton.click(),
    )

    const text = await expectPdfDownload(download)
    expect(text).toContain(inside)
    expect(text).toContain(animal.name)
    expect(text).not.toContain(outside)
    expect(queryValues(await reportRequest, 'from')).toEqual([
      `${daysAgo(10)}T00:00:00.000Z`,
    ])
  })

  test('mark replaced vaccinations', async ({
    api,
    reportsPage,
    vaccinationsReport,
    page,
  }) => {
    const animal = await api.createAnimal(buildAnimal())
    const old = await api.createVaccination(animal.id, {
      vaccineName: unique('Stara'),
      administeredOn: daysAgo(8),
    })
    await api.createVaccination(animal.id, {
      vaccineName: unique('Nowa'),
      administeredOn: daysAgo(2),
      replacesVaccinationId: old.id,
    })
    await reportsPage.goto()
    await vaccinationsReport.setRange(daysAgo(10), daysAgo(0))

    const download = await captureDownload(page, () =>
      vaccinationsReport.generateButton.click(),
    )

    const text = await expectPdfDownload(download)
    expect(text).toContain('Zastąpione')
    expect(text).toContain('Aktywne')
  })

  test('need a period that starts before it ends', async ({
    reportsPage,
    vaccinationsReport,
    page,
  }) => {
    const backend = await forbidBackendRequests(page, {
      method: 'GET',
      pathname: '/reports/vaccinations',
    })
    await reportsPage.goto()

    await vaccinationsReport.setRange(daysAgo(1), daysAgo(5))

    await expect(vaccinationsReport.error).toHaveText(
      'Data początkowa nie może być późniejsza niż końcowa.',
    )
    await expect(vaccinationsReport.generateButton).toBeDisabled()
    await backend.expectNoneSent()
  })

  test('about expiring vaccinations leave out renewed and expired ones', async ({
    api,
    reportsPage,
    expiringVaccinationsReport,
    page,
  }) => {
    const animal = await api.createAnimal(buildAnimal())
    const due = unique('Konczaca')
    const expired = unique('Przeterminowana')
    const renewed = await api.createVaccination(animal.id, {
      vaccineName: unique('Odnowiona'),
      administeredOn: daysAgo(300),
      validUntil: daysAgo(-5),
    })
    await api.createVaccination(animal.id, {
      vaccineName: due,
      administeredOn: daysAgo(300),
      validUntil: daysAgo(-6),
    })
    await api.createVaccination(animal.id, {
      vaccineName: expired,
      administeredOn: daysAgo(300),
      validUntil: daysAgo(3),
    })
    await api.createVaccination(animal.id, {
      vaccineName: unique('Nastepczyni'),
      administeredOn: daysAgo(1),
      validUntil: daysAgo(-360),
      replacesVaccinationId: renewed.id,
    })
    await reportsPage.goto()

    const reportRequest = waitForBackendRequest(page, {
      method: 'GET',
      pathname: '/reports/vaccinations/expiring',
    })
    const download = await captureDownload(page, () =>
      expiringVaccinationsReport.generateButton.click(),
    )

    const text = await expectPdfDownload(download)
    expect(text).toContain(due)
    expect(text).not.toContain(expired)
    expect(text).not.toContain(renewed.vaccineName)
    const request = await reportRequest
    expect(queryValues(request, 'expiresInDays')).toEqual(['30'])
    expect(queryValues(request, 'includeExpired')).toEqual(['false'])
    expect(queryValues(request, 'inShelterOnly')).toEqual(['true'])

    await test.step('expired ones can be included', async () => {
      await expiringVaccinationsReport.includeExpired.check()
      const withExpired = await captureDownload(page, () =>
        expiringVaccinationsReport.generateButton.click(),
      )
      const textWithExpired = await expectPdfDownload(withExpired)
      expect(textWithExpired).toContain(due)
      expect(textWithExpired).toContain(expired)
    })
  })

  test('about expiring vaccinations need a sensible number of days', async ({
    reportsPage,
    expiringVaccinationsReport,
  }) => {
    await reportsPage.goto()

    await expiringVaccinationsReport.daysField.input.fill('4000')
    await expect(expiringVaccinationsReport.generateButton).toBeDisabled()

    await expiringVaccinationsReport.daysField.input.fill('')
    await expect(expiringVaccinationsReport.generateButton).toBeDisabled()

    await expiringVaccinationsReport.daysField.input.fill('0')
    await expect(expiringVaccinationsReport.generateButton).toBeEnabled()
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
