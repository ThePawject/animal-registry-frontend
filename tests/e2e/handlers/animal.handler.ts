import type { Page } from '@playwright/test'

export type AnimalData = {
  name?: string
  species: 'Pies' | 'Kot'
  sex?: 'Samiec' | 'Samica'
  breed?: string
  color?: string
  distinguishingMarks?: string
  birthDate?: string
}

export async function navigateToCreateAnimal(page: Page) {
  await page.goto('/create')
  await page.waitForLoadState('networkidle')
}

export async function fillAnimalForm(page: Page, data: AnimalData) {
  if (data.name) {
    await page.getByTestId('name-input').fill(data.name)
  }

  await page.getByTestId('species-select').click()
  await page.getByRole('option', { name: data.species }).click()

  await page.getByTestId('generate-signature-btn').click()
  await page.waitForFunction(() => {
    const input = document.querySelector('#Oznaczenie') as HTMLInputElement
    return input && input.value.length > 0
  })

  if (data.sex) {
    await page.getByTestId('sex-select').click()
    await page.getByRole('option', { name: data.sex }).click()
  }

  if (data.breed) {
    await page.getByTestId('breed-input').fill(data.breed)
  }

  if (data.color) {
    await page.getByTestId('color-input').fill(data.color)
  }

  if (data.distinguishingMarks) {
    await page.getByTestId('distinguishing-marks-input').fill(data.distinguishingMarks)
  }

  if (data.birthDate) {
    await page.getByTestId('birth-date-input').fill(data.birthDate)
  }
}

export async function submitAnimalForm(page: Page) {
  await page.getByTestId('submit-add-animal').click()
  await page.waitForURL(/localhost:3000\/?(\?.*)?$/)
}

export async function createAnimal(page: Page, data: AnimalData) {
  await navigateToCreateAnimal(page)
  await fillAnimalForm(page, data)
  await submitAnimalForm(page)
}

export async function navigateToAnimalByName(page: Page, name: string) {
  await page.waitForLoadState('networkidle')
  const row = page.getByTestId('animals-table').locator('tbody tr').filter({ hasText: name }).first()
  await row.getByTestId('animal-details-link').click()
  await page.waitForLoadState('networkidle')
}

export async function deleteCurrentAnimal(page: Page) {
  await page.getByTestId('delete-animal-btn').click()
  await page.getByTestId('confirm-delete-animal-btn').click()
  await page.waitForURL(/localhost:3000\/?(\?.*)?$/)
}
