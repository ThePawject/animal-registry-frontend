import type { ANIMAL_EVENT_TYPE_MAP } from '../animals/types'

export type ReportDateRangeParams = {
  endDate: string
  startDate: string
  species: Array<number>
  eventTypes: Array<keyof typeof ANIMAL_EVENT_TYPE_MAP> | null
}

export type ReportSelectedParams = {
  ids: Array<string>
}

export type EventReportPeriod = 'Week' | 'Month' | 'Quarter' | 'Custom'

export type EventReportParams = {
  periods: Array<EventReportPeriod>
  customStartDate?: string
  customEndDate?: string
}

export type OriginMonthlyReportParams = {
  year: number
  month: number
}

export type OriginYearlyReportParams = {
  year: number
}

export type VaccinationsReportParams = {
  from: string
  to: string
}

export type ExpiringVaccinationsReportParams = {
  expiresInDays: number
  includeExpired: boolean
  inShelterOnly: boolean
}
