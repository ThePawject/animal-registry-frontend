import { useMutation } from '@tanstack/react-query'
import { contactService } from './conversations'
import type { ContactInquiryPayload } from './types'

export const useSendContactInquiry = () =>
  useMutation({
    mutationFn: async (data: ContactInquiryPayload) =>
      contactService.sendInquiry(data),
  })
