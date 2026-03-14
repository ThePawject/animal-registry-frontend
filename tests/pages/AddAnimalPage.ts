import {   expect } from '@playwright/test'
import type {Locator, Page} from '@playwright/test';
import type { AnimalData } from '../helpers/data-generator'

export class AddAnimalPage {
  private readonly page: Page
  readonly nameInput: Locator
  readonly signatureInput: Locator
  readonly generateSignatureBtn: Locator
  readonly transponderInput: Locator
  readonly speciesSelect: Locator
  readonly sexSelect: Locator
  readonly colorInput: Locator
  readonly birthDateInput: Locator
  readonly submitBtn: Locator
  readonly cancelBtn: Locator

  constructor(page: Page) {
    this.page = page
    this.nameInput = page.getByTestId('animal-name-input')
    this.signatureInput = page.getByTestId('animal-signature-input')
    this.generateSignatureBtn = page.getByTestId('generate-signature-btn')
    this.transponderInput = page.getByTestId('animal-transponder-input')
    this.speciesSelect = page.getByTestId('animal-species-select').locator('select')
    this.sexSelect = page.getByTestId('animal-sex-select').locator('select')
    this.colorInput = page.getByTestId('animal-color-input')
    this.birthDateInput = page.getByTestId('animal-birthdate-input')
    this.submitBtn = page.getByTestId('submit-animal-btn')
    this.cancelBtn = page.getByTestId('cancel-animal-btn')
  }

  async fillForm(data: AnimalData): Promise<void> {
    await this.nameInput.fill(data.name)

    if (data.signature) {
      await this.signatureInput.fill(data.signature)
    }

    await this.transponderInput.fill(data.transponderCode)
    await this.speciesSelect.selectOption(data.species.toString())
    await this.sexSelect.selectOption(data.sex.toString())
    await this.colorInput.fill(data.color)
    await this.birthDateInput.fill(data.birthDate)
  }

  async generateSignature(): Promise<string> {
    const oldValue = await this.signatureInput.inputValue()
    await this.generateSignatureBtn.click()
    
    await expect(this.signatureInput).not.toHaveValue(oldValue, { timeout: 5000 })
    return await this.signatureInput.inputValue()
  }

  async uploadImage(filePath: string): Promise<void> {
    const fileInput = this.page.locator('input[type="file"]')
    await fileInput.setInputFiles(filePath)
  }

  async submit(): Promise<void> {
    const maxRetries = 3
    let attempt = 0

    while (attempt < maxRetries) {
      await this.submitBtn.click()

      try {
        await this.page.waitForURL('/', { timeout: 10000 })
        return
      } catch (error) {
        const errorMessage = await this.page
          .locator('text=/jest już zajęte/i')
          .textContent()
          .catch(() => null)

        if (errorMessage && attempt < maxRetries - 1) {
          await this.page.waitForTimeout(500)
          await this.generateSignature()
          await this.page.waitForTimeout(300)
          attempt++
          continue
        }

        throw error
      }
    }
  }

  async cancel(): Promise<void> {
    await this.cancelBtn.click()
    await this.page.waitForURL('/')
  }

  async expectFormVisible(): Promise<void> {
    await expect(this.nameInput).toBeVisible()
    await expect(this.submitBtn).toBeVisible()
  }
}
