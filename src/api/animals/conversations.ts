import axios from 'axios'
import { apiClient } from '../useAxiosWithAuth'
import type {
  AddAnimal,
  AnimalById,
  AnimalEvent,
  AnimalHealthRecord,
  AnimalResponse,
  EditAnimal,
  FetchAnimalsParams,
} from './types'

export const animalsService = {
  async getAnimals(params: FetchAnimalsParams): Promise<AnimalResponse> {
    try {
      const response = await apiClient.get('animals', {
        params,
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
  editAnimal: async (id: string, data: EditAnimal) => {
    try {
      const formData = new FormData()
      formData.append('birthDate', data.birthDate)
      formData.append('color', data.color)
      const jsonExistingPhotoIds = JSON.stringify(data.existingPhotoIds)
      formData.append('existingPhotoIds', jsonExistingPhotoIds)
      formData.append('id)', id)
      if (data.mainPhotoId && data.mainPhotoIndex) {
        throw new Error('Cannot provide both mainPhotoId and mainPhotoIndex')
      }
      if (data.mainPhotoId)
        formData.append('mainPhotoId', String(data.mainPhotoId))
      if (data.mainPhotoIndex !== null)
        formData.append('mainPhotoIndex', String(data.mainPhotoIndex))
      formData.append('name', data.name)
      data.newPhotos.forEach((photo, index) => {
        formData.append(`newPhotos[${index}]`, photo, photo.name)
      })
      formData.append('sex', String(data.sex))
      formData.append('signature', data.signature)
      formData.append('species', String(data.species))
      formData.append('transponderCode', data.transponderCode)

      const response = await apiClient.put(`animals/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to edit animal: ${error.message}`)
      }
      throw error
    }
  },
  addAnimalEvent: async (id: string, data: AnimalEvent) => {
    try {
      const response = await apiClient.post(`animals/${id}/events`, data)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to add animal event: ${error.message}`)
      }
      throw error
    }
  },
  editAnimalEvent: async (id: string, eventId: string, data: AnimalEvent) => {
    try {
      const response = await apiClient.put(
        `animals/${id}/events/${eventId}`,
        data,
      )
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to edit animal event: ${error.message}`)
      }
      throw error
    }
  },
  deleteAnimalEvent: async (id: string, eventId: string) => {
    try {
      const response = await apiClient.delete(`animals/${id}/events/${eventId}`)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to delete animal event: ${error.message}`)
      }
      throw error
    }
  },
  addAnimalHealthRecord: async (id: string, data: AnimalHealthRecord) => {
    try {
      const response = await apiClient.post(`animals/${id}/health`, data)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to add animal health record: ${error.message}`)
      }
      throw error
    }
  },
  editAnimalHealthRecord: async (
    id: string,
    recordId: string,
    data: AnimalHealthRecord,
  ) => {
    try {
      const response = await apiClient.put(
        `animals/${id}/health/${recordId}`,
        data,
      )
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to edit animal health record: ${error.message}`)
      }
      throw error
    }
  },
  deleteAnimalHealthRecord: async (id: string, recordId: string) => {
    try {
      const response = await apiClient.delete(
        `animals/${id}/health/${recordId}`,
      )
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Failed to delete animal health record: ${error.message}`,
        )
      }
      throw error
    }
  },
}
