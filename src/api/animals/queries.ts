import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { animalsService } from './conversations'
import type { AddAnimal, FetchAnimalsParams } from './types'

export const animalsKeys = {
  one: (id: string) => ['animals', id] as const,
  all: ['animals'] as const,
  list: (params: FetchAnimalsParams) =>
    [...animalsKeys.all, 'list', params] as const,
}

export const useAnimals = (params: FetchAnimalsParams) =>
  useQuery({
    queryKey: animalsKeys.list(params),
    queryFn: async () => animalsService.getAnimals(params),
    placeholderData: keepPreviousData,
  })

export const useAnimalById = (id: string) =>
  useQuery({
    queryKey: animalsKeys.one(id),
    queryFn: async () => animalsService.getAnimalById(id),
  })

export const useAddAnimal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: AddAnimal) => animalsService.addAnimal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: animalsKeys.all })
    },
  })
}
