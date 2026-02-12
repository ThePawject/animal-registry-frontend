export type ReportDateRangeParams = {
  endDate: string
  startDate: string
  species: [1] | [2] | [1, 2]
}

export type ReportSelectedParams = {
  ids: Array<string>
}
