import type { AuditFields, ID } from './common'

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const
export type Weekday = (typeof WEEKDAYS)[number]

export interface DoctorSchedule extends AuditFields {
  id: ID
  doctorName: string
  department: string
  daysOfWeek: Weekday[]
  startTime: string
  endTime: string
  slotMinutes: number
  status: 'Active' | 'Inactive'
}
