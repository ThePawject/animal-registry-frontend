import { MUNICIPALITY_NAME_MAX_LENGTH } from './types'
import type { Municipality } from './types'

const normalizeName = (name: string) => name.trim().toLocaleLowerCase('pl')

export function validateMunicipalityName(
  name: string,
  municipalities: Array<Municipality>,
  editedId?: string,
): string | undefined {
  const trimmed = name.trim()
  if (!trimmed) return 'Nazwa gminy jest wymagana'
  if (trimmed.length > MUNICIPALITY_NAME_MAX_LENGTH)
    return `Nazwa gminy może mieć maksymalnie ${MUNICIPALITY_NAME_MAX_LENGTH} znaków`

  const duplicate = municipalities.find(
    (municipality) =>
      municipality.id !== editedId &&
      normalizeName(municipality.name) === normalizeName(trimmed),
  )
  if (!duplicate) return undefined
  return duplicate.isArchived
    ? `Gmina „${trimmed}” jest już na liście zarchiwizowanych. Przywróć ją zamiast tworzyć nową.`
    : `Gmina „${trimmed}” jest już na liście`
}
