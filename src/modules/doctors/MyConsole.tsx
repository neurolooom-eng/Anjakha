import { useEffect, useState } from 'react'
import { ArrowRight, ClipboardList, FileText, ShieldAlert, SkipForward, Stethoscope } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatusChip } from '@/components/ui/StatusChip'
import { Drawer } from '@/components/ui/Drawer'
import { LineItemsEditor, type LineItemColumn } from '@/components/form/LineItemsEditor'
import { PatientRecordDrawer } from './PatientRecordDrawer'
import { useCollection } from '@/lib/useCollection'
import { loadAppointments, loadDoctors, loadDrugs, savePrescription, updateAppointment, withAudit } from '@/lib/repository'
import { useAuth } from '@/context/AuthContext'
import { makeId } from '@/lib/id'
import { todayISO } from '@/lib/format'
import type { Appointment, AppointmentStatus, PrescriptionItem } from '@/types'

export function MyConsoleTab() {
  const { currentUser } = useAuth()
  const { data: doctors, loading: loadingDoctors } = useCollection(loadDoctors)
  const { data: appointments, loading: loadingAppts, setData: setAppointments } = useCollection(loadAppointments)
  const { data: drugs } = useCollection(loadDrugs)
  const [currentToken, setCurrentToken] = useState<number | null>(null)
  const [goToInput, setGoToInput] = useState('')
  const [rxOpen, setRxOpen] = useState(false)
  const [rxItems, setRxItems] = useState<PrescriptionItem[]>([])
  const [rxSaving, setRxSaving] = useState(false)
  const [rxSaved, setRxSaved] = useState(false)
  const [recordOpen, setRecordOpen] = useState(false)

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

  async function handleStart() {
    if (!current) return
    await setStatus(current, 'In Consultation')
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

  function openPrescription() {
    setRxItems([])
    setRxSaved(false)
    setRxOpen(true)
  }

  async function saveRx() {
    if (!current || !myDoctor) return
    setRxSaving(true)
    try {
      const record = withAudit(
        {
          id: makeId('rx'),
          consultationId: '',
          patientId: current.patientId,
          patientName: current.patientName,
          doctorName: myDoctor.name,
          date: today,
          items: rxItems,
          status: 'Pending' as const,
        },
        currentUser?.name ?? 'system',
      )
      await savePrescription(record)
      setRxSaved(true)
      setTimeout(() => setRxOpen(false), 900)
    } finally {
      setRxSaving(false)
    }
  }

  const drugOptions = drugs.map((d) => ({ value: d.id, label: d.name }))
  const itemColumns: LineItemColumn<PrescriptionItem>[] = [
    {
      key: 'drugId', label: 'Drug', type: 'select', options: drugOptions, width: '24%',
      onSelect: (_row, value) => ({ drugName: drugs.find((d) => d.id === value)?.name ?? '' }),
    },
    { key: 'dosage', label: 'Dosage', type: 'text', width: '18%' },
    { key: 'frequency', label: 'Frequency', type: 'text', width: '18%' },
    { key: 'durationDays', label: 'Days', type: 'number', width: '10%' },
    { key: 'quantity', label: 'Qty', type: 'number', width: '10%' },
  ]

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
        <p className="text-xs text-muted">Today&rsquo;s token queue. Start a consultation, say Next when done, Skip an absent patient, or jump to any token.</p>
      </div>

      {queue.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No patients in your queue today" />
      ) : (
        <>
          <div className="card p-4">
            {current ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-lg font-bold text-primary">
                    #{current.tokenNo}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-text">{current.patientName}</p>
                    <p className="text-xs text-muted">{current.time} · {current.department}</p>
                  </div>
                  <StatusChip value={current.status} />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {current.status !== 'In Consultation' && current.status !== 'Completed' && (
                    <button className="btn-outline" onClick={handleStart}>Start Consultation</button>
                  )}
                  <button className="btn-outline" onClick={() => setRecordOpen(true)}>
                    <FileText size={14} /> Patient Record
                  </button>
                  <button className="btn-outline" onClick={openPrescription}>
                    <ClipboardList size={14} /> Write Prescription
                  </button>
                  <button className="btn-outline" onClick={handleSkip}>
                    <SkipForward size={14} /> Skip
                  </button>
                  <button className="btn-primary" onClick={handleNext}>
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
              <div
                key={appt.id}
                className={`flex flex-wrap items-center gap-3 p-3 ${appt.tokenNo === currentToken ? 'bg-primary/5' : ''}`}
              >
                <div className="flex w-12 shrink-0 items-center justify-center rounded-md bg-surface-2 py-1 text-sm font-bold tabular-nums text-text">
                  #{appt.tokenNo}
                </div>
                <div className="min-w-[160px] flex-1">
                  <p className="text-sm font-medium text-text">{appt.patientName}</p>
                  <p className="text-xs text-muted">{appt.time}</p>
                </div>
                <StatusChip value={appt.status} />
              </div>
            ))}
          </div>
        </>
      )}

      <Drawer
        open={rxOpen}
        onClose={() => setRxOpen(false)}
        title="Write Prescription"
        subtitle={current ? `${current.patientName} — Token #${current.tokenNo}` : undefined}
        footer={
          <>
            <button className="btn-outline" onClick={() => setRxOpen(false)}>Cancel</button>
            <button className="btn-primary" disabled={rxSaving} onClick={saveRx}>
              {rxSaving ? 'Saving…' : 'Save Prescription'}
            </button>
          </>
        }
      >
        <LineItemsEditor<PrescriptionItem>
          columns={itemColumns}
          rows={rxItems}
          onChange={setRxItems}
          newRow={() => ({ drugId: '', drugName: '', dosage: '', frequency: '', durationDays: 5, quantity: 0 })}
          addLabel="Add medicine"
        />
        {rxSaved && <p className="mt-2 text-xs text-success">Saved — visible in Pharmacy&rsquo;s dispensing queue.</p>}
      </Drawer>

      <PatientRecordDrawer
        open={recordOpen}
        onClose={() => setRecordOpen(false)}
        patientId={current?.patientId ?? null}
      />
    </div>
  )
}
