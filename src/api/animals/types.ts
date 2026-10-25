export type Animal = {
  id: string
  signature: string
  transponderCode: string | null
  name: string | null
  color: string
  breed: string
  species: Species
  sex: Sexes
  distinguishingMarks: string
  birthDate: string | null
  createdOn: string
  modifiedOn: string
  isInShelter: boolean
  shelterId: string
  mainPhoto: Photo | null
}

export const ADMISSION_METHOD_MAP = {
  0: 'Brak przypisania',
  1: 'Interwencja (Straż Miejska / Policja)',
  2: 'Podrzucony',
  3: 'Doprowadzony przez osobę fizyczną',
  4: 'Zwrot z adopcji',
  5: 'Przekazany z innego schroniska',
  6: 'Inne',
} as const

export type AdmissionMethod = keyof typeof ADMISSION_METHOD_MAP

export type MunicipalityReference = {
  id: string | null
  name: string
}

export type AnimalOrigin = {
  isAssigned: boolean
  admissionDate: string | null
  admissionMethod: AdmissionMethod
  admissionMethodName: string
  foundStreet: string
  foundMunicipality: MunicipalityReference
  contractorMunicipality: MunicipalityReference
}

export type AnimalOriginForm = {
  admissionDate: string
  admissionMethod: AdmissionMethod
  foundStreet: string
  foundMunicipalityId: string
  contractorMunicipalityId: string
}

export const emptyAnimalOriginForm: AnimalOriginForm = {
  admissionDate: '',
  admissionMethod: 0,
  foundStreet: '',
  foundMunicipalityId: '',
  contractorMunicipalityId: '',
}

export type AnimalById = Omit<Animal, 'mainPhoto'> & {
  photos: Array<Photo>
  events: Array<AnimalEvent>
  healthRecords: Array<AnimalHealthRecord>
  mainPhotoId: string | null
  origin?: AnimalOrigin | null
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
  keyWordSearch: string | null
  pageSize: number
  species?: Species | null
  isInShelter?: boolean | null
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
  11: 'Nowy numer kojca',
  12: 'Odbiór przez właściciela',
  13: 'Ważenie',
  14: 'Eutanazja',
  15: 'Zgon',
  16: 'Wypuszczony do środowiska',
  17: 'Kondycja',
} as const

export type AnimalEventType = keyof typeof ANIMAL_EVENT_TYPE_MAP

export type AnimalEvent = {
  id: string
  type: AnimalEventType
  occurredOn: string
  description: string
  performedBy?: string
}

export type HealthDocument = {
  id: string
  fileName: string
  contentType: string
  uploadedOn: string
  url?: string
}

export type AnimalHealthRecord = {
  id: string
  occurredOn: string
  description: string
  performedBy?: string
  document?: HealthDocument | null
}

export type AddAnimal = {
  birthDate: string | null
  color: string
  breed: string
  distinguishingMarks: string
  mainPhotoIndex: number
  name: string | null
  photos: Array<File>
  sex: Sexes
  signature: string
  species: Species
  transponderCode: string | null
  origin: AnimalOriginForm | null
}

export type EditAnimal = {
  birthDate: string | null
  color: string
  breed: string
  distinguishingMarks: string
  existingPhotoIds: Array<string>
  id: string
  mainPhotoId: string | null
  mainPhotoIndex: number | null
  name: string | null
  newPhotos: Array<File>
  sex: Sexes
  signature: string
  species: Species
  transponderCode: string | null
  origin: AnimalOriginForm | null
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

export type AnimalSignature = {
  signature: string
}

export const EVENT_TYPE_OPTIONS = Object.entries(ANIMAL_EVENT_TYPE_MAP).map(
  ([value, label]) => ({
    value: Number(value) as AnimalEventType,
    label,
  }),
)

export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/webp',
]

export const ALLOWED_DOCUMENT_EXTENSIONS =
  '.pdf,.doc,.docx,.jpg,.jpeg,.png,.webp'

export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024

export function validateDocument(file: File): string | undefined {
  if (!ALLOWED_DOCUMENT_TYPES.includes(file.type))
    return 'Niedozwolony typ pliku. Dozwolone: PDF, DOC, DOCX, JPEG, PNG, WEBP'
  if (file.size > MAX_DOCUMENT_SIZE)
    return 'Plik jest za duży. Maksymalny rozmiar to 10MB'
  return undefined
}
