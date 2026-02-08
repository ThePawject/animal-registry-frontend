import axios from 'axios'
import { apiClient } from '../useAxiosWithAuth'
import type { AnimalResponse, FetchAnimalsParams } from './types'

export const animalsService = {
  async getAnimals(params: FetchAnimalsParams): Promise<AnimalResponse> {
    try {
      const response = await apiClient.get('animals', {
        params: {
          page: params.page,
          pageSize: params.pageSize,
        },
      })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to fetch animals: ${error.message}`)
      }
      throw error
    }
  },
}
