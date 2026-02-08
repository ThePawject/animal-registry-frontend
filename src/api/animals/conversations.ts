import axios from 'axios'
import { apiClient } from '../useAxiosWithAuth'
import type { AnimalById, AnimalResponse, FetchAnimalsParams } from './types'

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
  async getAnimalById(id: string): Promise<AnimalById> {
    try {
      const response = await apiClient.get(`animals/${id}`)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Failed to fetch animal with ID ${id}: ${error.message}`,
        )
      }
      throw error
    }
  },
}
