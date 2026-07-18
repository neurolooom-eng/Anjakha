import type { AuditFields, ID } from './common'

/** Dosage form — how the medicine is presented. Drives how a doctor prescribes it:
 * count forms (Tablet/Capsule/Sachet) take a 1-0-1 morning-afternoon-night pattern,
 * liquid forms (Syrup/Suspension/Drops) additionally take a dose amount + unit (e.g. 5 ml). */
export type DrugForm =
  | 'Tablet' | 'Capsule' | 'Syrup' | 'Suspension' | 'Injection'
  | 'Drops' | 'Ointment' | 'Cream' | 'Inhaler' | 'Sachet' | 'Other'

export interface Drug extends AuditFields {
  id: ID
  name: string
  genericName: string
  /** Dosage form (Tablet, Syrup, …). */
  form: DrugForm
  /** Strength per unit, e.g. "20 mg" or "125 mg/5 ml". */
  strength: string
  /** Measure unit for liquid/measured forms, e.g. "ml". Undefined for count forms. */
  doseUnit?: string
  hsnCode: string
  category: string
  /** Stock / dispensing pack unit, e.g. Strip, Bottle, Vial, Box. */
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
