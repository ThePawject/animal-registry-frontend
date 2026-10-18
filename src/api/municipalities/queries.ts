import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { municipalitiesService } from './conversations'
import type { FetchMunicipalitiesParams } from './types'

export const municipalitiesKeys = {
  all: ['municipalities'] as const,
  list: (params: FetchMunicipalitiesParams) =>
    [...municipalitiesKeys.all, 'list', params] as const,
}

export const useMunicipalities = (
  params: FetchMunicipalitiesParams,
  enabled?: boolean,
) =>
  useQuery({
    queryKey: municipalitiesKeys.list(params),
    queryFn: () => municipalitiesService.getMunicipalities(params),
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
    enabled,
  })

export const useAddMunicipality = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (name: string) =>
      municipalitiesService.addMunicipality(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: municipalitiesKeys.all })
    },
  })
}

export const useEditMunicipality = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: municipalitiesService.editMunicipality,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: municipalitiesKeys.all })
    },
  })
}

export const useSetMunicipalityArchived = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: municipalitiesService.setMunicipalityArchived,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: municipalitiesKeys.all })
    },
  })
}
