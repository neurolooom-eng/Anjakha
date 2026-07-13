import { WEEKDAYS } from '@/types'
import type { Appointment, DoctorSchedule, Weekday } from '@/types'

export function weekdayOf(dateStr: string): Weekday {
  const d = new Date(`${dateStr}T00:00:00`)
  return WEEKDAYS[d.getDay()]
}

/** The active schedule (if any) covering this doctor on this date's weekday. */
export function findSchedule(
  doctorName: string,
  date: string,
  schedules: DoctorSchedule[],
): DoctorSchedule | undefined {
  if (!doctorName || !date) return undefined
  const day = weekdayOf(date)
  return schedules.find(
    (s) => s.doctorName === doctorName && s.status === 'Active' && s.daysOfWeek.includes(day),
  )
}

/** Every slot start time ("HH:MM") a schedule produces across its working window. */
export function generateSlots(schedule: DoctorSchedule): string[] {
  const slots: string[] = []
  const [startH, startM] = schedule.startTime.split(':').map(Number)
  const [endH, endM] = schedule.endTime.split(':').map(Number)
  let h = startH
  let m = startM
  const endMinutes = endH * 60 + endM
  while (h * 60 + m < endMinutes) {
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    m += schedule.slotMinutes
    while (m >= 60) {
      m -= 60
      h += 1
    }
  }
  return slots
}

export interface SlotStats {
  schedule?: DoctorSchedule
  totalSlots: number
  bookedCount: number
  availableSlots: string[]
  nextAvailable?: string
}

/** Slot occupancy for one doctor on one date, whether or not they have a schedule set up. */
export function getSlotStats(
  doctorName: string,
  date: string,
  schedules: DoctorSchedule[],
  appointments: Appointment[],
): SlotStats {
  const schedule = findSchedule(doctorName, date, schedules)
  const bookedTimes = new Set(
    appointments
      .filter((a) => a.doctorName === doctorName && a.date === date && a.status !== 'Cancelled')
      .map((a) => a.time),
  )
  const bookedCount = appointments.filter(
    (a) => a.doctorName === doctorName && a.date === date && a.status !== 'Cancelled',
  ).length

  if (!schedule) {
    return { totalSlots: 0, bookedCount, availableSlots: [] }
  }

  const allSlots = generateSlots(schedule)
  const availableSlots = allSlots.filter((slot) => !bookedTimes.has(slot))
  return {
    schedule,
    totalSlots: allSlots.length,
    bookedCount,
    availableSlots,
    nextAvailable: availableSlots[0],
  }
}

/** The next sequential OPD token number for a doctor on a given date. */
export function nextTokenNo(doctorName: string, date: string, appointments: Appointment[]): number {
  const count = appointments.filter((a) => a.doctorName === doctorName && a.date === date).length
  return count + 1
}
