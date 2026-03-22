import { expect, test } from '@playwright/test'
import { AnimalHelper } from '../helpers/animal-helper'
import { AnimalTablePage } from '../pages/AnimalTablePage'

test.describe('Animal List Filtering and Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')
  })

  test('Should filter animals by species - Dogs', async ({
    page,
  }) => {
    const animalHelper = new AnimalHelper(page)

    const animals = await animalHelper.createMultipleAnimals(4, [
      { species: 1, name: 'Dog1' },
      { species: 1, name: 'Dog2' },
      { species: 2, name: 'Cat1' },
      { species: 2, name: 'Cat2' },
    ])

    const tablePage = new AnimalTablePage(page)
    await tablePage.filterBySpecies('dogs')
    await tablePage.waitForTableUpdate()

    await expect(page.getByText(animals[0].name)).toBeVisible()
    await expect(page.getByText(animals[1].name)).toBeVisible()
  })

  test('Should filter animals by species - Cats', async ({
    page,
  }) => {
    const animalHelper = new AnimalHelper(page)

    const animals = await animalHelper.createMultipleAnimals(4, [
      { species: 1, name: 'Dog1' },
      { species: 1, name: 'Dog2' },
      { species: 2, name: 'Cat1' },
      { species: 2, name: 'Cat2' },
    ])

    const tablePage = new AnimalTablePage(page)
    await tablePage.filterBySpecies('cats')
    await tablePage.waitForTableUpdate()

    await expect(page.getByText(animals[2].name)).toBeVisible()
    await expect(page.getByText(animals[3].name)).toBeVisible()
  })

  test('Should search animals by name', async ({ page }) => {
    const animalHelper = new AnimalHelper(page)

    const uniqueName = `SearchTest-${Date.now()}`
    const animal = await animalHelper.createAnimal({ name: uniqueName })

    const tablePage = new AnimalTablePage(page)
    await tablePage.search(uniqueName)
    await tablePage.waitForTableUpdate()

    await tablePage.expectAnimalInTable(animal.signature)
    await expect(page.getByText(uniqueName)).toBeVisible()
  })

  test('Should search animals by transponder code', async ({
    page,
  }) => {
    const animalHelper = new AnimalHelper(page)

    const uniqueTransponder = '123456789012345'
    const animal = await animalHelper.createAnimal({
      transponderCode: uniqueTransponder,
    })

    const tablePage = new AnimalTablePage(page)
    await tablePage.search(uniqueTransponder)
    await tablePage.waitForTableUpdate()

    await tablePage.expectAnimalInTable(animal.signature)
  })

  test('Should search animals by signature', async ({ page }) => {
    const animalHelper = new AnimalHelper(page)
    const animal = await animalHelper.createAnimal()

    const tablePage = new AnimalTablePage(page)
    await tablePage.search(animal.signature)
    await tablePage.waitForTableUpdate()

    await tablePage.expectAnimalInTable(animal.signature)
    await expect(page.getByText(animal.name)).toBeVisible()
  })

  test('Should reset filters to show all animals', async ({
    page,
  }) => {
    const animalHelper = new AnimalHelper(page)
    await animalHelper.createMultipleAnimals(2)

    const tablePage = new AnimalTablePage(page)

    await tablePage.filterBySpecies('dogs')
    await tablePage.waitForTableUpdate()

    await tablePage.filterBySpecies('all')
    await tablePage.waitForTableUpdate()

    const count = await tablePage.getVisibleAnimalsCount()
    expect(count).toBeGreaterThanOrEqual(2)
  })

  test('Should select multiple animals for reports', async ({
    page,
  }) => {
    const animalHelper = new AnimalHelper(page)

    const animals = await animalHelper.createMultipleAnimals(3)

    const tablePage = new AnimalTablePage(page)
    await tablePage.selectAnimalRow(animals[0].signature)
    await tablePage.selectAnimalRow(animals[1].signature)

    const selectedCount = await tablePage.getSelectedCount()
    expect(selectedCount).toBe(2)
  })
})
