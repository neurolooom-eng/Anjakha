import { useEffect, useState } from 'react'
import { AlertTriangle, ChevronDown, ChevronRight, ClipboardList, FileText, Stethoscope } from 'lucide-react'
import { FullScreenModal } from '@/components/ui/FullScreenModal'
import { StatusChip, toneForStatus } from '@/components/ui/StatusChip'
import { EmptyState } from '@/components/ui/EmptyState'
import { VitalsFields } from '@/components/clinical/VitalsFields'
import { VitalsDisplay } from '@/components/clinical/VitalsDisplay'
import { DictationField } from '@/components/clinical/DictationField'
import { LineItemsEditor, type LineItemColumn } from '@/components/form/LineItemsEditor'
import { useCollection } from '@/lib/useCollection'
import {
  loadAdmissions, loadConsultations, loadDrugs, loadPatients, loadPrescriptions,
  saveConsultation, savePrescription, updateConsultation, updatePrescription, withAudit,
} from '@/lib/repository'
import { useAuth } from '@/context/AuthContext'
import { makeId } from '@/lib/id'
import { formatDate, todayISO } from '@/lib/format'
import type { Appointment, Consultation, Doctor, PrescriptionItem, Vitals } from '@/types'

function ageOf(dob: string): number | null {
  const d = new Date(dob)
  if (Number.isNaN(d.getTime())) return null
  return Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
}

function InfoStat({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-md bg-surface-2 px-2 py-1.5">
      <p className="text-[10px] uppercase tracking-wide text-muted">{label}</p>
      <p className="text-sm font-medium text-text">{value ?? '—'}</p>
    </div>
  )
}

