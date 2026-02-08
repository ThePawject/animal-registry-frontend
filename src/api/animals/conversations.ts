import axios from 'axios'
import type { AnimalResponse, FetchAnimalsParams } from './types'

const ANIMALS_ENDPOINT_PATH = 'animals'

export const animalsService = {
  async getAnimals(params: FetchAnimalsParams): Promise<AnimalResponse> {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}${ANIMALS_ENDPOINT_PATH}`,
        params,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        },
      )
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to fetch animals: ${error.message}`)
      }
      throw error
    }
  },
}
