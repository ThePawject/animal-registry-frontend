import axios from 'axios'
import { apiClient } from '../useAxiosWithAuth'
import type {
  AnimalVaccination,
  ExpiringVaccinationsParams,
  SaveVaccination,
  VaccinationFormData,
  VaccinationsPage,
} from './types'

const toPayload = (data: VaccinationFormData) => ({
  vaccineName: data.vaccineName.trim(),
  administeredOn: new Date(data.administeredOn).toISOString(),
  validUntil: data.validUntil ? new Date(data.validUntil).toISOString() : null,
  veterinarian: data.veterinarian.trim() || null,
  batchNumber: data.batchNumber.trim() || null,
  notes: data.notes.trim() || null,
  replacesVaccinationId: data.replacesVaccinationId || null,
})

export const vaccinationsService = {
  async getAnimalVaccinations(
    animalId: string,
  ): Promise<Array<AnimalVaccination>> {
    try {
      const response = await apiClient.get<Array<AnimalVaccination>>(
        `animals/${animalId}/vaccinations`,
      )
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to fetch vaccinations: ${error.message}`)
      }
      throw error
    }
  },
  async getExpiringVaccinations(
    params: ExpiringVaccinationsParams,
  ): Promise<VaccinationsPage> {
    try {
      const response = await apiClient.get<VaccinationsPage>('vaccinations', {
        params,
      })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Failed to fetch expiring vaccinations: ${error.message}`,
        )
      }
      throw error
    }
  },
  async saveVaccination({
    animalId,
    vaccinationId,
    data,
    file,
    deleteAttachment,
  }: SaveVaccination): Promise<AnimalVaccination> {
    try {
      const payload = toPayload(data)
      const response = vaccinationId
        ? await apiClient.put<AnimalVaccination>(
            `animals/${animalId}/vaccinations/${vaccinationId}`,
            payload,
          )
        : await apiClient.post<AnimalVaccination>(
            `animals/${animalId}/vaccinations`,
            payload,
          )
      const saved = response.data

      if (file) {
        const formData = new FormData()
        formData.append('File', file)
        const uploadResponse = await apiClient.put<AnimalVaccination>(
          `animals/${animalId}/vaccinations/${saved.id}/attachment`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } },
        )
        return uploadResponse.data
      }

      if (deleteAttachment && vaccinationId) {
        await apiClient.delete(
          `animals/${animalId}/vaccinations/${vaccinationId}/attachment`,
        )
      }

      return saved
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to save vaccination: ${error.message}`)
      }
      throw error
    }
  },
  async deleteVaccination(animalId: string, vaccinationId: string) {
    try {
      await apiClient.delete(
        `animals/${animalId}/vaccinations/${vaccinationId}`,
      )
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to delete vaccination: ${error.message}`)
      }
      throw error
    }
  },
}
