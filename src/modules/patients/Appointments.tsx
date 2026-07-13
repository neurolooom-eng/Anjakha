import { CalendarClock } from 'lucide-react'
import type { DataTableColumn } from '@/components/table/DataTable'
import { SchemaForm, type FormSection, type FormValues } from '@/components/form/SchemaForm'
import { StatusCell } from '@/components/ui/StatusChip'
import { ResourceModule } from '@/modules/ResourceModule'
import { AppointmentTimeField } from './AppointmentTimeField'
import { useCollection } from '@/lib/useCollection'
import { loadAppointments, loadDoctors, loadDoctorSchedules, loadPatients, saveAppointment, updateAppointment, withAudit } from '@/lib/repository'
import { useAuth } from '@/context/AuthContext'
import { formatDate } from '@/lib/format'
import { makeId } from '@/lib/id'
import { nextTokenNo } from '@/lib/scheduling'
import type { Appointment } from '@/types'

export const DEPARTMENTS = ['General Medicine', 'Cardiology', 'Orthopaedics', 'Gynaecology', 'ENT', 'Paediatrics', 'Dermatology']

const TYPE_OPTIONS = ['New', 'Follow-up'].map((v) => ({ value: v, label: v }))
const STATUS_OPTIONS = ['Scheduled', 'Checked In', 'Vitals Recorded', 'In Consultation', 'Completed', 'Cancelled', 'No Show'].map((v) => ({
  value: v, label: v,
}))

const columns: DataTableColumn<Appointment>[] = [
  { key: 'tokenNo', header: 'Token', accessor: (r) => r.tokenNo ?? '', width: 70, render: (r) => (r.tokenNo ? `#${r.tokenNo}` : '—') },
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
  const { data: doctors } = useCollection(loadDoctors)
  const { data: schedules } = useCollection(loadDoctorSchedules)
  const { currentUser } = useAuth()

  const patientOptions = patients.map((p) => ({ value: p.id, label: `${p.name} (${p.uhid})` }))
  const doctorOptions = doctors.filter((d) => d.status === 'Active').map((d) => ({ value: d.name, label: d.name }))

  const sections: FormSection[] = [
    {
      title: 'Visit details',
      fields: [
        { key: 'patientId', label: 'Patient', type: 'select', options: patientOptions, required: true },
        { key: 'doctorName', label: 'Doctor', type: 'select', options: doctorOptions, required: true },
        { key: 'department', label: 'Department', type: 'select', options: DEPARTMENTS.map((d) => ({ value: d, label: d })), required: true },
        { key: 'date', label: 'Date', type: 'date', required: true },
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
      tokenNo: editing?.tokenNo ?? nextTokenNo(values.doctorName, values.date, appointments),
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
      description="OPD appointment scheduling across departments. Doctors with a consultation schedule set (see Doctors → Consultation Schedules) get an auto-assigned slot & token; others take a manually entered time."
      icon={CalendarClock}
      columns={columns}
      rows={appointments}
      permissionBase="patients"
      newLabel="Schedule Appointment"
      emptyMessage={loading ? 'Loading…' : 'No appointments scheduled.'}
      toFormValues={toFormValues}
      buildRecord={(values, editing) => buildRecord({ ...values, id: editing?.id ?? makeId('apt') }, editing)}
      onSave={handleSave}
      renderForm={(values, setField, editing) => (
        <div className="flex flex-col gap-4">
          <SchemaForm sections={sections} values={values} onChange={setField} />
          <div className="card p-4">
            <AppointmentTimeField
              doctorName={values.doctorName}
              date={values.date}
              time={values.time}
              onTimeChange={(t) => setField('time', t)}
              schedules={schedules}
              appointments={appointments}
              excludeAppointmentId={editing?.id}
            />
          </div>
        </div>
      )}
    />
  )
}
