import { AddAnimalPage } from '../pages/AddAnimalPage'
import { AnimalTablePage } from '../pages/AnimalTablePage'
import { AnimalDetailsPage } from '../pages/AnimalDetailsPage'
import {  AnimalDataGenerator } from './data-generator'
import type {AnimalData} from './data-generator';
import type {Page} from '@playwright/test';

export class AnimalHelper {
  constructor(private page: Page) {}

  async createAnimal(
    data?: Partial<AnimalData>,
  ): Promise<AnimalData & { signature: string }> {
    const animalData = AnimalDataGenerator.generateAnimal(data)

    const tablePage = new AnimalTablePage(this.page)
    await tablePage.clickAddAnimal()

    const addPage = new AddAnimalPage(this.page)
    await addPage.expectFormVisible()

    const signature = await addPage.generateSignature()
    await addPage.fillForm(animalData)
    await addPage.submit()

    await tablePage.expectAnimalInTable(signature)

    return {
      ...animalData,
      signature,
    }
  }

  async createMultipleAnimals(
    count: number,
    overrides?: Array<Partial<AnimalData>>,
  ): Promise<Array<AnimalData & { signature: string }>> {
    const animals: Array<AnimalData & { signature: string }> = []

    for (let i = 0; i < count; i++) {
      const override = overrides?.[i] || {}
      const animal = await this.createAnimal(override)
      animals.push(animal)
    }

    return animals
  }

  async navigateToCreate(): Promise<void> {
    const tablePage = new AnimalTablePage(this.page)
    await tablePage.clickAddAnimal()
  }

  async navigateToView(signature: string): Promise<void> {
    const tablePage = new AnimalTablePage(this.page)
    await tablePage.navigateToAnimalDetails(signature)

    const detailsPage = new AnimalDetailsPage(this.page)
    await detailsPage.waitForPageLoad()
  }
}
