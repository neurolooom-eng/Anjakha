import type { AuditFields, ID } from './common'

export interface Insurer extends AuditFields {
  id: ID
  name: string
  type: 'Insurer' | 'TPA'
  contactPerson?: string
  phone?: string
  email?: string
  status: 'Active' | 'Inactive'
}

export interface Policy extends AuditFields {
  id: ID
  patientId: ID
  patientName: string
  insurerId: ID
  insurerName: string
  policyNumber: string
  sumInsured: number
  validTill: string
  status: 'Active' | 'Expired'
}

export type ClaimStatus =
  | 'Pre-auth Requested'
  | 'Pre-auth Approved'
  | 'Pre-auth Rejected'
  | 'Claim Submitted'
  | 'Settled'
  | 'Repudiated'

export interface Claim extends AuditFields {
  id: ID
  claimNumber: string
  patientId: ID
  patientName: string
  policyId: ID
  policyNumber: string
  insurerName: string
  invoiceId?: ID
  admissionId?: ID
  claimAmount: number
  approvedAmount?: number
  settledAmount?: number
  date: string
  status: ClaimStatus
  remarks?: string
}
