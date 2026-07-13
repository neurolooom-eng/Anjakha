import { ArrowRight, ListChecks } from 'lucide-react'
import { useCollection } from '@/lib/useCollection'
import { loadAppointments, updateAppointment, withAudit } from '@/lib/repository'
import { useAuth } from '@/context/AuthContext'
import { StatusCell } from '@/components/ui/StatusChip'
import { EmptyState } from '@/components/ui/EmptyState'
import { todayISO } from '@/lib/format'
import type { Appointment, AppointmentStatus } from '@/types'

const FLOW: AppointmentStatus[] = ['Scheduled', 'Checked In', 'In Consultation', 'Completed']

function nextStatus(status: AppointmentStatus): AppointmentStatus | null {
  const idx = FLOW.indexOf(status)
  if (idx === -1 || idx === FLOW.length - 1) return null
  return FLOW[idx + 1]
}

export function OpdQueueTab() {
  const { data: appointments, loading, setData } = useCollection(loadAppointments)
  const { hasPermission, currentUser } = useAuth()
  const canEdit = hasPermission('patients:edit')

  const today = todayISO()
  const queue = appointments
    .filter((a) => a.date === today && a.status !== 'Cancelled' && a.status !== 'No Show')
    .sort((a, b) => a.time.localeCompare(b.time))

  async function advance(appt: Appointment) {
    const next = nextStatus(appt.status)
    if (!next) return
    const updated = withAudit({ ...appt, status: next }, currentUser?.name ?? 'system', appt) as Appointment
    await updateAppointment(updated)
    setData((rows) => rows.map((r) => (r.id === appt.id ? updated : r)))
  }

  if (loading) return null

  if (queue.length === 0) {
    return (
      <EmptyState icon={ListChecks} title="No patients in today's OPD queue" message="Scheduled visits for today will appear here as they check in." />
    )
  }

  return (
    <div className="card divide-y divide-border">
      {queue.map((appt) => {
        const next = nextStatus(appt.status)
        return (
          <div key={appt.id} className="flex flex-wrap items-center gap-3 p-3">
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
  )
}
