import { useState } from 'react'
import { ClipboardPlus, Stethoscope } from 'lucide-react'
import { Drawer } from '@/components/ui/Drawer'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatusChip } from '@/components/ui/StatusChip'
import { VitalsFields } from '@/components/clinical/VitalsFields'
import { useCollection } from '@/lib/useCollection'
import { loadAppointments, saveConsultation, updateAppointment, withAudit } from '@/lib/repository'
import { useAuth } from '@/context/AuthContext'
import { makeId } from '@/lib/id'
import { todayISO } from '@/lib/format'
import type { Appointment, Vitals } from '@/types'

export function NurseStationTab() {
  const { data: appointments, loading, setData: setAppointments } = useCollection(loadAppointments)
  const { hasPermission, currentUser } = useAuth()
  const canRecord = hasPermission('clinical:create')

  const [active, setActive] = useState<Appointment | null>(null)
  const [vitals, setVitals] = useState<Vitals>({})
  const [complaints, setComplaints] = useState('')
  const [saving, setSaving] = useState(false)

  const today = todayISO()
  const awaiting = appointments
    .filter((a) => a.date === today && a.status === 'Checked In')
    .sort((a, b) => a.time.localeCompare(b.time))

  function openFor(appt: Appointment) {
    setActive(appt)
    setVitals({})
    setComplaints('')
  }

  function close() {
    setActive(null)
  }

  async function handleSave() {
    if (!active) return
    setSaving(true)
    try {
      const consultation = withAudit(
        {
          id: makeId('con'),
          patientId: active.patientId,
          patientName: active.patientName,
          doctorName: active.doctorName,
          date: today,
          department: active.department,
          vitals,
          complaints,
          diagnosis: '',
          status: 'Draft' as const,
        },
        currentUser?.name ?? 'system',
      )
      await saveConsultation(consultation)

      const updatedAppt = withAudit({ ...active, status: 'Vitals Recorded' as const }, currentUser?.name ?? 'system', active)
      await updateAppointment(updatedAppt)
      setAppointments((rows) => rows.map((r) => (r.id === active.id ? updatedAppt : r)))
      close()
    } finally {
      setSaving(false)
    }
  }

  if (loading) return null

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-semibold text-text">Nurse&rsquo;s Station</h2>
        <p className="text-xs text-muted">
          Patients checked in for OPD today, awaiting vitals before their consultation. Recording vitals here
          creates a draft consultation note the doctor picks up in Clinical.
        </p>
      </div>

      {awaiting.length === 0 ? (
        <EmptyState
          icon={ClipboardPlus}
          title="No patients waiting for vitals"
          message="Patients marked Checked In on the OPD Queue will appear here."
        />
      ) : (
        <div className="card divide-y divide-border">
          {awaiting.map((appt) => (
            <div key={appt.id} className="flex flex-wrap items-center gap-3 p-3">
              <div className="flex w-14 shrink-0 items-center justify-center rounded-md bg-primary/10 py-1.5 text-sm font-bold tabular-nums text-primary">
                {appt.tokenNo ? `#${appt.tokenNo}` : '—'}
              </div>
              <div className="w-16 shrink-0 text-sm font-semibold tabular-nums text-text">{appt.time}</div>
              <div className="min-w-[160px] flex-1">
                <p className="text-sm font-medium text-text">{appt.patientName}</p>
                <p className="text-xs text-muted">{appt.doctorName} · {appt.department}</p>
              </div>
              <StatusChip value={appt.status} tone="info" />
              {canRecord && (
                <button className="btn-primary" onClick={() => openFor(appt)}>
                  <Stethoscope size={14} /> Record Vitals
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <Drawer
        open={active !== null}
        onClose={close}
        title="Record Vitals"
        subtitle={active ? `${active.patientName} — Token #${active.tokenNo ?? '—'} · ${active.doctorName}` : undefined}
        footer={
          <>
            <button className="btn-outline" onClick={close}>Cancel</button>
            <button className="btn-primary" disabled={saving} onClick={handleSave}>
              {saving ? 'Saving…' : 'Save & Send to Doctor'}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <VitalsFields value={vitals} onChange={setVitals} />
          <div>
            <label className="label">Complaint (if any)</label>
            <textarea className="textarea min-h-[80px]" value={complaints} onChange={(e) => setComplaints(e.target.value)} />
          </div>
        </div>
      </Drawer>
    </div>
  )
}
