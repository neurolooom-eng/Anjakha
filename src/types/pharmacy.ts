import type { AuditFields, ID } from './common'

export interface Drug extends AuditFields {
  id: ID
  name: string
  genericName: string
  hsnCode: string
  category: string
  unit: string
  gstRate: number
  reorderLevel: number
  mrp: number
  status: 'Active' | 'Inactive'
}

export interface StockBatch extends AuditFields {
  id: ID
  drugId: ID
  drugName: string
  batchNo: string
  expiryDate: string
  quantity: number
  purchaseRate: number
  mrp: number
  supplierName: string
}

export type PurchaseStatus = 'Draft' | 'Ordered' | 'Received' | 'Cancelled'

export interface PharmacyPurchaseItem {
  drugId: ID
  drugName: string
  batchNo: string
  expiryDate: string
  quantity: number
  rate: number
  gstRate: number
}

export interface PharmacyPurchase extends AuditFields {
  id: ID
  grnNumber: string
  supplierName: string
  supplierGstin?: string
  date: string
  items: PharmacyPurchaseItem[]
  totalAmount: number
  status: PurchaseStatus
}

export type DispenseStatus = 'Pending' | 'Dispensed' | 'Cancelled'

export interface PharmacySaleItem {
  drugId: ID
  drugName: string
  batchNo: string
  quantity: number
  rate: number
  gstRate: number
}

export interface PharmacySale extends AuditFields {
  id: ID
  invoiceNumber: string
  prescriptionId?: ID
  patientId?: ID
  patientName: string
  date: string
  items: PharmacySaleItem[]
  totalAmount: number
  status: DispenseStatus
}
