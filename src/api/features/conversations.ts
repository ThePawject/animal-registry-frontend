import axios from 'axios'
import { apiClient } from '../useAxiosWithAuth'
import type { SetShelterFeatureState, ShelterFeature } from './types'

export const featuresService = {
  async getFeatures(): Promise<Array<ShelterFeature>> {
    try {
      const response =
        await apiClient.get<Array<ShelterFeature>>('shelter/features')
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to fetch shelter features: ${error.message}`)
      }
      throw error
    }
  },
  async setFeatureState({
    key,
    isEnabled,
  }: SetShelterFeatureState): Promise<ShelterFeature> {
    try {
      const response = await apiClient.put<ShelterFeature>(
        `shelter/features/${encodeURIComponent(key)}`,
        { isEnabled },
      )
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to update shelter feature: ${error.message}`)
      }
      throw error
    }
  },
}
