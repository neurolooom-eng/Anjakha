import type { AuditFields, ID } from './common'

/**
 * The standard adult vital-signs panel used everywhere in the app (Nurse's
 * Station, Consultations, the Patient Record view): temperature, pulse,
 * respiratory rate, blood pressure (stored as separate systolic/diastolic
 * readings, not a free-text string, so it can be validated and flagged),
 * and SpO2 — plus height/weight, from which BMI is derived rather than
 * stored, so it never drifts from the recorded measurements.
 */
export interface Vitals {
  tempF?: number
  pulse?: number
  respiratoryRate?: number
  bpSystolic?: number
  bpDiastolic?: number
  spo2?: number
  heightCm?: number
  weightKg?: number
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
