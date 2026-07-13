import type { AuditFields, ID, PaymentMode } from './common'

export type InvoiceStatus = 'Draft' | 'Unpaid' | 'Partially Paid' | 'Paid' | 'Cancelled'

export interface InvoiceLineItem {
  description: string
  hsnSacCode: string
  quantity: number
  rate: number
  gstRate: number
}

export interface Invoice extends AuditFields {
  id: ID
  invoiceNumber: string
  patientId: ID
  patientName: string
  date: string
  category: 'OPD' | 'IPD' | 'Pharmacy'
  items: InvoiceLineItem[]
  subtotal: number
  cgst: number
  sgst: number
  igst: number
  total: number
  amountPaid: number
  insuranceClaimId?: ID
  status: InvoiceStatus
}

export interface Payment extends AuditFields {
  id: ID
  invoiceId: ID
  invoiceNumber: string
  patientName: string
  date: string
  amount: number
  mode: PaymentMode
  referenceNo?: string
}
