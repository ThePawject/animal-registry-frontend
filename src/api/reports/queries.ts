import { useMutation } from '@tanstack/react-query'
import { reportsService } from './conversations'

interface ReportsData {
  blob: Blob
  filename: string
}

export const useReports = (onSuccess: (data: ReportsData) => void) => {
  return useMutation({
    mutationFn: async () => reportsService.getReports(),
    onSuccess: (data) => {
      onSuccess(data)
    },
  })
}
