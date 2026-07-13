import type { AuditFields, ID } from './common'

export interface TaxRate extends AuditFields {
  id: ID
  hsnSacCode: string
  description: string
  gstRate: number
  category: 'Goods' | 'Service'
}

export type GstReturnType = 'GSTR-1' | 'GSTR-3B'
export type GstReturnStatus = 'Draft' | 'Generated' | 'Filed'

export interface GstReturnSummary extends AuditFields {
  id: ID
  returnType: GstReturnType
  period: string
  taxableValue: number
  cgst: number
  sgst: number
  igst: number
  totalTax: number
  invoiceCount: number
  status: GstReturnStatus
  generatedAt?: string
}
