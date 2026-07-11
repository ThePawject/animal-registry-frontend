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

export type AnimalSpecies = AnimalData['species']
export type AnimalSex = NonNullable<AnimalData['sex']>

export function getCurrentAnimalId(page: Page, context: string) {
  const match = page.url().match(/\/animal\/([^/?]+)/)
  if (!match) throw new Error(`${context}: no animal ID in URL`)
  return match[1]
}

export async function selectAnimalSpecies(page: Page, species: AnimalSpecies) {
  await page.getByTestId('species-select').click()
  await page.getByRole('option', { name: species }).click()
}

export async function selectAnimalSex(page: Page, sex: AnimalSex) {
  await page.getByTestId('sex-select').click()
  await page.getByRole('option', { name: sex }).click()
}

export async function navigateToCreateAnimal(page: Page) {
  await page.goto('/create')
  await page.waitForLoadState('networkidle')
}

async function generateSignature(page: Page) {
  for (let attempt = 0; attempt < 10; attempt++) {
    await page.getByTestId('generate-signature-btn').click()
    const ok = await page.waitForFunction(
      () => {
        const input = document.querySelector('#Oznaczenie') as HTMLInputElement
        return input && input.value.length > 0
      },
      { timeout: 10000 }
    ).then(() => true).catch(() => false)
    if (ok) break
  }
}

export async function fillAnimalForm(page: Page, data: AnimalData) {
  if (data.name) {
    await page.getByTestId('name-input').fill(data.name)
  }

  await selectAnimalSpecies(page, data.species)

  await generateSignature(page)

  if (data.sex) {
    await selectAnimalSex(page, data.sex)
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
  const deadline = Date.now() + 120000
  while (true) {
    const [response] = await Promise.all([
      page.waitForResponse(
        (resp) => /\/animals($|\?)/.test(new URL(resp.url()).pathname) && resp.request().method() === 'POST',
        { timeout: 120000 }
      ),
      page.getByTestId('submit-add-animal').click(),
    ])

    if (response.ok()) {
      await page.waitForURL(/localhost:3000\/?(\?.*)?$/)
      return
    }

    if (response.status() === 400 && Date.now() < deadline) {
      const body = await response.json().catch(() => ({}))
      const errors: string[] = body?.errors?.generalErrors ?? []
      if (errors.some((e) => e.includes('is already in use'))) {
        await generateSignature(page)
        continue
      }
    }

    if (response.status() >= 500 && Date.now() < deadline) {
      await page.waitForTimeout(5000)
      continue
    }

    throw new Error(`submitAnimalForm failed with status ${response.status()}`)
  }
}

export async function createAnimal(page: Page, data: AnimalData) {
  await navigateToCreateAnimal(page)
  await fillAnimalForm(page, data)
  await submitAnimalForm(page)
}

export async function searchAnimalRowByName(page: Page, name: string) {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.getByTestId('animal-search-input').pressSequentially(name, { delay: 50 })
  return page.getByTestId('animals-table').locator('tbody tr').filter({ hasText: name }).first()
}

export async function navigateToAnimalByName(page: Page, name: string) {
  const row = await searchAnimalRowByName(page, name)
  await row.waitFor({ state: 'visible' })
  const detailsLink = row.getByTestId('animal-details-link')
  await detailsLink.waitFor({ state: 'visible' })
  const href = await detailsLink.getAttribute('href')
  if (!href) throw new Error(`navigateToAnimalByName: no href for "${name}"`)
  await page.goto(href)
  await page.waitForLoadState('networkidle')
}

export async function navigateToAnimalView(page: Page) {
  const animalId = getCurrentAnimalId(page, 'navigateToAnimalView')
  await page.goto(`/animal/${animalId}`)
  await page.waitForLoadState('networkidle')
  await page.getByTestId('delete-animal-btn').waitFor({ state: 'visible' })
}

export async function navigateToEditTab(page: Page) {
  const animalId = getCurrentAnimalId(page, 'navigateToEditTab')
  await page.goto(`/animal/${animalId}/edit`)
  await page.waitForLoadState('networkidle')
}

export async function submitEditAnimalForm(page: Page) {
  await page.getByTestId('submit-edit-animal').click()
  await page.waitForURL(/\/animal\/[^/]+$/)
  await page.waitForLoadState('networkidle')
}

export async function openDeleteAnimalDialog(page: Page) {
  await page.getByTestId('delete-animal-btn').click()
  await page.getByTestId('delete-dialog-title').waitFor({ state: 'visible' })
}

export async function confirmDeleteAnimal(page: Page) {
  await page.getByTestId('confirm-delete-animal-btn').click()
  await page.waitForURL(/localhost:3000\/?(\?.*)?$/)
}

export async function cancelDeleteAnimalDialog(page: Page) {
  await page.getByTestId('cancel-delete-animal-btn').click()
}

export async function deleteCurrentAnimal(page: Page) {
  await openDeleteAnimalDialog(page)
  await confirmDeleteAnimal(page)
}

export async function cancelDeleteAnimal(page: Page) {
  await openDeleteAnimalDialog(page)
  await cancelDeleteAnimalDialog(page)
}
