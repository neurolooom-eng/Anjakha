import type { AuditFields, ID } from './common'
import type { DrugForm } from './pharmacy'

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

export type DoseTiming = 'Before food' | 'After food' | 'With food' | 'Empty stomach' | 'Bedtime'

export interface PrescriptionItem {
  drugId: ID
  /** Consolidated medicine name snapshot, e.g. "Atorvastatin 20 mg Tablet". */
  drugName: string
  form?: DrugForm
  /** Morning-afternoon-night dosing (the "1-0-1" pattern) for count forms; for liquid
   * forms these are how many times the dose is taken in each slot. */
  morning?: number
  afternoon?: number
  night?: number
  /** Liquid dose amount + unit, e.g. 5 ml. Only for measured/liquid forms. */
  doseAmount?: number
  doseUnit?: string
  timing?: DoseTiming
  durationDays: number
  quantity: number
  notes?: string
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
