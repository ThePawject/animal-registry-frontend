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
}

export type Photo = {
  id: string
  blobUrl: string
  fileName: string
  isMain: boolean
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
