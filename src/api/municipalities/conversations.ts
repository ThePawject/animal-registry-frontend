import axios from 'axios'
import { apiClient } from '../useAxiosWithAuth'
import type {
  EditMunicipality,
  FetchMunicipalitiesParams,
  Municipality,
  SetMunicipalityArchived,
} from './types'

export const municipalitiesService = {
  async getMunicipalities(
    params: FetchMunicipalitiesParams,
  ): Promise<Array<Municipality>> {
    try {
      const response = await apiClient.get<Array<Municipality>>(
        'municipalities',
        { params },
      )
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to fetch municipalities: ${error.message}`)
      }
      throw error
    }
  },
  async addMunicipality(name: string): Promise<Municipality> {
    try {
      const response = await apiClient.post<Municipality>('municipalities', {
        name,
      })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to add municipality: ${error.message}`)
      }
      throw error
    }
  },
  async editMunicipality({
    id,
    name,
  }: EditMunicipality): Promise<Municipality> {
    try {
      const response = await apiClient.put<Municipality>(
        `municipalities/${id}`,
        { name },
      )
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to edit municipality: ${error.message}`)
      }
      throw error
    }
  },
  async setMunicipalityArchived({
    id,
    isArchived,
  }: SetMunicipalityArchived): Promise<Municipality> {
    try {
      const response = isArchived
        ? await apiClient.delete<Municipality>(`municipalities/${id}`)
        : await apiClient.post<Municipality>(`municipalities/${id}/restore`)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to update municipality: ${error.message}`)
      }
      throw error
    }
  },
}
