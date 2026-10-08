import { expect } from '@playwright/test'
import { TIMEOUTS } from '../config/env.ts'
import { FormFieldLocator } from './components.ts'
import type { Locator, Page } from '@playwright/test'

export type EventReportPeriod =
  | 'Ostatni tydzień'
  | 'Ostatni miesiąc'
  | 'Ostatni kwartał'
  | 'Własny zakres dat'

export const EVENT_REPORT_ERRORS = {
  noPeriod: 'Wybierz przynajmniej jeden okres raportu.',
  customRangeIncomplete:
    'Wybierz datę początkową i końcową dla własnego zakresu.',
  customRangeInverted: 'Data początkowa nie może być późniejsza niż końcowa.',
} as const

/** "Raport zdarzeń": pick one or more periods and download a PDF. */
export class EventReportDialog {
  readonly root: Locator
  readonly customStartDate: Locator
  readonly customEndDate: Locator
  readonly generateButton: Locator
  readonly cancelButton: Locator
  readonly error: Locator

  constructor(readonly page: Page) {
    this.root = page.getByRole('dialog', { name: 'Raport zdarzeń' })
    this.customStartDate = this.root.getByLabel('Data początkowa')
    this.customEndDate = this.root.getByLabel('Data końcowa')
    this.generateButton = this.root.getByRole('button', {
      name: 'Generuj raport',
    })
    this.cancelButton = this.root.getByRole('button', { name: 'Anuluj' })
    this.error = this.root.locator('form > p.text-red-500')
  }

  period(label: EventReportPeriod) {
    return this.root.getByRole('checkbox', { name: label })
  }

  async setPeriods(selected: Array<EventReportPeriod>) {
    const all: Array<EventReportPeriod> = [
      'Ostatni tydzień',
      'Ostatni miesiąc',
      'Ostatni kwartał',
      'Własny zakres dat',
    ]
    for (const label of all) {
      await this.period(label).setChecked(selected.includes(label))
    }
  }

  async expectClosed() {
    await expect(this.root).toBeHidden()
  }
}

export const DATE_RANGE_REPORT_ERRORS = {
  startRequired: 'Data początkowa jest wymagana',
  endRequired: 'Data końcowa jest wymagana',
  endNotAfterStart: 'Data końcowa musi być późniejsza niż data początkowa',
} as const

/** "Filtruj raport": animals report for a date range, species and event types. */
export class DateRangeReportDialog {
  readonly root: Locator
  readonly startDateField: FormFieldLocator
  readonly endDateField: FormFieldLocator
  readonly eventTypeField: FormFieldLocator
  readonly speciesField: FormFieldLocator
  readonly generateButton: Locator
  readonly cancelButton: Locator
  private readonly title: Locator

  constructor(readonly page: Page) {
    // Found by markup rather than by role: the dialog has no accessible
    // title, and while one of its multi-selects is open the rest of the
    // dialog is hidden from the accessibility tree.
    this.root = page
      .locator('[data-slot="dialog-content"]')
      .filter({ hasText: 'Filtruj raport' })
    this.title = this.root.getByText('Filtruj raport', { exact: true })
    this.startDateField = new FormFieldLocator(this.root, 'Data początkowa')
    this.endDateField = new FormFieldLocator(this.root, 'Data końcowa')
    this.eventTypeField = new FormFieldLocator(this.root, 'Typ zdarzenia')
    this.speciesField = new FormFieldLocator(this.root, 'Gatunek')
    this.generateButton = this.root.getByRole('button', {
      name: 'Generuj raport',
    })
    this.cancelButton = this.root.getByRole('button', { name: 'Anuluj' })
  }

  async setRange(startDate: string, endDate: string) {
    await this.startDateField.input.fill(startDate)
    await this.endDateField.input.fill(endDate)
  }

  /** Adds values to one of the multi-select chip fields. */
  async pick(field: FormFieldLocator, options: Array<string>) {
    const suggestions = this.page.getByRole('listbox')

    // The suggestion list stays open between picks and covers the input, so
    // it is opened once and every option is chosen from the same list.
    await field.input.click()
    for (const option of options) {
      await this.page.getByRole('option', { name: option, exact: true }).click()
      await expect(this.chips(field).filter({ hasText: option })).toBeVisible({
        timeout: TIMEOUTS.ui,
      })
    }

    // Clicking elsewhere in the dialog closes the list, as a user would.
    await this.title.click()
    await expect(suggestions).toBeHidden({ timeout: TIMEOUTS.ui })
  }

  chips(field: FormFieldLocator) {
    return field.root.locator('[data-slot="combobox-chip"]')
  }

  async expectClosed() {
    await expect(this.root).toBeHidden()
  }
}
