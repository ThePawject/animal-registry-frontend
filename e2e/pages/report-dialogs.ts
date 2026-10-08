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
    this.error = this.root.getByRole('alert')
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

  async pick(field: FormFieldLocator, options: Array<string>) {
    const suggestions = this.page.getByRole('listbox')

    await field.input.click()
    for (const option of options) {
      await this.page.getByRole('option', { name: option, exact: true }).click()
      await expect(this.chips(field).filter({ hasText: option })).toBeVisible({
        timeout: TIMEOUTS.ui,
      })
    }

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
