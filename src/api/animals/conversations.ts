import axios from 'axios'
import { apiClient } from '../useAxiosWithAuth'
import type {
  AddAnimal,
  AnimalById,
  AnimalResponse,
  FetchAnimalsParams,
} from './types'

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
  async addAnimal(data: AddAnimal) {
    try {
      const formData = new FormData()
      formData.append('birthDate', data.birthDate)
      formData.append('color', data.color)
      formData.append('mainPhotoIndex', String(data.mainPhotoIndex))
      formData.append('name', data.name)
      // Append each photo individually
      data.photos.forEach((photo, index) => {
        formData.append(`photos[${index}]`, photo, photo.name)
      })
      formData.append('sex', String(data.sex))
      formData.append('signature', data.signature)
      formData.append('species', String(data.species))
      formData.append('transponderCode', data.transponderCode)

      const response = await apiClient.post('animals', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to add animal: ${error.message}`)
      }
      throw error
    }
  },
}
