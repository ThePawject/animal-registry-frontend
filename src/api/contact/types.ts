export type ContactInquiry = {
  shelterName: string
  contactPerson: string
  email: string
  phone: string
  message: string
  consent: boolean
}

export type ContactInquiryPayload = ContactInquiry & {
  _honey: string
}
