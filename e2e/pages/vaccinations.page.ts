import { expect } from '@playwright/test'
import { FormFieldLocator } from './components.ts'
import type { Locator, Page } from '@playwright/test'

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
  readonly saveButton: Locator
  readonly expiringEmpty: Locator

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
    this.saveButton = this.dialog.getByRole('button', { name: 'Zapisz' })
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
    await expect(this.page.getByText('Kończące się szczepienia')).toBeVisible()
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
