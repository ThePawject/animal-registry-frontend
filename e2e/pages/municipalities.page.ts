import { expect } from '@playwright/test'
import { FormFieldLocator } from './components.ts'
import type { Locator, Page } from '@playwright/test'

export class MunicipalitiesPage {
  static readonly path = '/addons/animal-origin'

  readonly addButton: Locator
  readonly emptyNotice: Locator
  readonly showArchived: Locator
  readonly dialog: Locator
  readonly nameField: FormFieldLocator
  readonly saveButton: Locator

  constructor(readonly page: Page) {
    this.addButton = page.getByRole('button', { name: 'Dodaj gminę' })
    this.emptyNotice = page.getByRole('alert').filter({
      hasText: 'Brak gmin – uzupełnij listę',
    })
    this.showArchived = page.getByRole('checkbox', {
      name: 'Pokaż zarchiwizowane',
    })
    this.dialog = page.getByRole('dialog')
    this.nameField = new FormFieldLocator(this.dialog, 'Nazwa gminy')
    this.saveButton = this.dialog.getByRole('button', { name: 'Zapisz' })
  }

  row(name: string) {
    return this.page.getByRole('listitem').filter({ hasText: name })
  }

  async goto() {
    await this.page.goto(MunicipalitiesPage.path)
    await expect(
      this.page.locator('[data-slot="card-title"]', { hasText: 'Gminy' }),
    ).toBeVisible()
  }

  async save(name: string) {
    await this.nameField.input.fill(name)
    await this.saveButton.click()
    await expect(this.dialog).toBeHidden()
  }
}
