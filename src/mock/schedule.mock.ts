import type { DoctorSchedule } from '@/types'
import { seedAudit } from './audit'

export const mockDoctorSchedules: DoctorSchedule[] = [
  {
    id: 'sch_1', doctorName: 'Dr. Rohit Verma', department: 'Cardiology',
    daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    startTime: '09:00', endTime: '13:00', slotMinutes: 15, status: 'Active', ...seedAudit(60),
  },
  {
    id: 'sch_2', doctorName: 'Dr. Kavya Rao', department: 'Gynaecology',
    daysOfWeek: ['Mon', 'Wed', 'Fri'],
    startTime: '10:00', endTime: '14:00', slotMinutes: 20, status: 'Active', ...seedAudit(60),
  },
  // Dr. Sanjay Bhat has no schedule configured — appointments for him fall back
  // to a manually entered time, demonstrating the "default" behaviour.
]
