export type Animal = {
  id: string
  signature: string
  transponderCode: string
  name: string
  color: string
  species: Species
  sex: Sexes
  birthDate: string
  createdOn: string
  modifiedOn: string
  isActive: boolean
  shelterId: string
  mainPhoto: Photo | null
}

export type AnimalById = Omit<Animal, 'mainPhoto'> & {
  photos: Array<Photo>
  events: Array<AnimalEvent>
  mainPhotoId: string | null
}

export type Photo = {
  id: string
  url: string
  fileName: string
  uploadedOn: string
}

export type AnimalResponse = {
  items: Array<Animal>
  totalCount: number
  page: number
  pageSize: number
}

export type FetchAnimalsParams = {
  page: number
  pageSize: number
}

export const ANIMAL_EVENT_TYPE_MAP = {
  0: 'Brak',
  1: 'Przyjęcie do schroniska',
  2: 'Początek kwarantanny',
  3: 'Koniec kwarantanny',
  4: 'Szczepienie przeciw chorobom zakaźnym',
  5: 'Odrobaczenie',
  6: 'Odpluskwienie',
  7: 'Sterylizacja/Kastracja',
  8: 'Szczepienie przeciw wściekliźnie',
  9: 'Adopcja',
  10: 'Spacer',
  11: 'Nowy numer kennel',
  12: 'Odbiór przez właściciela',
  13: 'Ważenie',
  14: 'Eutanazja',
  15: 'Zgon',
} as const

export type AnimalEventType = keyof typeof ANIMAL_EVENT_TYPE_MAP

export type AnimalEvent = {
  id: string
  type: AnimalEventType
  occurredOn: string
  description: string
  performedBy: string
}

export type AddAnimal = {
  birthDate: string
  color: string
  mainPhotoIndex: number
  name: string
  photos: Array<File>
  sex: Sexes
  signature: string
  species: Species
  transponderCode: string
}

export type EditAnimal = {
  birthDate: string
  color: string
  existingPhotoIds: Array<string>
  id: string
  mainPhotoId: string | null
  mainPhotoIndex: number | null
  name: string
  newPhotos: Array<File>
  sex: Sexes
  signature: string
  species: Species
  transponderCode: string
}

export type EditAnimalForm = Omit<
  EditAnimal,
  'existingPhotoIds' | 'newPhotos'
> & {
  photos: Array<Photo | File>
}

export const SPECIES_MAP = {
  0: 'Brak',
  1: 'Pies',
  2: 'Kot',
}

export type Species = keyof typeof SPECIES_MAP

export const SEX_MAP = {
  0: 'Brak',
  1: 'Samiec',
  2: 'Samica',
}

export type Sexes = keyof typeof SEX_MAP
