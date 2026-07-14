import { useEffect, useState } from 'react'
import { ArrowRight, ClipboardList, Maximize2, ShieldAlert, SkipForward, Stethoscope } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatusChip } from '@/components/ui/StatusChip'
import { ConsultationWorkspace } from './ConsultationWorkspace'
import { useCollection } from '@/lib/useCollection'
import { loadAppointments, loadDoctors, updateAppointment, withAudit } from '@/lib/repository'
import { useAuth } from '@/context/AuthContext'
import { todayISO } from '@/lib/format'
import type { Appointment, AppointmentStatus } from '@/types'

export function MyConsoleTab() {
  const { currentUser } = useAuth()
  const { data: doctors, loading: loadingDoctors } = useCollection(loadDoctors)
  const { data: appointments, loading: loadingAppts, setData: setAppointments } = useCollection(loadAppointments)
  const [currentToken, setCurrentToken] = useState<number | null>(null)
  const [goToInput, setGoToInput] = useState('')
  const [workspaceOpen, setWorkspaceOpen] = useState(false)

  const myDoctor = doctors.find((d) => d.id === currentUser?.doctorId) ?? null
  const today = todayISO()

  const queue = appointments
    .filter((a) => myDoctor && a.doctorName === myDoctor.name && a.date === today && a.status !== 'Cancelled' && a.status !== 'No Show' && a.tokenNo)
    .sort((a, b) => (a.tokenNo ?? 0) - (b.tokenNo ?? 0))

  const pending = queue.filter((a) => a.status !== 'Completed')

  useEffect(() => {
    if (currentToken === null && pending.length > 0) setCurrentToken(pending[0].tokenNo ?? null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending.length])

  const current = queue.find((a) => a.tokenNo === currentToken) ?? null

  function pickNextPending(afterToken: number | null) {
    const remaining = queue.filter((a) => a.status !== 'Completed' && a.tokenNo !== afterToken)
    if (remaining.length === 0) return null
    const ahead = remaining.filter((a) => afterToken !== null && (a.tokenNo ?? 0) > afterToken)
    return (ahead[0] ?? remaining[0]).tokenNo ?? null
  }

  async function setStatus(appt: Appointment, status: AppointmentStatus) {
    const updated = withAudit({ ...appt, status }, currentUser?.name ?? 'system', appt)
    await updateAppointment(updated)
    setAppointments((rows) => rows.map((r) => (r.id === appt.id ? updated : r)))
    return updated
  }

  async function handleNext() {
    if (!current) return
    await setStatus(current, 'Completed')
    setCurrentToken(pickNextPending(current.tokenNo ?? null))
  }

  function handleSkip() {
    if (!current) return
    setCurrentToken(pickNextPending(current.tokenNo ?? null))
  }

  function handleGoTo() {
    const n = Number(goToInput)
    if (!Number.isFinite(n)) return
    if (queue.some((a) => a.tokenNo === n)) setCurrentToken(n)
    setGoToInput('')
  }

  async function openWorkspace(tokenNo: number) {
    const appt = queue.find((a) => a.tokenNo === tokenNo)
    if (!appt) return
    setCurrentToken(tokenNo)
    if (appt.status === 'Scheduled' || appt.status === 'Checked In' || appt.status === 'Vitals Recorded') {
      await setStatus(appt, 'In Consultation')
    }
    setWorkspaceOpen(true)
  }

  async function handleWorkspaceCompleted() {
    if (!current) return
    await setStatus(current, 'Completed')
    setCurrentToken(pickNextPending(current.tokenNo ?? null))
    setWorkspaceOpen(false)
  }

  if (loadingDoctors || loadingAppts) return null

  if (!myDoctor) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Your login isn't linked to a doctor profile"
        message="Ask an Administrator to link your user account to a Doctor Registry entry from the Registry tab's Login column."
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="flex items-center gap-2 text-sm font-semibold text-text">
          <Stethoscope size={16} className="text-primary" /> My Console — {myDoctor.name}
        </h2>
        <p className="text-xs text-muted">
          Today&rsquo;s token queue. Click any patient to open their full consultation workspace — vitals, notes, prescription and history all in one place. Skip an absent patient or jump to any token.
        </p>
      </div>

      {queue.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No patients in your queue today" />
      ) : (
        <>
          <div className="card p-4">
            {current ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => openWorkspace(current.tokenNo!)}
                  className="flex items-center gap-3 rounded-md p-1 text-left hover:bg-surface-2"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-lg font-bold text-primary">
                    #{current.tokenNo}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-text">{current.patientName}</p>
                    <p className="text-xs text-muted">{current.time} · {current.department}</p>
                  </div>
                  <StatusChip value={current.status} />
                </button>
                <div className="flex flex-wrap items-center gap-2">
                  <button className="btn-primary" onClick={() => openWorkspace(current.tokenNo!)}>
                    <Maximize2 size={14} /> Open Patient
                  </button>
                  <button className="btn-outline" onClick={handleSkip}>
                    <SkipForward size={14} /> Skip
                  </button>
                  <button className="btn-outline" onClick={handleNext}>
                    Next <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted">All tokens for today are completed.</p>
            )}
            <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
              <label className="text-xs text-muted">Go to token</label>
              <input
                className="input w-24"
                type="number"
                value={goToInput}
                onChange={(e) => setGoToInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGoTo()}
              />
              <button className="btn-outline" onClick={handleGoTo}>Go</button>
            </div>
          </div>

          <div className="card divide-y divide-border">
            {queue.map((appt) => (
              <button
                type="button"
                key={appt.id}
                onClick={() => openWorkspace(appt.tokenNo!)}
                className={`flex w-full flex-wrap items-center gap-3 p-3 text-left hover:bg-surface-2 ${appt.tokenNo === currentToken ? 'bg-primary/5' : ''}`}
              >
                <div className="flex w-12 shrink-0 items-center justify-center rounded-md bg-surface-2 py-1 text-sm font-bold tabular-nums text-text">
                  #{appt.tokenNo}
                </div>
                <div className="min-w-[160px] flex-1">
                  <p className="text-sm font-medium text-text">{appt.patientName}</p>
                  <p className="text-xs text-muted">{appt.time}</p>
                </div>
                <StatusChip value={appt.status} />
              </button>
            ))}
          </div>
        </>
      )}

      <ConsultationWorkspace
        open={workspaceOpen}
        onClose={() => setWorkspaceOpen(false)}
        appointment={current}
        doctor={myDoctor}
        onCompleted={handleWorkspaceCompleted}
      />
    </div>
  )
}
