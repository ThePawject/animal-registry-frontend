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

export const REPORT_TABS = {
  animals: { name: 'Zwierzęta', param: 'zwierzeta' },
  events: { name: 'Zdarzenia', param: 'zdarzenia' },
  vaccinations: { name: 'Szczepienia', param: 'szczepienia' },
  origin: { name: 'Pochodzenie', param: 'pochodzenie' },
} as const

export type ReportTab = keyof typeof REPORT_TABS

export class ReportsPage {
  static readonly path = '/reports'

  readonly tabs: Locator

  constructor(readonly page: Page) {
    this.tabs = page.getByRole('tab')
  }

  tab(tab: ReportTab) {
    return this.page.getByRole('tab', { name: REPORT_TABS[tab].name })
  }

  async goto(tab: ReportTab = 'animals') {
    await this.page.goto(`${ReportsPage.path}?tab=${REPORT_TABS[tab].param}`)
    await expect(this.tab(tab)).toHaveAttribute('aria-selected', 'true', {
      timeout: TIMEOUTS.slow,
    })
  }

  async open(tab: ReportTab) {
    await this.tab(tab).click()
    await expect(this.tab(tab)).toHaveAttribute('aria-selected', 'true')
  }
}

export class SelectedAnimalsReportCard extends ReportCard {
  readonly chooseButton: Locator
  readonly summary: Locator
  readonly dialog: Locator
  readonly searchInput: Locator
  readonly selectPageCheckbox: Locator
  readonly selectedCount: Locator
  readonly clearButton: Locator
  readonly doneButton: Locator
  readonly pageIndicator: Locator
  readonly nextPageButton: Locator

  constructor(page: Page) {
    super(page, 'Wybrane zwierzęta')
    this.chooseButton = this.root.getByRole('button', {
      name: /^(Wybierz zwierzęta|Zmień wybór)$/,
    })
    this.summary = this.root.getByText(/^(Wybrano \d+:|Nie wybrano)/)
    this.dialog = page.getByRole('dialog', {
      name: 'Wybierz zwierzęta do raportu',
    })
    this.searchInput = this.dialog.getByPlaceholder(
      'Szukaj po imieniu lub sygnaturze',
    )
    this.selectPageCheckbox = this.dialog.getByRole('checkbox', {
      name: 'Zaznacz wszystkie na stronie',
    })
    this.selectedCount = this.dialog.getByText(/^Wybrano: \d+$/)
    this.clearButton = this.dialog.getByRole('button', { name: 'Wyczyść' })
    this.doneButton = this.dialog.getByRole('button', { name: 'Gotowe' })
    this.pageIndicator = this.dialog.getByText(/^Strona \d+ z \d+$/)
    this.nextPageButton = this.dialog.getByRole('button', {
      name: 'Następna strona',
    })
  }

  animalCheckbox(name: string) {
    return this.dialog.getByRole('checkbox', { name: `Zaznacz ${name}` })
  }

  async search(query: string) {
    await this.searchInput.fill(query)
    await expect(this.dialog.locator('tbody tr').first()).toContainText(query)
  }

  async choose(names: Array<string>) {
    await this.chooseButton.click()
    await expect(this.dialog).toBeVisible()
    for (const name of names) {
      await this.search(name)
      await this.animalCheckbox(name).check()
    }
    await this.doneButton.click()
    await expect(this.dialog).toBeHidden()
  }
}

export class VaccinationsReportCard extends ReportCard {
  readonly fromField: FormFieldLocator
  readonly toField: FormFieldLocator

  constructor(page: Page) {
    super(page, 'Szczepienia w okresie')
    this.fromField = new FormFieldLocator(this.root, 'Data początkowa')
    this.toField = new FormFieldLocator(this.root, 'Data końcowa')
  }

  async setRange(from: string, to: string) {
    await this.fromField.input.fill(from)
    await this.toField.input.fill(to)
  }
}

export class ExpiringVaccinationsReportCard extends ReportCard {
  readonly daysField: FormFieldLocator
  readonly includeExpired: Locator
  readonly inShelterOnly: Locator

  constructor(page: Page) {
    super(page, 'Kończące się szczepienia')
    this.daysField = new FormFieldLocator(this.root, 'Wygasają w ciągu (dni)')
    this.includeExpired = this.root.getByRole('checkbox', {
      name: 'Uwzględnij już wygasłe',
    })
    this.inShelterOnly = this.root.getByRole('checkbox', {
      name: 'Tylko zwierzęta w schronisku',
    })
  }
}
