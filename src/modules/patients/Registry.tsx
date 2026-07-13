import { Users } from 'lucide-react'
import type { DataTableColumn } from '@/components/table/DataTable'
import { SchemaForm, type FormSection, type FormValues } from '@/components/form/SchemaForm'
import { StatusCell } from '@/components/ui/StatusChip'
import { ResourceModule } from '@/modules/ResourceModule'
import { useCollection } from '@/lib/useCollection'
import { loadPatients, savePatient, updatePatient, withAudit } from '@/lib/repository'
import { useAuth } from '@/context/AuthContext'
import { formatDate } from '@/lib/format'
import { makeId } from '@/lib/id'
import type { Patient } from '@/types'

const GENDER_OPTIONS = ['Male', 'Female', 'Other'].map((v) => ({ value: v, label: v }))
const BLOOD_OPTIONS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((v) => ({ value: v, label: v }))
const CATEGORY_OPTIONS = ['General', 'Insurance', 'Corporate', 'Government Scheme'].map((v) => ({ value: v, label: v }))
const STATUS_OPTIONS = ['Active', 'Inactive'].map((v) => ({ value: v, label: v }))

const sections: FormSection[] = [
  {
    title: 'Identity',
    fields: [
      { key: 'uhid', label: 'UHID', type: 'text', readonly: true, help: 'Auto-generated on save' },
      { key: 'name', label: 'Full name', type: 'text', required: true },
      { key: 'gender', label: 'Gender', type: 'select', options: GENDER_OPTIONS, required: true },
      { key: 'dob', label: 'Date of birth', type: 'date', required: true },
      { key: 'bloodGroup', label: 'Blood group', type: 'select', options: BLOOD_OPTIONS },
    ],
  },
  {
    title: 'Contact',
    fields: [
      { key: 'phone', label: 'Phone', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'address', label: 'Address', type: 'textarea' },
      { key: 'emergencyContact', label: 'Emergency contact', type: 'text' },
    ],
  },
  {
    title: 'Care',
    fields: [
      { key: 'category', label: 'Billing category', type: 'select', options: CATEGORY_OPTIONS, required: true },
      { key: 'allergies', label: 'Known allergies', type: 'textarea', help: 'Flagged to clinical staff' },
      { key: 'status', label: 'Status', type: 'status', options: STATUS_OPTIONS },
    ],
  },
]

const columns: DataTableColumn<Patient>[] = [
  { key: 'name', header: 'Name', accessor: (r) => r.name, width: 200 },
  { key: 'uhid', header: 'UHID', accessor: (r) => r.uhid, width: 140, nowrap: true },
  { key: 'gender', header: 'Gender', accessor: (r) => r.gender, width: 90 },
  { key: 'phone', header: 'Phone', accessor: (r) => r.phone, width: 150, nowrap: true },
  { key: 'category', header: 'Category', accessor: (r) => r.category, width: 140 },
  { key: 'bloodGroup', header: 'Blood', accessor: (r) => r.bloodGroup ?? '', width: 80 },
  {
    key: 'status', header: 'Status', accessor: (r) => r.status, width: 110,
    render: (r) => <StatusCell value={r.status} />,
  },
  {
    key: 'updatedAt', header: 'Updated', accessor: (r) => r.updatedAt, width: 130,
    render: (r) => formatDate(r.updatedAt),
  },
]

export function PatientRegistry() {
  const { data: patients, loading, setData } = useCollection(loadPatients)
  const { currentUser } = useAuth()

  function toFormValues(record: Patient | null): FormValues {
    if (record) return { ...record }
    return {
      uhid: `ANJ-${new Date().getFullYear()}-${String(patients.length + 1).padStart(4, '0')}`,
      status: 'Active',
      category: 'General',
    }
  }

  function buildRecord(values: FormValues, editing: Patient | null): Patient {
    const base = { ...editing, ...values } as Patient
    return withAudit(base, currentUser?.name ?? 'system', editing ?? undefined) as Patient
  }

  async function handleSave(record: Patient, editing: Patient | null) {
    if (editing) {
      await updatePatient(record)
      setData((rows) => rows.map((r) => (r.id === record.id ? record : r)))
    } else {
      await savePatient(record)
      setData((rows) => [record, ...rows])
    }
  }

  return (
    <ResourceModule<Patient>
      tableKey="patients-registry"
      title="Patient Registry"
      description="Master list of all registered patients."
      icon={Users}
      columns={columns}
      rows={patients}
      permissionBase="patients"
      newLabel="Register Patient"
      emptyMessage={loading ? 'Loading…' : 'No patients registered yet.'}
      toFormValues={toFormValues}
      buildRecord={(values, editing) => buildRecord({ ...values, id: editing?.id ?? makeId('pat') }, editing)}
      onSave={handleSave}
      renderForm={(values, setField) => (
        <SchemaForm sections={sections} values={values} onChange={setField} />
      )}
    />
  )
}
