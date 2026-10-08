import { expect } from '@playwright/test'
import { EVENT_TYPE_LABEL } from '../support/domain.ts'
import { FormFieldLocator, chooseOption, escapeRegExp } from './components.ts'
import type { Locator, Page } from '@playwright/test'
import type { EventTypeKey } from '../support/domain.ts'
import type { UploadFile } from '../support/files.ts'

export type SortDirection = 'ascending' | 'descending' | 'none'

export const RECORD_ERRORS = {
  eventTypeRequired: 'Typ wydarzenia jest wymagany',
  eventDateRequired: 'Data wydarzenia jest wymagana',
  eventDateInFuture: 'Data wydarzenia nie może być z przyszłości',
  descriptionRequired: 'Opis jest wymagany',
  healthDateInFuture: 'Data nie może być z przyszłości',
  documentTypeNotAllowed:
    'Niedozwolony typ pliku. Dozwolone: PDF, DOC, DOCX, JPEG, PNG, WEBP',
  documentTooLarge: 'Plik jest za duży. Maksymalny rozmiar to 10MB',
} as const

export class RecordRow {
  readonly editButton: Locator
  readonly deleteButton: Locator
  readonly saveButton: Locator
  readonly cancelButton: Locator

  readonly dateInput: Locator
  readonly descriptionInput: Locator
  readonly typeSelect: Locator

  constructor(readonly root: Locator) {
    const actions = root.locator('td').last()
    this.editButton = actions.getByRole('button', { name: 'Edytuj' })
    this.deleteButton = actions.getByRole('button', { name: 'Usuń' })
    this.saveButton = actions.getByRole('button', { name: 'Zapisz' })
    this.cancelButton = actions.getByRole('button', { name: 'Anuluj' })

    this.dateInput = root.locator('input[type="date"]')
    this.descriptionInput = root.getByPlaceholder('Wpisz opis')
    this.typeSelect = root.getByRole('combobox')
  }

  cell(index: number) {
    return this.root.locator('td').nth(index)
  }
}

abstract class RecordsTab {
  readonly table: Locator
  readonly rows: Locator
  readonly addForm: Locator

  readonly deleteDialog: Locator
  readonly confirmDeleteButton: Locator
  readonly cancelDeleteButton: Locator

  protected constructor(
    readonly page: Page,
    private readonly emptyText: string,
  ) {
    this.table = page.locator('table')
    this.rows = this.table.locator('tbody tr').filter({
      has: page.getByRole('button', { name: /^(Edytuj|Zapisz)/ }),
    })
    this.addForm = page.locator('form')

    this.deleteDialog = page
      .getByRole('dialog')
      .filter({ hasText: 'Potwierdź usunięcie' })
    this.confirmDeleteButton = this.deleteDialog.getByRole('button', {
      name: 'Usuń',
    })
    this.cancelDeleteButton = this.deleteDialog.getByRole('button', {
      name: 'Anuluj',
    })
  }

  row(text: string) {
    return new RecordRow(this.rows.filter({ hasText: text }))
  }

  get editingRow() {
    return new RecordRow(
      this.table.locator('tbody tr').filter({
        has: this.page.getByRole('button', { name: /^Zapisz/ }),
      }),
    )
  }

  async edit(text: string) {
    await this.row(text).editButton.click()
    await expect(this.editingRow.saveButton).toBeVisible()
    return this.editingRow
  }

  async saveEdit() {
    await this.editingRow.saveButton.click()
    await expect(this.editingRow.root).toHaveCount(0)
  }

  async cancelEdit() {
    await this.editingRow.cancelButton.click()
    await expect(this.editingRow.root).toHaveCount(0)
  }

  async expectEmpty() {
    await expect(this.table.getByText(this.emptyText)).toBeVisible()
    await expect(this.rows).toHaveCount(0)
  }

  async columnValues(columnIndex: number) {
    const cells = await this.rows
      .locator(`td:nth-child(${columnIndex + 1})`)
      .all()
    return Promise.all(
      cells.map(async (cell) => (await cell.innerText()).trim()),
    )
  }

  private sortHeader(column: string) {
    return this.table.locator('th').filter({
      has: this.page.getByRole('button', {
        name: new RegExp(`^${escapeRegExp(column)}`),
      }),
    })
  }

  async sortBy(column: string, direction: Exclude<SortDirection, 'none'>) {
    const header = this.sortHeader(column)
    for (let click = 0; click < 2; click++) {
      if ((await header.getAttribute('aria-sort')) === direction) break
      await header.getByRole('button').click()
    }
    await expect(header).toHaveAttribute('aria-sort', direction)
  }

  async expectSortedBy(column: string, direction: SortDirection) {
    await expect(this.sortHeader(column)).toHaveAttribute(
      'aria-sort',
      direction,
    )
  }

  async requestDelete(text: string) {
    await this.row(text).deleteButton.click()
    await expect(this.deleteDialog).toBeVisible()
  }

  async confirmDelete() {
    await this.confirmDeleteButton.click()
    await expect(this.deleteDialog).toBeHidden()
  }

  inlineError(message: string) {
    return this.page
      .locator('[data-slot="popover-content"]')
      .filter({ hasText: message })
  }
}

export type EventFormValues = {
  type?: EventTypeKey
  occurredOn?: string
  description?: string
}

export const EVENT_COLUMN = {
  date: 0,
  type: 1,
  description: 2,
  performedBy: 3,
} as const

export class AnimalEventsPage extends RecordsTab {
  static path = (animalId: string) => `/animal/${animalId}/events`

  readonly heading: Locator
  readonly addButton: Locator

  readonly typeField: FormFieldLocator
  readonly dateField: FormFieldLocator
  readonly descriptionField: FormFieldLocator
  readonly saveButton: Locator
  readonly cancelButton: Locator

