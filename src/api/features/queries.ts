import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { featuresService } from './conversations'
import type { SetShelterFeatureState } from './types'

export const featuresKeys = {
  all: ['shelter-features'] as const,
}

export const useShelterFeatures = () =>
  useQuery({
    queryKey: featuresKeys.all,
    queryFn: () => featuresService.getFeatures(),
    refetchOnWindowFocus: false,
  })

export const useFeature = (key: string) => {
  const { data, isLoading } = useShelterFeatures()
  return {
    isEnabled: data?.find((feature) => feature.key === key)?.isEnabled ?? false,
    isLoading,
  }
}

export const useSetFeatureState = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: SetShelterFeatureState) =>
      featuresService.setFeatureState(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: featuresKeys.all })
    },
  })
}
