import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { animalsService } from './conversations'
import type { FetchAnimalsParams } from './types'

export const animalsKeys = {
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
