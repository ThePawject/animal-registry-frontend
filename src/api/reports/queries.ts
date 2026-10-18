import { useMutation } from '@tanstack/react-query'
import { reportsService } from './conversations'
import type {
  EventReportParams,
  ExpiringVaccinationsReportParams,
  OriginMonthlyReportParams,
  OriginYearlyReportParams,
  ReportDateRangeParams,
  ReportSelectedParams,
  VaccinationsReportParams,
} from './types'

interface ReportsData {
  blob: Blob
  filename: string
}

export const useReports = (onSuccess: (data: ReportsData) => void) => {
  return useMutation({
    mutationFn: async (params?: EventReportParams) =>
      reportsService.getReports(params),
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

export const useOriginMonthlyReport = (
  onSuccess: (data: ReportsData) => void,
) => {
  return useMutation({
    mutationFn: async (params: OriginMonthlyReportParams) =>
      reportsService.getOriginMonthlyReport(params),
    onSuccess: (data) => {
      onSuccess(data)
    },
  })
}

export const useOriginYearlyReport = (
  onSuccess: (data: ReportsData) => void,
) => {
  return useMutation({
    mutationFn: async (params: OriginYearlyReportParams) =>
      reportsService.getOriginYearlyReport(params),
    onSuccess: (data) => {
      onSuccess(data)
    },
  })
}

export const useVaccinationsReport = (
  onSuccess: (data: ReportsData) => void,
) => {
  return useMutation({
    mutationFn: async (params: VaccinationsReportParams) =>
      reportsService.getVaccinationsReport(params),
    onSuccess: (data) => {
      onSuccess(data)
    },
  })
}

export const useExpiringVaccinationsReport = (
  onSuccess: (data: ReportsData) => void,
) => {
  return useMutation({
    mutationFn: async (params: ExpiringVaccinationsReportParams) =>
      reportsService.getExpiringVaccinationsReport(params),
    onSuccess: (data) => {
      onSuccess(data)
    },
  })
}
