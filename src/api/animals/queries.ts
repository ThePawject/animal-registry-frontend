import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { animalsService } from './conversations'
import type {
  AddAnimal,
  AnimalEvent,
  AnimalHealthRecord,
  EditAnimal,
  FetchAnimalsParams,
} from './types'

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
    queryFn: () => animalsService.getAnimalById(id),
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

type EditAnimalVariables = {
  animalId: string
  data: EditAnimal
}
export const useEditAnimal = (onSuccess: () => void) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ animalId, data }: EditAnimalVariables) =>
      animalsService.editAnimal(animalId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: animalsKeys.one(String(variables.animalId)),
      })
      queryClient.invalidateQueries({ queryKey: animalsKeys.all })
      onSuccess()
    },
  })
}

type AddAnimalEventVariables = {
  animalId: string
  data: AnimalEvent
}
export const useAddAnimalEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ animalId, data }: AddAnimalEventVariables) =>
      animalsService.addAnimalEvent(animalId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: animalsKeys.one(String(variables.animalId)),
      })
      queryClient.invalidateQueries({ queryKey: animalsKeys.all })
    },
  })
}

type EditAnimalEventVariables = {
  animalId: string
  eventId: string
  data: AnimalEvent
}

export const useEditAnimalEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ animalId, eventId, data }: EditAnimalEventVariables) =>
      animalsService.editAnimalEvent(animalId, eventId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: animalsKeys.one(String(variables.animalId)),
      })
      queryClient.invalidateQueries({ queryKey: animalsKeys.all })
    },
  })
}

type DeleteAnimalEventVariables = {
  animalId: string
  eventId: string
}

export const useDeleteAnimalEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ animalId, eventId }: DeleteAnimalEventVariables) =>
      animalsService.deleteAnimalEvent(animalId, eventId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: animalsKeys.one(String(variables.animalId)),
      })
      queryClient.invalidateQueries({ queryKey: animalsKeys.all })
    },
  })
}

type AddAnimalHealthRecordVariables = {
  animalId: string
  data: AnimalHealthRecord
}

export const useAddAnimalHealthRecord = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ animalId, data }: AddAnimalHealthRecordVariables) =>
      animalsService.addAnimalHealthRecord(animalId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: animalsKeys.one(String(variables.animalId)),
      })
      queryClient.invalidateQueries({ queryKey: animalsKeys.all })
    },
  })
}

type EditAnimalHealthRecordVariables = {
  animalId: string
  recordId: string
  data: AnimalHealthRecord
}

export const useEditAnimalHealthRecord = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      animalId,
      recordId,
      data,
    }: EditAnimalHealthRecordVariables) =>
      animalsService.editAnimalHealthRecord(animalId, recordId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: animalsKeys.one(String(variables.animalId)),
      })
      queryClient.invalidateQueries({ queryKey: animalsKeys.all })
    },
  })
}

type DeleteAnimalHealthRecordVariables = {
  animalId: string
  recordId: string
}

export const useDeleteAnimalHealthRecord = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      animalId,
      recordId,
    }: DeleteAnimalHealthRecordVariables) =>
      animalsService.deleteAnimalHealthRecord(animalId, recordId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: animalsKeys.one(String(variables.animalId)),
      })
      queryClient.invalidateQueries({ queryKey: animalsKeys.all })
    },
  })
}

export const useAnimalSignature = () => {
  return useMutation({
    mutationFn: async () => animalsService.getAnimalSignature(),
  })
}
