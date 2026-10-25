import { expect } from '@playwright/test'
import { FormFieldLocator } from './components.ts'
import type { Locator, Page } from '@playwright/test'

export class MunicipalitiesPage {
  static readonly path = '/addons/animal-origin'

  readonly addForm: Locator
  readonly newNameInput: Locator
  readonly addButton: Locator
  readonly addError: Locator
  readonly addedMessage: Locator
  readonly emptyNotice: Locator
  readonly showArchived: Locator
  readonly rows: Locator
  readonly dialog: Locator
  readonly nameField: FormFieldLocator
  readonly saveButton: Locator

  constructor(readonly page: Page) {
    this.addForm = page.locator('form').filter({
      has: page.getByLabel('Dodaj gminę'),
    })
    this.newNameInput = this.addForm.getByLabel('Dodaj gminę')
    this.addButton = this.addForm.getByRole('button', { name: 'Dodaj' })
    this.addError = this.addForm.getByRole('alert')
    this.addedMessage = this.addForm.getByRole('status')
    this.emptyNotice = page.getByRole('alert').filter({
      hasText: 'Brak gmin – uzupełnij listę',
    })
    this.showArchived = page.getByRole('checkbox', {
      name: 'Pokaż zarchiwizowane',
    })
    this.rows = page.getByRole('listitem').filter({
      has: page.getByRole('button', { name: /^(Archiwizuj|Przywróć)$/ }),
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

  async add(name: string) {
    await this.newNameInput.fill(name)
    await this.addButton.click()
    await expect(this.addedMessage).toHaveText(`Dodano gminę „${name}”.`)
  }

  async save(name: string) {
    await this.nameField.input.fill(name)
    await this.saveButton.click()
    await expect(this.dialog).toBeHidden()
  }
}
