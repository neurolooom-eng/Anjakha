import type { ID } from './common'

export interface Permission {
  key: string
  label: string
  module: string
}

export interface Group {
  id: ID
  name: string
  permissions: string[]
}

export interface User {
  id: ID
  name: string
  email: string
  groupId: ID
  groupName: string
  status: 'Active' | 'Inactive'
  /** Links this login to a Doctor Registry record, for doctor self-service views. */
  doctorId?: ID
}
