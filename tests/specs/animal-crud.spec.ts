import { expect, test } from '@playwright/test'
import { AnimalHelper } from '../helpers/animal-helper'
import { AnimalDataGenerator } from '../helpers/data-generator'
import { AddAnimalPage } from '../pages/AddAnimalPage'
import { AnimalDetailsPage } from '../pages/AnimalDetailsPage'
import { AnimalTablePage } from '../pages/AnimalTablePage'

test.describe('Animal CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')
  })

  test('Should create new animal with all required fields', async ({
    page,
  }) => {
    const animalHelper = new AnimalHelper(page)
    const animalData = AnimalDataGenerator.generateAnimal()

    const addPage = new AddAnimalPage(page)
    await animalHelper.navigateToCreate()
    await addPage.expectFormVisible()
    const signature = await addPage.generateSignature()
    await addPage.fillForm(animalData)
    
    await addPage.uploadImage('tests/fixtures/example.png')
    await addPage.submit()

    const tablePage = new AnimalTablePage(page)
    await tablePage.expectAnimalInTable(signature)

    const createdAnimal = { ...animalData, signature }

    expect(createdAnimal.signature).toMatch(/\d{4}\/\d{4}/)
    expect(createdAnimal.name).toBe(animalData.name)
  })

  test('Should view animal details correctly', async ({
    page,
  }) => {
    const animalHelper = new AnimalHelper(page)
    const createdAnimal = await animalHelper.createAnimal()

    await animalHelper.navigateToView(createdAnimal.signature)

    const detailsPage = new AnimalDetailsPage(page)
    await detailsPage.expectAnimalData(createdAnimal)

    const displayedName = await detailsPage.getAnimalName()
    expect(displayedName).toContain(createdAnimal.name)
  })

  test('Should generate unique signature for animal', async ({
    page,
  }) => {
    const animalHelper = new AnimalHelper(page)

    await animalHelper.navigateToCreate()

    const addPage = new AddAnimalPage(page)
    const signature1 = await addPage.generateSignature()
    await addPage.cancel()

    await animalHelper.navigateToCreate()
    const signature2 = await addPage.generateSignature()

    expect(signature1).not.toBe(signature2)
    expect(signature1).toMatch(/\d{4}\/\d{4}/)
    expect(signature2).toMatch(/\d{4}\/\d{4}/)
  })

  test('Should create multiple animals successfully', async ({
    page,
  }) => {
    const animalHelper = new AnimalHelper(page)

    const animals = await animalHelper.createMultipleAnimals(2, [
      { species: 1, name: 'Dog-Test' },
      { species: 2, name: 'Cat-Test' },
    ])

    expect(animals).toHaveLength(2)
    expect(animals[0].name).toContain('Dog-Test')
    expect(animals[1].name).toContain('Cat-Test')

    const tablePage = new AnimalTablePage(page)
    await tablePage.expectAnimalInTable(animals[0].signature)
    await tablePage.expectAnimalInTable(animals[1].signature)
  })

  test('Should cancel animal creation', async ({ page }) => {
    const animalHelper = new AnimalHelper(page)
    await animalHelper.navigateToCreate()

    const addPage = new AddAnimalPage(page)
    await addPage.expectFormVisible()

    const animalData = AnimalDataGenerator.generateAnimal()
    await addPage.fillForm(animalData)
    await addPage.cancel()

    await expect(page).toHaveURL('/')
  })
})
