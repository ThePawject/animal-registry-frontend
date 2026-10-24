import { expect } from '@playwright/test'
import { FormFieldLocator, chooseOption, escapeRegExp } from './components.ts'
import type { Locator, Page } from '@playwright/test'
import type { UploadFile } from '../support/files.ts'

export type VaccinationFormValues = {
  vaccineName?: string
  administeredOn?: string
  validUntil?: string
}

export class VaccinationsPage {
  static tabPath = (animalId: string) => `/animal/${animalId}/vaccinations`
  static readonly expiringPath = '/vaccinations'

  readonly addButton: Locator
  readonly dialog: Locator
  readonly nameField: FormFieldLocator
  readonly administeredOnField: FormFieldLocator
  readonly validUntilField: FormFieldLocator
  readonly replacesField: FormFieldLocator
  readonly veterinarianField: FormFieldLocator
  readonly batchNumberField: FormFieldLocator
  readonly saveButton: Locator
  readonly fileError: Locator
  readonly removeFileButton: Locator
  readonly animalField: FormFieldLocator
  readonly validityPeriods: Locator
  readonly expiringEmpty: Locator
  readonly expiryPeriod: Locator
  readonly customExpiryDays: Locator

  constructor(readonly page: Page) {
    this.addButton = page.getByRole('button', { name: 'Dodaj szczepienie' })
    this.dialog = page.getByRole('dialog')
    this.nameField = new FormFieldLocator(this.dialog, 'Szczepionka')
    this.administeredOnField = new FormFieldLocator(this.dialog, 'Data podania')
    this.validUntilField = new FormFieldLocator(this.dialog, 'Ważne do')
    this.replacesField = new FormFieldLocator(
      this.dialog,
      'Zastępuje szczepienie',
    )
    this.veterinarianField = new FormFieldLocator(
      this.dialog,
      'Lekarz weterynarii',
    )
    this.batchNumberField = new FormFieldLocator(this.dialog, 'Numer serii')
    this.saveButton = this.dialog.getByRole('button', { name: 'Zapisz' })
    this.fileError = new FormFieldLocator(this.dialog, 'Skan dokumentu').error
    this.removeFileButton = this.dialog.getByRole('button', {
      name: 'Usuń plik',
    })
    this.animalField = new FormFieldLocator(this.dialog, 'Zwierzę')
    this.validityPeriods = this.dialog.getByRole('group', {
      name: 'Okres ważności od daty podania',
    })
    this.expiryPeriod = page.getByRole('combobox', {
      name: 'Wygasają w ciągu',
    })
    this.customExpiryDays = page.getByLabel('Wygasają w ciągu (dni)')
    this.expiringEmpty = page.getByText(
      'Brak szczepień spełniających kryteria.',
    )
  }

  row(vaccineName: string) {
    return this.page.getByRole('listitem').filter({
      has: this.page.getByText(vaccineName, { exact: true }),
    })
  }

  get expiringRows() {
    return this.page.locator('[data-slot="card-content"]').getByRole('listitem')
  }

  expiringRow(animalName: string) {
    return this.expiringRows.filter({ hasText: animalName })
  }

  renewButton(vaccineName: string) {
    return this.row(vaccineName).getByRole('button', { name: 'Odnów' })
  }

  status(vaccineName: string) {
    return this.row(vaccineName).locator('[data-slot="badge"]')
  }

  async goto(animalId: string) {
    await this.page.goto(VaccinationsPage.tabPath(animalId))
    await expect(this.addButton).toBeVisible()
  }

  async gotoExpiring() {
    await this.page.goto(VaccinationsPage.expiringPath)
    await expect(this.page.getByText('Terminy szczepień')).toBeVisible()
  }

  validityPeriod(label: '6 miesięcy' | '1 rok' | '2 lata') {
    return this.validityPeriods.getByRole('button', { name: label })
  }

  async chooseAnimal(name: string) {
    await this.animalField.input.fill(name)
    await this.page
      .getByRole('option', { name: new RegExp(`^${escapeRegExp(name)} `) })
      .click()
    await expect(this.animalField.input).toHaveValue(
      new RegExp(`^${escapeRegExp(name)} `),
    )
  }

  async setExpiryPeriod(label: string) {
    await chooseOption(this.expiryPeriod, label)
  }

  async fill(values: VaccinationFormValues) {
    if (values.vaccineName !== undefined) {
      await this.nameField.input.fill(values.vaccineName)
    }
    if (values.administeredOn !== undefined) {
      await this.administeredOnField.input.fill(values.administeredOn)
    }
    if (values.validUntil !== undefined) {
      await this.validUntilField.input.fill(values.validUntil)
    }
  }

  async attach(file: UploadFile) {
    await this.dialog.locator('input[type="file"]').setInputFiles(file)
  }

  attachment(vaccineName: string) {
    return this.row(vaccineName).getByRole('button', { name: /\.\w+$/ })
  }

  async chooseReplaced(option: string | RegExp) {
    await this.replacesField.select.click()
    await this.page.getByRole('option', { name: option }).click()
    await expect(this.page.getByRole('listbox')).toBeHidden()
  }

  async save() {
    await this.saveButton.click()
    await expect(this.dialog).toBeHidden()
  }
}
