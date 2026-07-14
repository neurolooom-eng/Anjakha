import { Stethoscope } from 'lucide-react'
import type { DataTableColumn } from '@/components/table/DataTable'
import { SchemaForm, type FormSection, type FormValues } from '@/components/form/SchemaForm'
import { StatusCell } from '@/components/ui/StatusChip'
import { VitalsFields } from '@/components/clinical/VitalsFields'
import { ResourceModule } from '@/modules/ResourceModule'
import { useCollection } from '@/lib/useCollection'
import { loadConsultations, loadDoctors, loadPatients, saveConsultation, updateConsultation, withAudit } from '@/lib/repository'
import { useAuth } from '@/context/AuthContext'
import { formatDate } from '@/lib/format'
import { makeId } from '@/lib/id'
import { DEPARTMENTS } from '@/modules/patients/Appointments'
import type { Consultation, Vitals } from '@/types'

const STATUS_OPTIONS = ['Draft', 'Finalized'].map((v) => ({ value: v, label: v }))

const columns: DataTableColumn<Consultation>[] = [
  { key: 'date', header: 'Date', accessor: (r) => r.date, width: 110, render: (r) => formatDate(r.date) },
  { key: 'patientName', header: 'Patient', accessor: (r) => r.patientName, width: 180 },
  { key: 'doctorName', header: 'Doctor', accessor: (r) => r.doctorName, width: 170 },
  { key: 'department', header: 'Department', accessor: (r) => r.department, width: 150 },
  { key: 'diagnosis', header: 'Diagnosis', accessor: (r) => r.diagnosis, width: 220 },
  { key: 'status', header: 'Status', accessor: (r) => r.status, width: 110, render: (r) => <StatusCell value={r.status} /> },
]

export function ConsultationsTab() {
  const { data: consultations, loading, setData } = useCollection(loadConsultations)
  const { data: patients } = useCollection(loadPatients)
  const { data: doctors } = useCollection(loadDoctors)
  const { currentUser } = useAuth()

  const patientOptions = patients.map((p) => ({ value: p.id, label: `${p.name} (${p.uhid})` }))
  const doctorOptions = doctors.filter((d) => d.status === 'Active').map((d) => ({ value: d.name, label: d.name }))

  const visitSections: FormSection[] = [
    {
      title: 'Visit',
      fields: [
        { key: 'patientId', label: 'Patient', type: 'select', options: patientOptions, required: true },
        { key: 'doctorName', label: 'Doctor', type: 'select', options: doctorOptions, required: true },
        { key: 'department', label: 'Department', type: 'select', options: DEPARTMENTS.map((d) => ({ value: d, label: d })), required: true },
        { key: 'date', label: 'Date', type: 'date', required: true },
        { key: 'followUpDate', label: 'Follow-up date', type: 'date' },
        { key: 'status', label: 'Status', type: 'status', options: STATUS_OPTIONS },
      ],
    },
  ]

  const assessmentSections: FormSection[] = [
    {
      title: 'Assessment',
      fields: [
        { key: 'complaints', label: 'Complaints', type: 'textarea', required: true },
        { key: 'diagnosis', label: 'Diagnosis', type: 'textarea', required: true },
        { key: 'advice', label: 'Advice', type: 'textarea' },
      ],
    },
  ]

  function toFormValues(record: Consultation | null): FormValues {
    if (record) return { ...record }
    return { status: 'Draft', date: new Date().toISOString().slice(0, 10), vitals: {} }
  }

  function buildRecord(values: FormValues, editing: Consultation | null): Consultation {
    const patient = patients.find((p) => p.id === values.patientId)
    const base = {
      ...editing,
      ...values,
      patientName: patient?.name ?? editing?.patientName ?? '',
      vitals: (values.vitals ?? {}) as Vitals,
    } as Consultation
    return withAudit(base, currentUser?.name ?? 'system', editing ?? undefined) as Consultation
  }

  async function handleSave(record: Consultation, editing: Consultation | null) {
    if (editing) {
      await updateConsultation(record)
      setData((rows) => rows.map((r) => (r.id === record.id ? record : r)))
    } else {
      await saveConsultation(record)
      setData((rows) => [record, ...rows])
    }
  }

  return (
    <ResourceModule<Consultation>
      tableKey="clinical-consultations"
      title="Consultations"
      description="EMR: consultation notes, vitals, and diagnosis."
      icon={Stethoscope}
      columns={columns}
      rows={consultations}
      permissionBase="clinical"
      newLabel="New Consultation"
      drawerWidth="max-w-5xl"
      emptyMessage={loading ? 'Loading…' : 'No consultations recorded.'}
      toFormValues={toFormValues}
      buildRecord={(values, editing) => buildRecord({ ...values, id: editing?.id ?? makeId('con') }, editing)}
      onSave={handleSave}
      renderForm={(values, setField) => (
        <div className="flex flex-col gap-4">
          <SchemaForm sections={visitSections} values={values} onChange={setField} />
          <div className="card p-4">
            <VitalsFields value={(values.vitals ?? {}) as Vitals} onChange={(v) => setField('vitals', v)} />
          </div>
          <SchemaForm sections={assessmentSections} values={values} onChange={setField} />
        </div>
      )}
    />
  )
}
