export type Animal = {
  id: string
  signature: string
  transponderCode: string
  name: string
  color: string
  species: number
  sex: number
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
