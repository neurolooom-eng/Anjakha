import { useEffect } from 'react'
import { getSlotStats } from '@/lib/scheduling'
import type { Appointment, DoctorSchedule } from '@/types'

export function AppointmentTimeField({
  doctorName,
  date,
  time,
  onTimeChange,
  schedules,
  appointments,
  excludeAppointmentId,
}: {
  doctorName?: string
  date?: string
  time?: string
  onTimeChange: (t: string) => void
  schedules: DoctorSchedule[]
  appointments: Appointment[]
  excludeAppointmentId?: string
}) {
  const relevantAppointments = excludeAppointmentId
    ? appointments.filter((a) => a.id !== excludeAppointmentId)
    : appointments
  const stats = getSlotStats(doctorName ?? '', date ?? '', schedules, relevantAppointments)

  useEffect(() => {
    if (stats.schedule && !time) onTimeChange(stats.nextAvailable ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorName, date, stats.schedule, stats.nextAvailable])

  if (!doctorName || !date) {
    return (
      <div>
        <label className="label">Time</label>
        <input className="input" type="time" value={time ?? ''} onChange={(e) => onTimeChange(e.target.value)} disabled />
        <p className="mt-0.5 text-[11px] text-muted">Pick a doctor and date first.</p>
      </div>
    )
  }

  if (!stats.schedule) {
    return (
      <div>
        <label className="label">
          Scheduled time <span className="text-danger">*</span>
        </label>
        <input className="input" type="time" value={time ?? ''} onChange={(e) => onTimeChange(e.target.value)} />
        <p className="mt-0.5 text-[11px] text-muted">
          No consultation schedule set for {doctorName} on this day — enter the time manually.
        </p>
      </div>
    )
  }

  const options =
    time && !stats.availableSlots.includes(time) ? [time, ...stats.availableSlots] : stats.availableSlots

  return (
    <div>
      <label className="label">
        Consultation slot <span className="text-danger">*</span>
      </label>
      <select className="select" value={time ?? ''} onChange={(e) => onTimeChange(e.target.value)}>
        {options.length === 0 && <option value="">No slots available</option>}
        {options.map((slot) => (
          <option key={slot} value={slot}>
            {slot}
          </option>
        ))}
      </select>
      <p className="mt-0.5 text-[11px] text-muted">
        Auto-assigned from {doctorName}&rsquo;s schedule ({stats.schedule.startTime}–{stats.schedule.endTime},{' '}
        {stats.schedule.slotMinutes} min slots) — {stats.availableSlots.length} of {stats.totalSlots} slots free.
      </p>
    </div>
  )
}
