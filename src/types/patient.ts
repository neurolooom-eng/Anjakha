import type { AuditFields, Gender, ID } from './common'

export type PatientCategory = 'General' | 'Insurance' | 'Corporate' | 'Government Scheme'

export interface Patient extends AuditFields {
  id: ID
  uhid: string
  name: string
  gender: Gender
  dob: string
  phone: string
  email?: string
  address: string
  bloodGroup?: string
  category: PatientCategory
  allergies?: string
  emergencyContact?: string
  status: 'Active' | 'Inactive'
}

export type AppointmentStatus =
  | 'Scheduled'
  | 'Checked In'
  | 'Vitals Recorded'
  | 'In Consultation'
  | 'Completed'
  | 'Cancelled'
  | 'No Show'

export interface Appointment extends AuditFields {
  id: ID
  patientId: ID
  patientName: string
  doctorName: string
  department: string
  date: string
  time: string
  type: 'New' | 'Follow-up'
  status: AppointmentStatus
  tokenNo?: number
  notes?: string
}
