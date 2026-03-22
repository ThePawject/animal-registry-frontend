import {   expect } from '@playwright/test'
import type {Locator, Page} from '@playwright/test';

export interface TableAnimal {
  signature: string
  name: string
  species: string
  sex: string
  color: string
}

export class AnimalTablePage {
  private readonly page: Page
  readonly searchInput: Locator
  readonly speciesFilter: Locator
  readonly addAnimalBtn: Locator

  constructor(page: Page) {
    this.page = page
    this.searchInput = page.getByTestId('animal-search-input')
    this.speciesFilter = page.getByTestId('animal-species-filter').getByRole('combobox')
    this.addAnimalBtn = page.getByTestId('add-animal-btn')
  }

  async search(keyword: string): Promise<void> {
    await this.searchInput.fill(keyword)
    await this.page.waitForTimeout(600)
  }

  async filterBySpecies(species: 'all' | 'dogs' | 'cats'): Promise<void> {
    await this.speciesFilter.click()

    const optionText =
      species === 'all'
        ? 'Wszystkie gatunki'
        : species === 'dogs'
          ? 'Pies'
          : 'Kot'
    await this.page.getByRole('option', { name: optionText }).click()

    await this.page.waitForTimeout(300)
  }


  async selectAnimalRow(signature: string): Promise<void> {
    const row = this.page.locator('tr', { hasText: signature })
    const checkbox = row.getByRole('checkbox')
    await checkbox.check()
  }

  async getSelectedCount(): Promise<number> {
    const text = await this.page
      .getByText(/raport z wybranych zwierzat/i)
      .textContent()
    const match = text?.match(/\((\d+)\)/)
    return match ? parseInt(match[1]) : 0
  }

  async navigateToAnimalDetails(signature: string): Promise<void> {
    const row = this.page.locator('tr', { hasText: signature })
    await row.getByTestId('animal-details-link').click()
    await this.page.waitForURL(/\/animal\/.+/)
  }

  async clickAddAnimal(): Promise<void> {
    await this.addAnimalBtn.click()
    await this.page.waitForURL('/create')
  }

  async expectAnimalInTable(signature: string): Promise<void> {
    await expect(this.page.getByText(signature)).toBeVisible()
  }

  async getVisibleAnimalsCount(): Promise<number> {
    const rows = await this.page.locator('tbody tr').count()
    return rows
  }

  async waitForTableUpdate(): Promise<void> {
    await this.page.waitForLoadState('networkidle')
    await this.page.waitForTimeout(300)
  }
}
