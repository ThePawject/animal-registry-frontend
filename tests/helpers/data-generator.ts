import { randomUUID } from 'node:crypto'
import { faker } from '@faker-js/faker'

export interface AnimalData {
  name: string
  signature?: string
  transponderCode: string
  species: 1 | 2
  sex: 1 | 2
  color: string
  birthDate: string
}

export class AnimalDataGenerator {
  static generateUniqueName(): string {
    const petNames = [
      'Burek',
      'Azor',
      'Reksio',
      'Max',
      'Luna',
      'Mruczek',
      'Filemon',
      'Bonifacy',
      'Puszek',
      'Łatka',
    ]
    const randomName = faker.helpers.arrayElement(petNames)
    const uniqueSuffix = randomUUID().substring(0, 8)
    return `${randomName}-${uniqueSuffix}`
  }

  static generateTransponderCode(): string {
    return faker.string.numeric(15)
  }

  static generateColor(): string {
    const colors = [
      'brązowy',
      'czarny',
      'biały',
      'rudy',
      'szary',
      'biało-rudy',
      'czarno-biały',
    ]
    return faker.helpers.arrayElement(colors)
  }

  static generateBirthDate(
    minYearsAgo: number = 1,
    maxYearsAgo: number = 10,
  ): string {
    const date = faker.date.past({ years: maxYearsAgo })
    const minDate = new Date()
    minDate.setFullYear(minDate.getFullYear() - minYearsAgo)

    if (date > minDate) {
      return minDate.toISOString().split('T')[0]
    }

    return date.toISOString().split('T')[0]
  }

  static generateAnimal(overrides?: Partial<AnimalData>): AnimalData {
    return {
      name: AnimalDataGenerator.generateUniqueName(),
      transponderCode: AnimalDataGenerator.generateTransponderCode(),
      species: faker.helpers.arrayElement([1, 2] as const),
      sex: faker.helpers.arrayElement([1, 2] as const),
      color: AnimalDataGenerator.generateColor(),
      birthDate: AnimalDataGenerator.generateBirthDate(),
      ...overrides,
    }
  }
}
