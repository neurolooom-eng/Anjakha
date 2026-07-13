import { BedDouble } from 'lucide-react'
import type { DataTableColumn } from '@/components/table/DataTable'
import { SchemaForm, type FormSection, type FormValues } from '@/components/form/SchemaForm'
import { StatusCell } from '@/components/ui/StatusChip'
import { ResourceModule } from '@/modules/ResourceModule'
import { useCollection } from '@/lib/useCollection'
import { loadAdmissions, loadBeds, loadDoctors, loadPatients, saveAdmission, updateAdmission, updateBed, withAudit } from '@/lib/repository'
import { useAuth } from '@/context/AuthContext'
import { formatDate } from '@/lib/format'
import { makeId } from '@/lib/id'
import type { Admission, Bed } from '@/types'

const STATUS_OPTIONS = ['Admitted', 'Discharged', 'Transferred', 'Deceased'].map((v) => ({ value: v, label: v }))

const columns: DataTableColumn<Admission>[] = [
  { key: 'patientName', header: 'Patient', accessor: (r) => r.patientName, width: 180 },
  { key: 'bedLabel', header: 'Bed', accessor: (r) => r.bedLabel, width: 180 },
  { key: 'admittingDoctor', header: 'Doctor', accessor: (r) => r.admittingDoctor, width: 170 },
  { key: 'admissionDate', header: 'Admitted', accessor: (r) => r.admissionDate, width: 110, render: (r) => formatDate(r.admissionDate) },
  { key: 'dischargeDate', header: 'Discharged', accessor: (r) => r.dischargeDate ?? '', width: 110, render: (r) => formatDate(r.dischargeDate) },
  { key: 'diagnosis', header: 'Diagnosis', accessor: (r) => r.diagnosis, width: 240 },
  { key: 'status', header: 'Status', accessor: (r) => r.status, width: 120, render: (r) => <StatusCell value={r.status} /> },
]

export function AdmissionsTab() {
  const { data: admissions, loading, setData } = useCollection(loadAdmissions)
  const { data: patients } = useCollection(loadPatients)
  const { data: beds, setData: setBeds } = useCollection(loadBeds)
  const { data: doctors } = useCollection(loadDoctors)
  const { currentUser } = useAuth()

  const patientOptions = patients.map((p) => ({ value: p.id, label: `${p.name} (${p.uhid})` }))
  const bedOptions = beds
    .filter((b) => b.status === 'Available')
    .map((b) => ({ value: b.id, label: `${b.bedNumber} · ${b.wardName} (₹${b.dailyRate}/day)` }))
  const doctorOptions = doctors.filter((d) => d.status === 'Active').map((d) => ({ value: d.name, label: d.name }))

  const sections: FormSection[] = [
    {
      title: 'Admission',
      fields: [
        { key: 'patientId', label: 'Patient', type: 'select', options: patientOptions, required: true },
        { key: 'bedId', label: 'Bed (available)', type: 'select', options: bedOptions, required: true, help: 'Only currently available beds are listed' },
        { key: 'admittingDoctor', label: 'Admitting doctor', type: 'select', options: doctorOptions, required: true },
        { key: 'admissionDate', label: 'Admission date', type: 'date', required: true },
        { key: 'dischargeDate', label: 'Discharge date', type: 'date' },
        { key: 'status', label: 'Status', type: 'status', options: STATUS_OPTIONS },
      ],
    },
    {
      title: 'Clinical',
      fields: [
        { key: 'diagnosis', label: 'Diagnosis', type: 'textarea', required: true },
        { key: 'notes', label: 'Notes', type: 'textarea' },
      ],
    },
  ]

  function toFormValues(record: Admission | null): FormValues {
    if (record) return { ...record }
    return { status: 'Admitted', admissionDate: new Date().toISOString().slice(0, 10) }
  }

  function buildRecord(values: FormValues, editing: Admission | null): Admission {
    const patient = patients.find((p) => p.id === values.patientId)
    const bed = beds.find((b) => b.id === values.bedId)
    const base = {
      ...editing,
      ...values,
      patientName: patient?.name ?? editing?.patientName ?? '',
      bedLabel: bed ? `${bed.bedNumber} · ${bed.wardName}` : editing?.bedLabel ?? '',
    } as Admission
    return withAudit(base, currentUser?.name ?? 'system', editing ?? undefined) as Admission
  }

  async function handleSave(record: Admission, editing: Admission | null) {
    if (editing) {
      await updateAdmission(record)
      setData((rows) => rows.map((r) => (r.id === record.id ? record : r)))
    } else {
      await saveAdmission(record)
      setData((rows) => [record, ...rows])
      const bed = beds.find((b) => b.id === record.bedId)
      if (bed) {
        const updatedBed: Bed = withAudit({ ...bed, status: 'Occupied' }, currentUser?.name ?? 'system', bed) as Bed
        await updateBed(updatedBed)
        setBeds((rows) => rows.map((b) => (b.id === bed.id ? updatedBed : b)))
      }
    }
    if (editing && record.status === 'Discharged' && editing.status !== 'Discharged') {
      const bed = beds.find((b) => b.id === record.bedId)
      if (bed) {
        const updatedBed: Bed = withAudit({ ...bed, status: 'Cleaning' }, currentUser?.name ?? 'system', bed) as Bed
        await updateBed(updatedBed)
        setBeds((rows) => rows.map((b) => (b.id === bed.id ? updatedBed : b)))
      }
    }
  }

  return (
    <ResourceModule<Admission>
      tableKey="ipd-admissions"
      title="Admissions"
      description="Inpatient admissions, bed assignment, and discharge tracking."
      icon={BedDouble}
      columns={columns}
      rows={admissions}
      permissionBase="ipd"
      newLabel="Admit Patient"
      emptyMessage={loading ? 'Loading…' : 'No admissions recorded.'}
      toFormValues={toFormValues}
      buildRecord={(values, editing) => buildRecord({ ...values, id: editing?.id ?? makeId('adm') }, editing)}
      onSave={handleSave}
      renderForm={(values, setField) => (
        <SchemaForm sections={sections} values={values} onChange={setField} />
      )}
    />
  )
}
