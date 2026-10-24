export const MUNICIPALITY_NAME_MAX_LENGTH = 200

export type Municipality = {
  id: string
  name: string
  isArchived: boolean
  createdOn: string
}

export type FetchMunicipalitiesParams = {
  includeArchived: boolean
}

export type EditMunicipality = {
  id: string
  name: string
}

export type SetMunicipalityArchived = {
  id: string
  isArchived: boolean
}
