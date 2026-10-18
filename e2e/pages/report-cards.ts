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

export class ReportCard {
  readonly root: Locator
  readonly generateButton: Locator
  readonly error: Locator

  constructor(
    readonly page: Page,
    title: string,
  ) {
    this.root = page.locator('[data-slot="card"]').filter({
      has: page
        .locator('[data-slot="card-title"]')
        .getByText(title, { exact: true }),
    })
    this.generateButton = this.root.getByRole('button', {
      name: 'Generuj raport',
    })
    this.error = this.root.getByRole('alert')
  }
}

export class EventReportCard extends ReportCard {
  readonly customStartDate: Locator
  readonly customEndDate: Locator

  constructor(page: Page) {
    super(page, 'Raport zdarzeń')
    this.customStartDate = this.root.getByLabel('Data początkowa')
    this.customEndDate = this.root.getByLabel('Data końcowa')
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
}

export const DATE_RANGE_REPORT_ERRORS = {
  startRequired: 'Data początkowa jest wymagana',
  endRequired: 'Data końcowa jest wymagana',
  endNotAfterStart: 'Data końcowa musi być późniejsza niż data początkowa',
} as const

export class DateRangeReportCard extends ReportCard {
  readonly startDateField: FormFieldLocator
  readonly endDateField: FormFieldLocator
  readonly eventTypeField: FormFieldLocator
  readonly speciesField: FormFieldLocator
  private readonly title: Locator

  constructor(page: Page) {
    super(page, 'Raport zdarzeń w zakresie')
    this.title = this.root.getByText('Raport zdarzeń w zakresie', {
      exact: true,
    })
    this.startDateField = new FormFieldLocator(this.root, 'Data początkowa')
    this.endDateField = new FormFieldLocator(this.root, 'Data końcowa')
    this.eventTypeField = new FormFieldLocator(this.root, 'Typ zdarzenia')
    this.speciesField = new FormFieldLocator(this.root, 'Gatunek')
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
}

export class AnimalsReportCard extends ReportCard {
  constructor(page: Page) {
    super(page, 'Wszystkie zwierzęta')
  }
}

export class ReportsPage {
  static readonly path = '/reports'

  constructor(readonly page: Page) {}

  async goto() {
    await this.page.goto(ReportsPage.path)
    await expect(
      this.page.getByRole('heading', { name: 'Zwierzęta', level: 2 }),
    ).toBeVisible({ timeout: TIMEOUTS.slow })
  }
}
