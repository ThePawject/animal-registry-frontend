import { useMutation } from '@tanstack/react-query'
import { reportsService } from './conversations'
import type { ReportDateRangeParams, ReportSelectedParams } from './types'

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

export const useReportsByDateRange = (
  onSuccess: (data: ReportsData) => void,
) => {
  return useMutation({
    mutationFn: async (params: ReportDateRangeParams) =>
      reportsService.getReportsByDateRange(params),
    onSuccess: (data) => {
      onSuccess(data)
    },
  })
}

export const useReportsBySelectedIds = (
  onSuccess: (data: ReportsData) => void,
) => {
  return useMutation({
    mutationFn: async (params: ReportSelectedParams) =>
      reportsService.getReportsBySelectedIds(params),
    onSuccess: (data) => {
      onSuccess(data)
    },
  })
}

export const useReportsDump = (onSuccess: (data: ReportsData) => void) => {
  return useMutation({
    mutationFn: async () => reportsService.getReportsDump(),
    onSuccess: (data) => {
      onSuccess(data)
    },
  })
}
