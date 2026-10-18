export type ShelterFeature = {
  key: string
  name: string
  description: string
  isEnabled: boolean
}

export type SetShelterFeatureState = {
  key: string
  isEnabled: boolean
}
