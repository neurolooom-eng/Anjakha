import type { AuditFields, ID } from './common'

export interface Ward extends AuditFields {
  id: ID
  name: string
  type: 'General' | 'Semi-Private' | 'Private' | 'ICU' | 'NICU' | 'Emergency'
  floor: string
}

export type BedStatus = 'Available' | 'Occupied' | 'Reserved' | 'Cleaning' | 'Maintenance'

export interface Bed extends AuditFields {
  id: ID
  wardId: ID
  wardName: string
  bedNumber: string
  status: BedStatus
  dailyRate: number
}

export type AdmissionStatus = 'Admitted' | 'Discharged' | 'Transferred' | 'Deceased'

export interface Admission extends AuditFields {
  id: ID
  patientId: ID
  patientName: string
  bedId: ID
  bedLabel: string
  admittingDoctor: string
  admissionDate: string
  dischargeDate?: string
  diagnosis: string
  status: AdmissionStatus
  notes?: string
}
