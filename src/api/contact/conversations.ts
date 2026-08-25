import axios from 'axios'
import { apiClient } from '../useAxiosWithAuth'
import type { ContactInquiryPayload } from './types'

export const contactService = {
  async sendInquiry(data: ContactInquiryPayload): Promise<void> {
    try {
      await apiClient.post('contact', data)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to send contact inquiry: ${error.message}`)
      }
      throw error
    }
  },
}
