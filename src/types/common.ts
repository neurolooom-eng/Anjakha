export type ID = string

export interface AuditFields {
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
}

export type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'primary'

export type Gender = 'Male' | 'Female' | 'Other'

export type PaymentMode = 'Cash' | 'Card' | 'UPI' | 'Net Banking' | 'Cheque' | 'Insurance'

export interface Address {
  line1: string
  city: string
  state: string
  pincode: string
}
