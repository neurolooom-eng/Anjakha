import type { AuditFields, ID } from './common'

export interface Doctor extends AuditFields {
  id: ID
  name: string
  department: string
  qualification: string
  registrationNo: string
  phone: string
  email?: string
  consultationFee?: number
  status: 'Active' | 'Inactive'
}
