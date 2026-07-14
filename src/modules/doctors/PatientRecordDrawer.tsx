import { useState } from 'react'
import { AlertTriangle, ChevronDown, ChevronRight, FileText } from 'lucide-react'
import { Drawer } from '@/components/ui/Drawer'
import { StatusChip } from '@/components/ui/StatusChip'
import { EmptyState } from '@/components/ui/EmptyState'
import { VitalsDisplay } from '@/components/clinical/VitalsDisplay'
import { useCollection } from '@/lib/useCollection'
import { loadAdmissions, loadConsultations, loadPatients, loadPrescriptions } from '@/lib/repository'
import { formatDate } from '@/lib/format'
import type { Consultation } from '@/types'

function ageOf(dob: string): number | null {
  const d = new Date(dob)
  if (Number.isNaN(d.getTime())) return null
  const diff = Date.now() - d.getTime()
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000))
}

function VisitRow({ consultation, prescriptionDrugs }: { consultation: Consultation; prescriptionDrugs: string[] }) {
  const [open, setOpen] = useState(false)
  const complaintPreview = consultation.complaints || '—'
  return (
    <div className="rounded-lg border border-border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-surface-2"
      >
        <div className="flex min-w-0 items-center gap-2">
          {open ? <ChevronDown size={15} className="shrink-0 text-muted" /> : <ChevronRight size={15} className="shrink-0 text-muted" />}
          <span className="shrink-0 text-sm font-semibold text-text">{formatDate(consultation.date)}</span>
          <span className="truncate text-sm text-muted">— {complaintPreview}</span>
        </div>
        <StatusChip value={consultation.status} tone={consultation.status === 'Finalized' ? 'success' : 'neutral'} />
      </button>
      {open && (
        <div className="border-t border-border p-3 text-sm">
          <p className="text-xs text-muted">{consultation.doctorName} · {consultation.department}</p>
          <div className="mt-2">
            <VitalsDisplay vitals={consultation.vitals} />
          </div>
          <div className="mt-3 flex flex-col gap-1.5">
            <p><span className="font-medium text-text">Diagnosis:</span> <span className="text-muted">{consultation.diagnosis || '—'}</span></p>
            {consultation.advice && <p><span className="font-medium text-text">Advice:</span> <span className="text-muted">{consultation.advice}</span></p>}
            {consultation.followUpDate && <p><span className="font-medium text-text">Follow-up:</span> <span className="text-muted">{formatDate(consultation.followUpDate)}</span></p>}
            {prescriptionDrugs.length > 0 && (
              <p><span className="font-medium text-text">Prescribed:</span> <span className="text-muted">{prescriptionDrugs.join(', ')}</span></p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function InfoStat({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-md bg-surface-2 px-2 py-1.5">
      <p className="text-[10px] uppercase tracking-wide text-muted">{label}</p>
      <p className="text-sm font-medium text-text">{value ?? '—'}</p>
    </div>
  )
}

export function PatientRecordDrawer({
  open,
  onClose,
  patientId,
}: {
  open: boolean
  onClose: () => void
  patientId: string | null
}) {
  const { data: patients } = useCollection(loadPatients)
  const { data: consultations } = useCollection(loadConsultations)
  const { data: prescriptions } = useCollection(loadPrescriptions)
  const { data: admissions } = useCollection(loadAdmissions)

  const patient = patients.find((p) => p.id === patientId) ?? null
  const visits = consultations
    .filter((c) => c.patientId === patientId)
    .sort((a, b) => b.date.localeCompare(a.date))
  const myAdmissions = admissions.filter((a) => a.patientId === patientId)

  return (
    <Drawer
      open={open && patientId !== null}
      onClose={onClose}
      title={patient?.name ?? 'Patient Record'}
      subtitle={patient ? `${patient.uhid} · ${ageOf(patient.dob) ?? '—'} yrs · ${patient.gender}` : undefined}
      width="max-w-5xl"
    >
      {!patient ? (
        <EmptyState icon={FileText} title="Patient not found" />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="card grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
            <InfoStat label="Blood group" value={patient.bloodGroup} />
            <InfoStat label="Phone" value={patient.phone} />
            <InfoStat label="Category" value={patient.category} />
            <InfoStat label="Status" value={patient.status} />
          </div>

          {patient.allergies && (
            <div className="card flex items-start gap-2 border-danger/40 bg-danger/5 p-3">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-danger" />
              <p className="text-sm text-text"><span className="font-semibold">Allergies:</span> {patient.allergies}</p>
            </div>
          )}

          {myAdmissions.length > 0 && (
            <div className="card p-4">
              <h3 className="mb-2 text-sm font-semibold text-text">IPD History</h3>
              <div className="flex flex-col gap-1.5">
                {myAdmissions.map((a) => (
                  <div key={a.id} className="flex items-center justify-between text-sm">
                    <span className="text-text">{formatDate(a.admissionDate)} — {a.diagnosis}</span>
                    <StatusChip value={a.status} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="mb-2 text-sm font-semibold text-text">Visit History ({visits.length})</h3>
            {visits.length === 0 ? (
              <EmptyState icon={FileText} title="No past visits recorded" />
            ) : (
              <div className="flex flex-col gap-2">
                {visits.map((v) => (
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
      )}
    </Drawer>
  )
}
