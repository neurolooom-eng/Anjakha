import { CalendarClock } from 'lucide-react'
import type { DataTableColumn } from '@/components/table/DataTable'
import { SchemaForm, type FormSection, type FormValues } from '@/components/form/SchemaForm'
import { StatusCell } from '@/components/ui/StatusChip'
import { ResourceModule } from '@/modules/ResourceModule'
import { useCollection } from '@/lib/useCollection'
import { loadAppointments, loadPatients, saveAppointment, updateAppointment, withAudit } from '@/lib/repository'
import { useAuth } from '@/context/AuthContext'
import { formatDate } from '@/lib/format'
import { makeId } from '@/lib/id'
import type { Appointment } from '@/types'

export const DOCTORS = ['Dr. Rohit Verma', 'Dr. Kavya Rao', 'Dr. Sanjay Bhat']
export const DEPARTMENTS = ['General Medicine', 'Cardiology', 'Orthopaedics', 'Gynaecology', 'ENT', 'Paediatrics', 'Dermatology']

const TYPE_OPTIONS = ['New', 'Follow-up'].map((v) => ({ value: v, label: v }))
const STATUS_OPTIONS = ['Scheduled', 'Checked In', 'In Consultation', 'Completed', 'Cancelled', 'No Show'].map((v) => ({
  value: v, label: v,
}))

const columns: DataTableColumn<Appointment>[] = [
  { key: 'date', header: 'Date', accessor: (r) => r.date, width: 110, render: (r) => formatDate(r.date) },
  { key: 'time', header: 'Time', accessor: (r) => r.time, width: 80 },
  { key: 'patientName', header: 'Patient', accessor: (r) => r.patientName, width: 180 },
  { key: 'doctorName', header: 'Doctor', accessor: (r) => r.doctorName, width: 170 },
  { key: 'department', header: 'Department', accessor: (r) => r.department, width: 150 },
  { key: 'type', header: 'Type', accessor: (r) => r.type, width: 100 },
  { key: 'status', header: 'Status', accessor: (r) => r.status, width: 130, render: (r) => <StatusCell value={r.status} /> },
]

export function AppointmentsTab() {
  const { data: appointments, loading, setData } = useCollection(loadAppointments)
  const { data: patients } = useCollection(loadPatients)
  const { currentUser } = useAuth()

  const patientOptions = patients.map((p) => ({ value: p.id, label: `${p.name} (${p.uhid})` }))

  const sections: FormSection[] = [
    {
      title: 'Visit details',
      fields: [
        { key: 'patientId', label: 'Patient', type: 'select', options: patientOptions, required: true },
        { key: 'doctorName', label: 'Doctor', type: 'select', options: DOCTORS.map((d) => ({ value: d, label: d })), required: true },
        { key: 'department', label: 'Department', type: 'select', options: DEPARTMENTS.map((d) => ({ value: d, label: d })), required: true },
        { key: 'date', label: 'Date', type: 'date', required: true },
        { key: 'time', label: 'Time', type: 'text', placeholder: '09:30', required: true },
        { key: 'type', label: 'Visit type', type: 'select', options: TYPE_OPTIONS },
        { key: 'status', label: 'Status', type: 'status', options: STATUS_OPTIONS },
      ],
    },
    { title: 'Notes', fields: [{ key: 'notes', label: 'Notes', type: 'textarea' }] },
  ]

  function toFormValues(record: Appointment | null): FormValues {
    if (record) return { ...record }
    return { type: 'New', status: 'Scheduled', date: new Date().toISOString().slice(0, 10) }
  }

  function buildRecord(values: FormValues, editing: Appointment | null): Appointment {
    const patient = patients.find((p) => p.id === values.patientId)
    const base = {
      ...editing,
      ...values,
      patientName: patient?.name ?? values.patientName ?? editing?.patientName ?? '',
    } as Appointment
    return withAudit(base, currentUser?.name ?? 'system', editing ?? undefined) as Appointment
  }

  async function handleSave(record: Appointment, editing: Appointment | null) {
    if (editing) {
      await updateAppointment(record)
      setData((rows) => rows.map((r) => (r.id === record.id ? record : r)))
    } else {
      await saveAppointment(record)
      setData((rows) => [record, ...rows])
    }
  }

  return (
    <ResourceModule<Appointment>
      tableKey="patients-appointments"
      title="Appointments"
      description="OPD appointment scheduling across departments."
      icon={CalendarClock}
      columns={columns}
      rows={appointments}
      permissionBase="patients"
      newLabel="Schedule Appointment"
      emptyMessage={loading ? 'Loading…' : 'No appointments scheduled.'}
      toFormValues={toFormValues}
      buildRecord={(values, editing) => buildRecord({ ...values, id: editing?.id ?? makeId('apt') }, editing)}
      onSave={handleSave}
      renderForm={(values, setField) => (
        <SchemaForm sections={sections} values={values} onChange={setField} />
      )}
    />
  )
}
