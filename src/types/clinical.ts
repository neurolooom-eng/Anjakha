import type { AuditFields, ID } from './common'

export interface Vitals {
  tempF?: number
  pulse?: number
  bp?: string
  spo2?: number
  weightKg?: number
  heightCm?: number
}

export type ConsultationStatus = 'Draft' | 'Finalized'

export interface Consultation extends AuditFields {
  id: ID
  patientId: ID
  patientName: string
  doctorName: string
  date: string
  department: string
  vitals: Vitals
  complaints: string
  diagnosis: string
  advice?: string
  followUpDate?: string
  status: ConsultationStatus
}

export type PrescriptionStatus = 'Pending' | 'Partially Dispensed' | 'Dispensed' | 'Cancelled'

export interface PrescriptionItem {
  drugId: ID
  drugName: string
  dosage: string
  frequency: string
  durationDays: number
  quantity: number
}

export interface Prescription extends AuditFields {
  id: ID
  consultationId: ID
  patientId: ID
  patientName: string
  doctorName: string
  date: string
  items: PrescriptionItem[]
  status: PrescriptionStatus
}
