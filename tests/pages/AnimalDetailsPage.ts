import {   expect } from '@playwright/test'
import type {Locator, Page} from '@playwright/test';
import type { AnimalData } from '../helpers/data-generator'

export class AnimalDetailsPage {
  private readonly page: Page
  readonly nameHeading: Locator
  readonly signatureValue: Locator
  readonly speciesValue: Locator
  readonly sexValue: Locator
  readonly colorValue: Locator
  readonly birthDateValue: Locator

  constructor(page: Page) {
    this.page = page
    this.nameHeading = page.getByTestId('animal-details-name')
    this.signatureValue = page.getByTestId('animal-details-signature')
    this.speciesValue = page.getByTestId('animal-details-species')
    this.sexValue = page.getByTestId('animal-details-sex')
    this.colorValue = page.getByTestId('animal-details-color')
    this.birthDateValue = page.getByTestId('animal-details-birthdate')
  }

  async getAnimalName(): Promise<string> {
    return (await this.nameHeading.textContent()) || ''
  }


  async expectAnimalData(expected: Partial<AnimalData>): Promise<void> {
    if (expected.name) {
      await expect(this.nameHeading).toContainText(expected.name)
    }
    if (expected.color) {
      await expect(this.colorValue).toContainText(expected.color)
    }
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle')
    await expect(this.nameHeading).toBeVisible()
  }
}
