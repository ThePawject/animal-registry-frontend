import { faker } from '@faker-js/faker'

export type Animal = {
  animalId: number
  name: string
  type: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other'
  breed: string
  age: number
  status: 'available' | 'adopted' | 'pending' | 'medical'
  admissionDate: Date
}

const range = (len: number) => {
  const arr: Array<number> = []
  for (let i = 0; i < len; i++) {
    arr.push(i)
  }
  return arr
}

const animalTypes: Array<Animal['type']> = [
  'dog',
  'cat',
  'bird',
  'rabbit',
  'other',
]
const animalStatuses: Array<Animal['status']> = [
  'available',
  'adopted',
  'pending',
  'medical',
]

const animalBreeds: Record<Animal['type'], Array<string>> = {
  dog: [
    'Labrador',
    'German Shepherd',
    'Golden Retriever',
    'Bulldog',
    'Beagle',
    'Poodle',
    'Husky',
  ],
  cat: [
    'Persian',
    'Maine Coon',
    'Siamese',
    'British Shorthair',
    'Ragdoll',
    'Bengal',
  ],
  bird: ['Parakeet', 'Cockatiel', 'Canary', 'Parrot', 'Finch'],
  rabbit: [
    'Holland Lop',
    'Netherland Dwarf',
    'Lionhead',
    'Rex',
    'Flemish Giant',
  ],
  other: ['Hamster', 'Guinea Pig', 'Ferret', 'Chinchilla', 'Turtle'],
}

const newAnimal = (num: number): Animal => {
  const type = faker.helpers.arrayElement(animalTypes)
  const breed = faker.helpers.arrayElement(animalBreeds[type])

  return {
    animalId: num,
    name: faker.person.firstName(),
    type,
    breed,
    age: faker.number.int({ min: 0, max: 15 }),
    status: faker.helpers.arrayElement(animalStatuses),
    admissionDate: faker.date.past({ years: 2 }),
  }
}

export function makeAnimalData(len: number) {
  return range(len).map(newAnimal)
}

// --- Persistent dataset for mock API:
const PERSISTENT_ANIMAL_DATA: Array<Animal> = makeAnimalData(5000)

// --- Mock API with search/pagination ---

export async function mockAnimalApi({
  page = 0,
  pageSize = 20,
  search = '',
}: {
  page?: number
  pageSize?: number
  search?: string
}) {
  // Simulate latency
  await new Promise((r) => setTimeout(r, 250))

  let filtered = PERSISTENT_ANIMAL_DATA
  if (search) {
    const s = search.toLowerCase()
    filtered = filtered.filter((a) => a.name.toLowerCase().includes(s))
  }
  const total = filtered.length
  const start = page * pageSize
  const end = start + pageSize
  const data = filtered.slice(start, end)
  return { data, total }
}
