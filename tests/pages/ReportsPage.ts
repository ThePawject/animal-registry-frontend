import {   expect } from '@playwright/test'
import type {Locator, Page} from '@playwright/test';

export class ReportsPage {
  private readonly page: Page
  private readonly reportEventsBtn: Locator
  private readonly reportAllAnimalsBtn: Locator
  private readonly reportSelectedAnimalsBtn: Locator
  private readonly animalCheckboxes: Locator

  constructor(page: Page) {
    this.page = page
    this.reportEventsBtn = page.getByTestId('report-events-btn')
    this.reportAllAnimalsBtn = page.getByTestId('report-all-animals-btn')
    this.reportSelectedAnimalsBtn = page.getByTestId(
      'report-selected-animals-btn',
    )
    this.animalCheckboxes = page.getByRole('checkbox', { name: /Select row/i })
  }


  async downloadEventsReport() {
    await expect(this.reportEventsBtn).toBeVisible()
    const downloadPromise = this.page.waitForEvent('download')
    await this.reportEventsBtn.click()
    return await downloadPromise
  }

  async downloadAllAnimalsReport() {
    await expect(this.reportAllAnimalsBtn).toBeVisible()
    const downloadPromise = this.page.waitForEvent('download')
    await this.reportAllAnimalsBtn.click()
    return await downloadPromise
  }

  async selectFirstAnimal() {
    const firstCheckbox = this.animalCheckboxes.first()
    await firstCheckbox.check()
    await expect(firstCheckbox).toBeChecked()
  }

  async downloadSelectedAnimalsReport() {
    await expect(this.reportSelectedAnimalsBtn).toBeVisible()
    await expect(this.reportSelectedAnimalsBtn).toBeEnabled()
    const downloadPromise = this.page.waitForEvent('download')
    await this.reportSelectedAnimalsBtn.click()
    return await downloadPromise
  }
}
