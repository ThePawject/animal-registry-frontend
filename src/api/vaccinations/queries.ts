import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { vaccinationsService } from './conversations'
import type { ExpiringVaccinationsParams } from './types'

export const vaccinationsKeys = {
  all: ['vaccinations'] as const,
  byAnimal: (animalId: string) =>
    [...vaccinationsKeys.all, 'animal', animalId] as const,
  expiring: (params: ExpiringVaccinationsParams) =>
    [...vaccinationsKeys.all, 'expiring', params] as const,
}

export const useAnimalVaccinations = (animalId: string, enabled?: boolean) =>
  useQuery({
    queryKey: vaccinationsKeys.byAnimal(animalId),
    queryFn: () => vaccinationsService.getAnimalVaccinations(animalId),
    refetchOnWindowFocus: false,
    enabled,
  })

export const useExpiringVaccinations = (
  params: ExpiringVaccinationsParams,
  enabled?: boolean,
) =>
  useQuery({
    queryKey: vaccinationsKeys.expiring(params),
    queryFn: () => vaccinationsService.getExpiringVaccinations(params),
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
    enabled,
  })

export const useSaveVaccination = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: vaccinationsService.saveVaccination,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vaccinationsKeys.all })
    },
  })
}

export const useDeleteVaccination = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      animalId,
      vaccinationId,
    }: {
      animalId: string
      vaccinationId: string
    }) => vaccinationsService.deleteVaccination(animalId, vaccinationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vaccinationsKeys.all })
    },
  })
}
