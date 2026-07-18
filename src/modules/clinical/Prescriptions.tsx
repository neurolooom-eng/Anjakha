import { ClipboardList } from 'lucide-react'
import type { DataTableColumn } from '@/components/table/DataTable'
import { SchemaForm, type FormSection, type FormValues } from '@/components/form/SchemaForm'
import { PrescriptionEditor } from '@/components/clinical/PrescriptionEditor'
import { StatusCell } from '@/components/ui/StatusChip'
import { ResourceModule } from '@/modules/ResourceModule'
import { useCollection } from '@/lib/useCollection'
import {
  loadConsultations, loadDrugs, loadPatients, loadPrescriptions, savePrescription, updatePrescription, withAudit,
} from '@/lib/repository'
import { useAuth } from '@/context/AuthContext'
import { formatDate } from '@/lib/format'
import { makeId } from '@/lib/id'
import type { Prescription, PrescriptionItem } from '@/types'

const STATUS_OPTIONS = ['Pending', 'Partially Dispensed', 'Dispensed', 'Cancelled'].map((v) => ({ value: v, label: v }))

const columns: DataTableColumn<Prescription>[] = [
  { key: 'date', header: 'Date', accessor: (r) => r.date, width: 110, render: (r) => formatDate(r.date) },
  { key: 'patientName', header: 'Patient', accessor: (r) => r.patientName, width: 180 },
  { key: 'doctorName', header: 'Doctor', accessor: (r) => r.doctorName, width: 170 },
  { key: 'items', header: 'Items', accessor: (r) => r.items.length, width: 90, render: (r) => `${r.items.length} drug${r.items.length === 1 ? '' : 's'}` },
  { key: 'status', header: 'Status', accessor: (r) => r.status, width: 150, render: (r) => <StatusCell value={r.status} /> },
]

export function PrescriptionsTab() {
  const { data: prescriptions, loading, setData } = useCollection(loadPrescriptions)
  const { data: patients } = useCollection(loadPatients)
  const { data: consultations } = useCollection(loadConsultations)
  const { data: drugs } = useCollection(loadDrugs)
  const { currentUser } = useAuth()

  const patientOptions = patients.map((p) => ({ value: p.id, label: `${p.name} (${p.uhid})` }))
  const consultationOptions = consultations.map((c) => ({ value: c.id, label: `${c.patientName} — ${formatDate(c.date)} (${c.diagnosis})` }))

  const sections: FormSection[] = [
    {
      title: 'Prescription',
      fields: [
        { key: 'consultationId', label: 'Consultation', type: 'select', options: consultationOptions },
        { key: 'patientId', label: 'Patient', type: 'select', options: patientOptions, required: true },
        { key: 'doctorName', label: 'Doctor', type: 'text', required: true },
        { key: 'date', label: 'Date', type: 'date', required: true },
        { key: 'status', label: 'Status', type: 'status', options: STATUS_OPTIONS },
      ],
    },
  ]

  function toFormValues(record: Prescription | null): FormValues {
    if (record) return { ...record }
    return { status: 'Pending', date: new Date().toISOString().slice(0, 10), items: [] }
  }

  function buildRecord(values: FormValues, editing: Prescription | null): Prescription {
    const patient = patients.find((p) => p.id === values.patientId)
    const base = {
      ...editing,
      ...values,
      patientName: patient?.name ?? editing?.patientName ?? '',
      items: (values.items ?? []) as PrescriptionItem[],
    } as Prescription
    return withAudit(base, currentUser?.name ?? 'system', editing ?? undefined) as Prescription
  }

  async function handleSave(record: Prescription, editing: Prescription | null) {
    if (editing) {
      await updatePrescription(record)
      setData((rows) => rows.map((r) => (r.id === record.id ? record : r)))
    } else {
      await savePrescription(record)
      setData((rows) => [record, ...rows])
    }
  }

  return (
    <ResourceModule<Prescription>
      tableKey="clinical-prescriptions"
      title="Prescriptions"
      description="Prescriptions issued during consultations, queued for pharmacy dispensing."
      icon={ClipboardList}
      columns={columns}
      rows={prescriptions}
      permissionBase="clinical"
      newLabel="New Prescription"
      drawerWidth="max-w-5xl"
      emptyMessage={loading ? 'Loading…' : 'No prescriptions recorded.'}
      toFormValues={toFormValues}
      buildRecord={(values, editing) => buildRecord({ ...values, id: editing?.id ?? makeId('rx') }, editing)}
      onSave={handleSave}
      renderForm={(values, setField) => (
        <div className="flex flex-col gap-4">
          <SchemaForm sections={sections} values={values} onChange={setField} />
          <div>
            <p className="label">Medicines</p>
            <PrescriptionEditor
              drugs={drugs}
              rows={(values.items ?? []) as PrescriptionItem[]}
              onChange={(rows) => setField('items', rows)}
            />
          </div>
        </div>
      )}
    />
  )
}