function VisitRow({ consultation, prescriptionDrugs }: { consultation: Consultation; prescriptionDrugs: string[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-lg border border-border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-surface-2"
      >
        <div className="flex min-w-0 items-center gap-2">
          {open ? <ChevronDown size={14} className="shrink-0 text-muted" /> : <ChevronRight size={14} className="shrink-0 text-muted" />}
          <span className="shrink-0 text-xs font-semibold text-text">{formatDate(consultation.date)}</span>
          <span className="truncate text-xs text-muted">— {consultation.complaints || '—'}</span>
        </div>
        <StatusChip value={consultation.status} tone={consultation.status === 'Finalized' ? 'success' : 'neutral'} />
      </button>
      {open && (
        <div className="border-t border-border p-3 text-xs">
          <p className="text-muted">{consultation.doctorName} · {consultation.department}</p>
          <div className="mt-2"><VitalsDisplay vitals={consultation.vitals} /></div>
          <div className="mt-2 flex flex-col gap-1">
            <p><span className="font-medium text-text">Diagnosis:</span> <span className="text-muted">{consultation.diagnosis || '—'}</span></p>
            {consultation.advice && <p><span className="font-medium text-text">Advice:</span> <span className="text-muted">{consultation.advice}</span></p>}
            {consultation.followUpDate && <p><span className="font-medium text-text">Follow-up:</span> <span className="text-muted">{formatDate(consultation.followUpDate)}</span></p>}
            {prescriptionDrugs.length > 0 && <p><span className="font-medium text-text">Prescribed:</span> <span className="text-muted">{prescriptionDrugs.join(', ')}</span></p>}
          </div>
        </div>
      )}
    </div>
  )
}

/** The doctor's single-page view of a patient: vitals, dictated notes, prescription, and
 * collapsible past-visit history, all in one full-screen workspace instead of separate drawers. */
export function ConsultationWorkspace({
  open,
  onClose,
  appointment,
  doctor,
  onCompleted,
}: {
  open: boolean
  onClose: () => void
  appointment: Appointment | null
  doctor: Doctor
  onCompleted: () => void
}) {
  const { currentUser } = useAuth()
  const { data: patients } = useCollection(loadPatients)
  const { data: consultations, setData: setConsultations } = useCollection(loadConsultations)
  const { data: prescriptions, setData: setPrescriptions } = useCollection(loadPrescriptions)
  const { data: admissions } = useCollection(loadAdmissions)
  const { data: drugs } = useCollection(loadDrugs)

  const [vitals, setVitals] = useState<Vitals>({})
  const [complaints, setComplaints] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [advice, setAdvice] = useState('')
  const [followUpDate, setFollowUpDate] = useState('')
  const [rxItems, setRxItems] = useState<PrescriptionItem[]>([])
  const [saving, setSaving] = useState<'draft' | 'finalize' | null>(null)
  const [saved, setSaved] = useState(false)

  const today = todayISO()
  const patient = patients.find((p) => p.id === appointment?.patientId) ?? null
  const existingConsultation = appointment
    ? consultations.find((c) => c.patientId === appointment.patientId && c.doctorName === doctor.name && c.date === today) ?? null
    : null
  const existingPrescription = existingConsultation
    ? prescriptions.find((rx) => rx.consultationId === existingConsultation.id) ?? null
    : null

  useEffect(() => {
    if (!open) return
    setVitals(existingConsultation?.vitals ?? {})
    setComplaints(existingConsultation?.complaints ?? '')
    setDiagnosis(existingConsultation?.diagnosis ?? '')
    setAdvice(existingConsultation?.advice ?? '')
    setFollowUpDate(existingConsultation?.followUpDate ?? '')
    setRxItems(existingPrescription?.items ?? [])
    setSaved(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, appointment?.id])

  const history = appointment
    ? consultations
        .filter((c) => c.patientId === appointment.patientId && c.id !== existingConsultation?.id)
        .sort((a, b) => b.date.localeCompare(a.date))
    : []
  const myAdmissions = appointment ? admissions.filter((a) => a.patientId === appointment.patientId) : []

  const drugOptions = drugs.map((d) => ({ value: d.id, label: d.name }))
  const itemColumns: LineItemColumn<PrescriptionItem>[] = [
    {
      key: 'drugId', label: 'Drug', type: 'select', options: drugOptions, width: '26%',
      onSelect: (_row, value) => ({ drugName: drugs.find((d) => d.id === value)?.name ?? '' }),
    },
    { key: 'dosage', label: 'Dosage', type: 'text', width: '18%' },
    { key: 'frequency', label: 'Frequency', type: 'text', width: '18%' },
    { key: 'durationDays', label: 'Days', type: 'number', width: '10%' },
    { key: 'quantity', label: 'Qty', type: 'number', width: '10%' },
  ]

  async function persistConsultation(status: 'Draft' | 'Finalized') {
    const payload = {
      id: existingConsultation?.id ?? makeId('con'),
      patientId: appointment!.patientId,
      patientName: appointment!.patientName,
      doctorName: doctor.name,
      date: today,
      department: appointment!.department,
      vitals,
      complaints,
      diagnosis,
      advice: advice || undefined,
      followUpDate: followUpDate || undefined,
      status,
    }
    const audited = withAudit(payload, currentUser?.name ?? 'system', existingConsultation ?? undefined)
    if (existingConsultation) {
      await updateConsultation(audited)
      setConsultations((rows) => rows.map((r) => (r.id === audited.id ? audited : r)))
    } else {
      await saveConsultation(audited)
      setConsultations((rows) => [audited, ...rows])
    }
    return audited
  }

  async function persistPrescription(consultationId: string) {
    if (rxItems.length === 0) return
    const payload = {
      id: existingPrescription?.id ?? makeId('rx'),
      consultationId,
      patientId: appointment!.patientId,
      patientName: appointment!.patientName,
      doctorName: doctor.name,
      date: today,
      items: rxItems,
      status: existingPrescription?.status ?? ('Pending' as const),
    }
    const audited = withAudit(payload, currentUser?.name ?? 'system', existingPrescription ?? undefined)
    if (existingPrescription) {
      await updatePrescription(audited)
      setPrescriptions((rows) => rows.map((r) => (r.id === audited.id ? audited : r)))
    } else {
      await savePrescription(audited)
      setPrescriptions((rows) => [audited, ...rows])
    }
  }

  async function handleSaveDraft() {
    if (!appointment) return
    setSaving('draft')
    try {
      const c = await persistConsultation('Draft')
      await persistPrescription(c.id)
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    } finally {
      setSaving(null)
    }
  }

  async function handleFinalize() {
    if (!appointment) return
    setSaving('finalize')
    try {
      const c = await persistConsultation('Finalized')
      await persistPrescription(c.id)
      onCompleted()
    } finally {
      setSaving(null)
    }
  }

  return (
    <FullScreenModal
      open={open && appointment !== null}
      onClose={onClose}
      title={appointment?.patientName ?? 'Patient'}
      subtitle={
        appointment && patient
          ? `Token #${appointment.tokenNo} · ${ageOf(patient.dob) ?? '—'} yrs · ${patient.gender} · ${patient.uhid} · ${patient.phone}`
          : undefined
      }
      headerExtra={appointment ? <StatusChip value={appointment.status} tone={toneForStatus(appointment.status)} /> : undefined}
      footer={
        <>
          <button className="btn-outline" onClick={onClose}>Close</button>
          <button className="btn-outline" disabled={saving !== null} onClick={handleSaveDraft}>
            {saving === 'draft' ? 'Saving…' : 'Save Draft'}
          </button>
          <button className="btn-primary" disabled={saving !== null} onClick={handleFinalize}>
            {saving === 'finalize' ? 'Finalizing…' : 'Finalize & Next Patient'}
          </button>
        </>
      }
    >
      {!appointment || !patient ? (
        <EmptyState icon={FileText} title="No patient selected" />
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <div className="flex flex-col gap-3 lg:col-span-2">
            <div className="card p-3">
              <VitalsFields value={vitals} onChange={setVitals} />
            </div>
            <div className="card flex flex-col gap-2.5 p-3">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold text-text">
                <Stethoscope size={15} className="text-primary" /> Consultation Notes
              </h3>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <DictationField label="Chief Complaint" value={complaints} onChange={setComplaints} rows={2} placeholder="Type or dictate the patient's complaint…" />
                <DictationField label="Diagnosis" value={diagnosis} onChange={setDiagnosis} rows={2} placeholder="Type or dictate the diagnosis…" />
              </div>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-4">
                <div className="sm:col-span-3">
                  <DictationField label="Advice / Notes" value={advice} onChange={setAdvice} rows={2} placeholder="Advice, instructions, referrals…" />
                </div>
                <div>
                  <label className="label">Follow-up date</label>
                  <input type="date" className="input" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="card p-3">
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-text">
                <ClipboardList size={15} className="text-primary" /> Prescription
              </h3>
              <LineItemsEditor<PrescriptionItem>
                columns={itemColumns}
                rows={rxItems}
                onChange={setRxItems}
                newRow={() => ({ drugId: '', drugName: '', dosage: '', frequency: '', durationDays: 5, quantity: 0 })}
                addLabel="Add medicine"
              />
            </div>
            {saved && <p className="text-xs text-success">Saved.</p>}
          </div>

          <div className="flex flex-col gap-3 self-start">
            <div className="card grid grid-cols-2 gap-2 p-3">
              <InfoStat label="Blood group" value={patient.bloodGroup} />
              <InfoStat label="Category" value={patient.category} />
              <InfoStat label="Phone" value={patient.phone} />
              <InfoStat label="Status" value={patient.status} />
            </div>
            {patient.allergies && (
              <div className="card flex items-start gap-2 border-danger/40 bg-danger/5 p-3">
                <AlertTriangle size={15} className="mt-0.5 shrink-0 text-danger" />
                <p className="text-xs text-text"><span className="font-semibold">Allergies:</span> {patient.allergies}</p>
              </div>
            )}
            {myAdmissions.length > 0 && (
              <div className="card p-3">
                <h3 className="mb-2 text-xs font-semibold text-text">IPD History</h3>
                <div className="flex flex-col gap-1.5">
                  {myAdmissions.map((a) => (
                    <div key={a.id} className="flex items-center justify-between text-xs">
                      <span className="text-text">{formatDate(a.admissionDate)} — {a.diagnosis}</span>
                      <StatusChip value={a.status} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <h3 className="mb-2 text-xs font-semibold text-text">Visit History ({history.length})</h3>
              {history.length === 0 ? (
                <p className="text-xs text-muted">No past visits recorded.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {history.map((v) => (
                    <VisitRow
                      key={v.id}
                      consultation={v}
                      prescriptionDrugs={prescriptions
                        .filter((rx) => rx.consultationId === v.id || (rx.patientId === v.patientId && rx.date === v.date))
                        .flatMap((rx) => rx.items.map((i) => i.drugName))}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </FullScreenModal>
  )
}
