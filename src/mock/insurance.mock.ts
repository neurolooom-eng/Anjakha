import type { Claim, Insurer, Policy } from '@/types'
import { seedAudit } from './audit'

export const mockInsurers: Insurer[] = [
  { id: 'ins_1', name: 'Star Health Insurance', type: 'Insurer', contactPerson: 'Rajiv Kumar', phone: '+91 44 2828 1234', email: 'claims@starhealth.example', status: 'Active', ...seedAudit(300) },
  { id: 'ins_2', name: 'ICICI Lombard', type: 'Insurer', contactPerson: 'Anita Rao', phone: '+91 22 6161 5000', email: 'health.claims@icicilombard.example', status: 'Active', ...seedAudit(300) },
  { id: 'ins_3', name: 'MediAssist TPA', type: 'TPA', contactPerson: 'Suresh Babu', phone: '+91 80 4030 4030', email: 'authorization@mediassist.example', status: 'Active', ...seedAudit(300) },
  { id: 'ins_4', name: 'Paramount TPA', type: 'TPA', contactPerson: 'Leena George', phone: '+91 11 4155 1155', email: 'preauth@paramounttpa.example', status: 'Active', ...seedAudit(300) },
]

export const mockPolicies: Policy[] = [
  { id: 'pol_1', patientId: 'pat_1', patientName: 'Ramesh Kulkarni', insurerId: 'ins_1', insurerName: 'Star Health Insurance', policyNumber: 'SH-9981234', sumInsured: 500000, validTill: '2027-03-31', status: 'Active', ...seedAudit(120) },
  { id: 'pol_2', patientId: 'pat_5', patientName: 'Vikram Singh', insurerId: 'ins_2', insurerName: 'ICICI Lombard', policyNumber: 'IL-4472190', sumInsured: 1000000, validTill: '2026-11-30', status: 'Active', ...seedAudit(90) },
  { id: 'pol_3', patientId: 'pat_7', patientName: 'Manoj Pillai', insurerId: 'ins_1', insurerName: 'Star Health Insurance', policyNumber: 'SH-2205671', sumInsured: 300000, validTill: '2026-09-15', status: 'Active', ...seedAudit(60) },
]

export const mockClaims: Claim[] = [
  {
    id: 'clm_1', claimNumber: 'CLM-2026-0771', patientId: 'pat_1', patientName: 'Ramesh Kulkarni',
    policyId: 'pol_1', policyNumber: 'SH-9981234', insurerName: 'Star Health Insurance', invoiceId: 'inv_1',
    claimAmount: 1475, approvedAmount: 1475, settledAmount: 1475, date: '2026-07-13', status: 'Settled', ...seedAudit(0),
  },
  {
    id: 'clm_2', claimNumber: 'CLM-2026-0772', patientId: 'pat_5', patientName: 'Vikram Singh',
    policyId: 'pol_2', policyNumber: 'IL-4472190', insurerName: 'ICICI Lombard', invoiceId: 'inv_2', admissionId: 'adm_3',
    claimAmount: 25000, approvedAmount: 20000, date: '2026-07-12', status: 'Pre-auth Approved',
    remarks: 'Cashless approved for ICU stay up to 3 days; balance to be re-evaluated at discharge.', ...seedAudit(1),
  },
  {
    id: 'clm_3', claimNumber: 'CLM-2026-0773', patientId: 'pat_7', patientName: 'Manoj Pillai',
    policyId: 'pol_3', policyNumber: 'SH-2205671', insurerName: 'Star Health Insurance', admissionId: 'adm_2',
    claimAmount: 48000, date: '2026-07-11', status: 'Claim Submitted', ...seedAudit(2),
  },
]