  constructor(page: Page) {
    super(page, 'Brak wydarzeń.')
    this.heading = page.getByRole('heading', {
      name: 'Wydarzenia',
      exact: true,
    })
    this.addButton = page.getByRole('button', { name: 'Dodaj wydarzenie' })

    this.typeField = new FormFieldLocator(this.addForm, 'Typ wydarzenia')
    this.dateField = new FormFieldLocator(this.addForm, 'Data wydarzenia')
    this.descriptionField = new FormFieldLocator(this.addForm, 'Opis')
    this.saveButton = this.addForm.getByRole('button', { name: 'Zapisz' })
    this.cancelButton = this.addForm.getByRole('button', { name: 'Anuluj' })
  }

  async goto(animalId: string) {
    await this.page.goto(AnimalEventsPage.path(animalId))
    await expect(this.heading).toBeVisible()
  }

  async openAddForm() {
    await this.addButton.click()
    await expect(this.addForm).toBeVisible()
  }

  async fillAddForm(values: EventFormValues) {
    if (values.type) {
      await chooseOption(this.typeField.select, EVENT_TYPE_LABEL[values.type])
    }
    if (values.occurredOn !== undefined) {
      await this.dateField.input.fill(values.occurredOn)
    }
    if (values.description !== undefined) {
      await this.descriptionField.input.fill(values.description)
    }
  }

  async addEvent(values: Required<EventFormValues>) {
    await this.openAddForm()
    await this.fillAddForm(values)
    await this.saveButton.click()
    await expect(this.addForm).toBeHidden()
    await expect(this.row(values.description).root).toBeVisible()
  }
}

export type HealthRecordFormValues = {
  occurredOn?: string
  description?: string
  document?: UploadFile
}

export const HEALTH_COLUMN = {
  date: 0,
  description: 1,
  performedBy: 2,
  document: 3,
} as const

export class DocumentCell {
  readonly openButton: Locator
  readonly fileName: Locator
  readonly replaceButton: Locator
  readonly removeButton: Locator
  readonly choosePrompt: Locator
  readonly error: Locator
  private readonly fileInput: Locator

  constructor(readonly root: Locator) {
    this.openButton = root.getByRole('button').filter({
      has: root.page().locator('span.truncate'),
    })
    this.fileName = root.locator('span.truncate')
    this.replaceButton = root.getByRole('button', { name: 'Zmień plik' })
    this.removeButton = root.getByRole('button', { name: 'Usuń' })
    this.choosePrompt = root.getByText('Wybierz plik')
    this.error = root.locator('p.text-red-500')
    this.fileInput = root.locator('input[type="file"]')
  }

  async upload(file: UploadFile) {
    await this.fileInput.setInputFiles(file)
  }
}

export class AnimalHealthRecordsPage extends RecordsTab {
  static path = (animalId: string) => `/animal/${animalId}/medical-records`

  readonly heading: Locator
  readonly addButton: Locator

  readonly dateField: FormFieldLocator
  readonly descriptionField: FormFieldLocator
  readonly documentField: FormFieldLocator
  readonly clearDocumentButton: Locator
  readonly saveButton: Locator
  readonly cancelButton: Locator

  private readonly documentInput: Locator

  constructor(page: Page) {
    super(page, 'Brak kart zdrowia.')
    this.heading = page.getByRole('heading', { name: 'Karty zdrowia' })
    this.addButton = page.getByRole('button', { name: 'Dodaj kartę zdrowia' })

    this.dateField = new FormFieldLocator(this.addForm, 'Data')
    this.descriptionField = new FormFieldLocator(this.addForm, 'Opis')
    this.documentField = new FormFieldLocator(
      this.addForm,
      'Dokument (opcjonalnie)',
    )
    this.documentInput = this.addForm.locator('input[type="file"]')
    this.clearDocumentButton = this.documentField.root.getByRole('button')
    this.saveButton = this.addForm.getByRole('button', { name: 'Zapisz' })
    this.cancelButton = this.addForm.getByRole('button', { name: 'Anuluj' })
  }

  async goto(animalId: string) {
    await this.page.goto(AnimalHealthRecordsPage.path(animalId))
    await expect(this.heading).toBeVisible()
  }

  async openAddForm() {
    await this.addButton.click()
    await expect(this.addForm).toBeVisible()
  }

  async fillAddForm(values: HealthRecordFormValues) {
    if (values.occurredOn !== undefined) {
      await this.dateField.input.fill(values.occurredOn)
    }
    if (values.description !== undefined) {
      await this.descriptionField.input.fill(values.description)
    }
    if (values.document) {
      await this.documentInput.setInputFiles(values.document)
    }
  }

  async addRecord(
    values: HealthRecordFormValues & {
      occurredOn: string
      description: string
    },
  ) {
    await this.openAddForm()
    await this.fillAddForm(values)
    await this.saveButton.click()
    await expect(this.addForm).toBeHidden()
    await expect(this.row(values.description).root).toBeVisible()
  }

  documentCell(row: RecordRow) {
    return new DocumentCell(row.cell(HEALTH_COLUMN.document))
  }

  async openDocument(row: RecordRow) {
    await this.page.evaluate(() => {
      const target = window as unknown as { __openedUrls: Array<string> }
      target.__openedUrls = []
      window.open = (url) => {
        target.__openedUrls.push(String(url))
        return null
      }
    })
    await this.documentCell(row).openButton.click()
    const opened = await this.page.evaluate(
      () => (window as unknown as { __openedUrls: Array<string> }).__openedUrls,
    )
    expect(opened, 'the document should be opened exactly once').toHaveLength(1)
    return opened[0]
  }
}
