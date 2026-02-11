import axios from 'axios'
import { apiClient } from '../useAxiosWithAuth'

interface ReportsResponse {
  blob: Blob
  filename: string
}

function extractFilename(headers: any): string {
  const contentDisposition = headers['content-disposition'] || ''
  const parts = contentDisposition.split('filename=')

  if (parts.length < 2) {
    return 'raport.pdf'
  }

  let filename = parts[1].split(';')[0].trim()

  if (
    (filename.startsWith('"') && filename.endsWith('"')) ||
    (filename.startsWith("'") && filename.endsWith("'"))
  ) {
    filename = filename.slice(1, -1)
  }

  return filename || 'raport.pdf'
}

export const reportsService = {
  async getReports(): Promise<ReportsResponse> {
    try {
      const response = await apiClient.get('reports/events', {
        responseType: 'blob',
      })

      const filename = extractFilename(response.headers)

      return {
        blob: response.data,
        filename: filename,
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to fetch reports: ${error.message}`)
      }
      throw error
    }
  },
  async getReportsByDateRange(
    params: ReportDateRangeParams,
  ): Promise<ReportsResponse> {
    try {
      const response = await apiClient.get('reports/animals/date-range', {
        params,
        responseType: 'blob',
      })

      const filename = extractFilename(response.headers)

      return {
        blob: response.data,
        filename: filename,
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to fetch reports: ${error.message}`)
      }
      throw error
    }
  },
  async getReportsBySelectedIds(
    params: ReportSelectedParams,
  ): Promise<ReportsResponse> {
    try {
      const response = await apiClient.get('reports/animals/selected', {
        params,
        responseType: 'blob',
      })

      const filename = extractFilename(response.headers)

      return {
        blob: response.data,
        filename: filename,
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to fetch reports: ${error.message}`)
      }
      throw error
    }
  },
  async getReportsDump(): Promise<ReportsResponse> {
    try {
      const response = await apiClient.get('reports/animals/dump', {
        responseType: 'blob',
      })

      const filename = extractFilename(response.headers)

      return {
        blob: response.data,
        filename: filename,
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to fetch reports dump: ${error.message}`)
      }
      throw error
    }
  },
}
