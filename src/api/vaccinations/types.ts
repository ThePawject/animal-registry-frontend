import type { Species } from '../animals/types'

export const VACCINATION_STATUS_MAP = {
  1: 'Active',
  2: 'Expired',
  3: 'Replaced',
} as const

export type VaccinationStatus = keyof typeof VACCINATION_STATUS_MAP

export type VaccinationAttachment = {
  fileName: string
  contentType: string
  uploadedOn: string
  url: string
}

export type AnimalVaccination = {
  id: string
  animalId: string
  vaccineName: string
  administeredOn: string
  validUntil: string | null
  veterinarian: string | null
  batchNumber: string | null
  notes: string | null
  status: VaccinationStatus
  daysUntilExpiry: number | null
  replacesVaccinationId: string | null
  replacedByVaccinationId: string | null
  attachment: VaccinationAttachment | null
  createdBy: string
  createdOn: string
  modifiedOn: string
}

export type VaccinationWithAnimal = {
  vaccination: AnimalVaccination
  animalName: string | null
  animalSignature: string
  species: Species
  isInShelter: boolean
}

export type VaccinationFormData = {
  vaccineName: string
  administeredOn: string
  validUntil: string
  veterinarian: string
  batchNumber: string
  notes: string
  replacesVaccinationId: string
}

export type SaveVaccination = {
  animalId: string
  vaccinationId?: string
  data: VaccinationFormData
  file?: File
  deleteAttachment?: boolean
}

export type ExpiringVaccinationsParams = {
  expiresInDays: number
  includeExpired: boolean
  inShelterOnly: boolean
}

export const VACCINE_NAME_MAX_LENGTH = 200
export const VETERINARIAN_MAX_LENGTH = 200
export const BATCH_NUMBER_MAX_LENGTH = 100
export const VACCINATION_NOTES_MAX_LENGTH = 1000
