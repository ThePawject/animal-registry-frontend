import { expect } from '@playwright/test'
import { chooseOption, escapeRegExp } from './components.ts'
import type { Locator, Page } from '@playwright/test'

export type SpeciesFilter = 'Wszystkie gatunki' | 'Pies' | 'Kot'
export type StatusFilter =
  'Wszystkie statusy' | 'W schronisku' | 'Poza schroniskiem'
export type PageSize = 10 | 20 | 50

export const ANIMAL_TABLE_COLUMNS = [
  'Zdjęcie',
  'Oznaczenie',
  'Imię',
  'Rasa',
  'Znaki szczególne',
  'Gatunek',
  'Płeć',
  'Umaszczenie',
  'Wiek',
  'Status',
  'Data dodania',
  'Akcje',
] as const

type AnimalColumn = (typeof ANIMAL_TABLE_COLUMNS)[number]

export class AnimalRow {
  constructor(readonly root: Locator) {}

  cell(column: AnimalColumn) {
    return this.root.locator('td').nth(ANIMAL_TABLE_COLUMNS.indexOf(column) + 1)
  }

  get checkbox() {
    return this.root.getByRole('checkbox', { name: 'Select row' })
  }

  get detailsLink() {
    return this.root.getByRole('link', { name: 'Szczegóły' })
  }

  get photo() {
    return this.cell('Zdjęcie').locator('img')
  }
}

export class PanelPage {
  static readonly path = '/panel'

  readonly addAnimalLink: Locator
  readonly searchInput: Locator
  readonly searchInfoButton: Locator
  readonly searchInfoPopover: Locator
  readonly dismissSearchInfoButton: Locator

  readonly speciesFilter: Locator
  readonly statusFilter: Locator
  readonly pageSizeSelect: Locator

  readonly table: Locator
  readonly rows: Locator
  readonly emptyState: Locator
  readonly pageIndicator: Locator
  readonly firstPageButton: Locator
  readonly previousPageButton: Locator
  readonly nextPageButton: Locator
  readonly lastPageButton: Locator
  readonly selectAllCheckbox: Locator

  readonly eventReportButton: Locator
  readonly allAnimalsReportButton: Locator
  readonly selectedAnimalsReportButton: Locator
  readonly dateRangeReportButton: Locator

  private readonly skeletons: Locator
  private readonly tableWrapper: Locator

  constructor(readonly page: Page) {
    this.addAnimalLink = page.getByRole('link', { name: 'Dodaj zwierzę' })
    this.searchInput = page.getByPlaceholder('Szukaj zwierząt...')
    this.searchInfoButton = page.getByRole('button', {
      name: 'Dodatkowe informacje',
    })
    this.searchInfoPopover = page
      .locator('[data-slot="popover-content"]')
      .filter({ hasText: 'Jak działa wyszukiwanie?' })
    this.dismissSearchInfoButton = page.getByRole('button', {
      name: 'Nie pokazuj ponownie',
    })

    this.speciesFilter = page.getByRole('combobox', { name: 'Gatunek' })
    this.statusFilter = page.getByRole('combobox', { name: 'Status' })
    this.pageSizeSelect = page.getByRole('combobox', {
      name: 'Wierszy na stronę',
    })

    this.table = page.locator('table')
    this.tableWrapper = page.locator('[aria-busy]').filter({ has: this.table })
    this.skeletons = this.table.locator('[data-slot="skeleton"]')
    this.rows = this.table.locator('tbody tr').filter({
      has: page.getByRole('link', { name: 'Szczegóły' }),
    })
    this.emptyState = this.table.getByText('Brak wyników.')
    this.selectAllCheckbox = this.table.getByRole('checkbox', {
      name: 'Select all rows',
    })

    this.pageIndicator = page.getByText(/^Strona \d+ z \d+$/)
    this.firstPageButton = page.getByRole('button', { name: 'Pierwsza strona' })
    this.previousPageButton = page.getByRole('button', {
      name: 'Poprzednia strona',
    })
    this.nextPageButton = page.getByRole('button', { name: 'Następna strona' })
    this.lastPageButton = page.getByRole('button', { name: 'Ostatnia strona' })

    this.eventReportButton = page.getByRole('button', {
      name: 'Raport zdarzeń',
      exact: true,
    })
    this.allAnimalsReportButton = page.getByTitle(
      'Eksport tekstowy danych zwierząt do PDF (bez zdjęć).',
    )
    this.selectedAnimalsReportButton = page.getByTitle(
      'PDF zawierający dane i zdjęcia wybranych zwierząt (siatka zdjęć).',
    )
    this.dateRangeReportButton = page.getByRole('button', {
      name: 'Raport zdarzen w zakresie',
    })
  }

  async goto(search: Record<string, string | number | boolean> = {}) {
    const params = new URLSearchParams(
      Object.entries(search).map(([key, value]) => [key, String(value)]),
    )
    const query = params.size ? `?${params}` : ''
    await this.page.goto(`${PanelPage.path}${query}`)
    await this.expectLoaded()
  }

  async expectLoaded() {
    await expect(this.table).toBeVisible()
    await expect(this.skeletons).toHaveCount(0)
    await expect(this.tableWrapper).toHaveAttribute('aria-busy', 'false')
  }

  row(text: string) {
    return new AnimalRow(this.rows.filter({ hasText: text }))
  }

  async expectColumn(column: AnimalColumn, values: Array<string>) {
    const index = ANIMAL_TABLE_COLUMNS.indexOf(column) + 2
    await expect(this.rows.locator(`td:nth-child(${index})`)).toHaveText(values)
  }

  async columnValues(column: AnimalColumn) {
    await this.expectLoaded()
    const index = ANIMAL_TABLE_COLUMNS.indexOf(column) + 1
    const cells = await this.rows.locator(`td:nth-child(${index + 1})`).all()
    return Promise.all(
      cells.map(async (cell) => (await cell.innerText()).trim()),
    )
  }

  async search(text: string) {
    await this.searchInput.fill(text)
    if (text) {
      const expected = [text, JSON.stringify(text)]
      await expect(this.page).toHaveURL((url) =>
        expected.includes(url.searchParams.get('query') ?? ''),
      )
    } else {
      await expect(this.page).not.toHaveURL(/[?&]query=/)
    }
    await this.expectLoaded()
  }

  async filterBySpecies(option: SpeciesFilter) {
    await chooseOption(this.speciesFilter, option)
    await this.expectLoaded()
  }

  async filterByStatus(option: StatusFilter) {
    await chooseOption(this.statusFilter, option)
    await this.expectLoaded()
  }

  async setPageSize(size: PageSize) {
    await chooseOption(this.pageSizeSelect, String(size))
    await this.expectLoaded()
  }

  async expectPage(current: number, total: number) {
    await expect(this.pageIndicator).toHaveText(`Strona ${current} z ${total}`)
    await this.expectLoaded()
  }

  async expectAnimals(names: Array<string>) {
    await this.expectLoaded()
    await expect(this.rows).toHaveCount(names.length)
    for (const name of names) {
      await expect(
        this.rows.filter({ hasText: new RegExp(escapeRegExp(name)) }),
      ).toHaveCount(1)
    }
  }

  async expectEmpty() {
    await this.expectLoaded()
    await expect(this.emptyState).toBeVisible()
    await expect(this.rows).toHaveCount(0)
  }

  async openDetails(text: string) {
    await this.row(text).detailsLink.click()
  }
}
