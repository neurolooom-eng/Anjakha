import { useState } from 'react'
import { ArrowRight, ListChecks, UserPlus } from 'lucide-react'
import { useCollection } from '@/lib/useCollection'
import { loadAppointments, loadDoctors, loadDoctorSchedules, loadPatients, updateAppointment, withAudit } from '@/lib/repository'
import { useAuth } from '@/context/AuthContext'
import { StatusCell } from '@/components/ui/StatusChip'
import { EmptyState } from '@/components/ui/EmptyState'
import { todayISO } from '@/lib/format'
import { NewOpdVisitDrawer } from './NewOpdVisit'
import type { Appointment, AppointmentStatus } from '@/types'

const FLOW: AppointmentStatus[] = ['Scheduled', 'Checked In', 'Vitals Recorded', 'In Consultation', 'Completed']

function nextStatus(status: AppointmentStatus): AppointmentStatus | null {
  const idx = FLOW.indexOf(status)
  if (idx === -1 || idx === FLOW.length - 1) return null
  return FLOW[idx + 1]
}

export function OpdQueueTab() {
  const { data: appointments, loading, setData: setAppointments } = useCollection(loadAppointments)
  const { data: patients, setData: setPatients } = useCollection(loadPatients)
  const { data: schedules } = useCollection(loadDoctorSchedules)
  const { data: doctors } = useCollection(loadDoctors)
  const { hasPermission, currentUser } = useAuth()
  const canEdit = hasPermission('patients:edit')
  const canCreate = hasPermission('patients:create')
  const [bookingOpen, setBookingOpen] = useState(false)
  const [justBooked, setJustBooked] = useState<{ name: string; token?: number; doctor: string } | null>(null)

  const today = todayISO()
  const queue = appointments
    .filter((a) => a.date === today && a.status !== 'Cancelled' && a.status !== 'No Show')
    .sort((a, b) => a.time.localeCompare(b.time))

  async function advance(appt: Appointment) {
    const next = nextStatus(appt.status)
    if (!next) return
    const updated = withAudit({ ...appt, status: next }, currentUser?.name ?? 'system', appt) as Appointment
    await updateAppointment(updated)
    setAppointments((rows) => rows.map((r) => (r.id === appt.id ? updated : r)))
  }

  if (loading) return null

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-text">Today&rsquo;s OPD Queue</h2>
          <p className="text-xs text-muted">Walk-ins get a token, a consultation slot, and are checked in immediately.</p>
        </div>
        {canCreate && (
          <button className="btn-primary" onClick={() => setBookingOpen(true)}>
            <UserPlus size={15} /> New OPD Visit
          </button>
        )}
      </div>

      {justBooked && (
        <div className="card border-success/40 bg-success/5 p-3 text-sm text-text">
          Booked <span className="font-semibold">{justBooked.name}</span>
          {justBooked.token ? <> — <span className="font-semibold">Token #{justBooked.token}</span></> : null} with {justBooked.doctor}.
        </div>
      )}

      {queue.length === 0 ? (
        <EmptyState icon={ListChecks} title="No patients in today's OPD queue" message="Walk-ins and scheduled visits for today will appear here." />
      ) : (
        <div className="card divide-y divide-border">
          {queue.map((appt) => {
            const next = nextStatus(appt.status)
            return (
              <div key={appt.id} className="flex flex-wrap items-center gap-3 p-3">
                <div className="flex w-14 shrink-0 items-center justify-center rounded-md bg-primary/10 py-1.5 text-sm font-bold tabular-nums text-primary">
                  {appt.tokenNo ? `#${appt.tokenNo}` : '—'}
                </div>
                <div className="w-16 shrink-0 text-sm font-semibold tabular-nums text-text">{appt.time}</div>
                <div className="min-w-[160px] flex-1">
                  <p className="text-sm font-medium text-text">{appt.patientName}</p>
                  <p className="text-xs text-muted">{appt.doctorName} · {appt.department}</p>
                </div>
                <StatusCell value={appt.status} />
                {canEdit && next && (
                  <button className="btn-outline" onClick={() => advance(appt)}>
                    Mark {next} <ArrowRight size={13} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      <NewOpdVisitDrawer
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        patients={patients}
        appointments={appointments}
        schedules={schedules}
        doctors={doctors}
        onPatientCreated={(p) => setPatients((rows) => [p, ...rows])}
        onAppointmentCreated={(a, patient) => {
          setAppointments((rows) => [a, ...rows])
          setJustBooked({ name: patient.name, token: a.tokenNo, doctor: a.doctorName })
          setTimeout(() => setJustBooked(null), 6000)
        }}
      />
    </div>
  )
}
