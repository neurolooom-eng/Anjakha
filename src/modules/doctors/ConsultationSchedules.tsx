import { useState } from 'react'
import { CalendarCog, Users } from 'lucide-react'
import type { DataTableColumn } from '@/components/table/DataTable'
import { SchemaForm, type FormSection, type FormValues } from '@/components/form/SchemaForm'
import { StatusChip } from '@/components/ui/StatusChip'
import { ResourceModule } from '@/modules/ResourceModule'
import { useCollection } from '@/lib/useCollection'
import { loadAppointments, loadDoctors, loadDoctorSchedules, saveDoctorSchedule, updateDoctorSchedule, withAudit } from '@/lib/repository'
import { useAuth } from '@/context/AuthContext'
import { getSlotStats } from '@/lib/scheduling'
import { makeId } from '@/lib/id'
import { todayISO } from '@/lib/format'
import { DEPARTMENTS } from '@/modules/patients/Appointments'
import { WEEKDAYS, type DoctorSchedule, type Tone } from '@/types'

const DAY_OPTIONS = WEEKDAYS.map((d) => ({ value: d, label: d }))
const STATUS_OPTIONS = ['Active', 'Inactive'].map((v) => ({ value: v, label: v }))

const columns: DataTableColumn<DoctorSchedule>[] = [
  { key: 'doctorName', header: 'Doctor', accessor: (r) => r.doctorName, width: 190 },
  { key: 'department', header: 'Department', accessor: (r) => r.department, width: 150 },
  { key: 'daysOfWeek', header: 'Days', accessor: (r) => r.daysOfWeek.join(', '), width: 180 },
  { key: 'hours', header: 'Hours', accessor: (r) => `${r.startTime}–${r.endTime}`, width: 120 },
  { key: 'slotMinutes', header: 'Per-patient time', accessor: (r) => r.slotMinutes, width: 130, render: (r) => `${r.slotMinutes} min` },
  { key: 'status', header: 'Status', accessor: (r) => r.status, width: 100, render: (r) => <StatusChip value={r.status} tone={r.status === 'Active' ? 'success' : 'neutral'} /> },
]

export function ConsultationSchedulesTab() {
  const { data: schedules, loading, setData } = useCollection(loadDoctorSchedules)
  const { data: appointments } = useCollection(loadAppointments)
  const { data: doctors } = useCollection(loadDoctors)
  const { currentUser } = useAuth()
  const [date, setDate] = useState(todayISO())

  const activeDoctorNames = doctors.filter((d) => d.status === 'Active').map((d) => d.name)
  const doctorOptions = activeDoctorNames.map((d) => ({ value: d, label: d }))

  const sections: FormSection[] = [
    {
      title: 'Consultation schedule',
      fields: [
        { key: 'doctorName', label: 'Doctor', type: 'select', options: doctorOptions, required: true },
        { key: 'department', label: 'Department', type: 'select', options: DEPARTMENTS.map((d) => ({ value: d, label: d })), required: true },
        { key: 'daysOfWeek', label: 'Working days', type: 'multiselect', options: DAY_OPTIONS, required: true },
        { key: 'startTime', label: 'Start time', type: 'text', placeholder: '09:00', required: true, help: '24-hour HH:MM' },
        { key: 'endTime', label: 'End time', type: 'text', placeholder: '13:00', required: true, help: '24-hour HH:MM' },
        { key: 'slotMinutes', label: 'Approx. time per patient (minutes)', type: 'number', required: true },
        { key: 'status', label: 'Status', type: 'status', options: STATUS_OPTIONS },
      ],
    },
  ]

  function toFormValues(record: DoctorSchedule | null): FormValues {
    if (record) return { ...record }
    return { daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], slotMinutes: 15, status: 'Active' }
  }

  function buildRecord(values: FormValues, editing: DoctorSchedule | null): DoctorSchedule {
    const base = { ...editing, ...values } as DoctorSchedule
    return withAudit(base, currentUser?.name ?? 'system', editing ?? undefined) as DoctorSchedule
  }

  async function handleSave(record: DoctorSchedule, editing: DoctorSchedule | null) {
    if (editing) {
      await updateDoctorSchedule(record)
      setData((rows) => rows.map((r) => (r.id === record.id ? record : r)))
    } else {
      await saveDoctorSchedule(record)
      setData((rows) => [record, ...rows])
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-text">
            <CalendarCog size={16} className="text-primary" /> Slot availability
          </h2>
          <div>
            <label className="label mb-0">Date</label>
            <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>
        {loading ? null : (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activeDoctorNames.map((doctor) => {
              const stats = getSlotStats(doctor, date, schedules, appointments)
              if (!stats.schedule) {
                return (
                  <div key={doctor} className="rounded-lg border border-border p-3">
                    <p className="text-sm font-medium text-text">{doctor}</p>
                    <p className="mt-1 text-xs text-muted">No consultation schedule set for this day</p>
                    <p className="mt-2 text-xs text-text">{stats.bookedCount} patient{stats.bookedCount === 1 ? '' : 's'} scheduled (manual time)</p>
                  </div>
                )
              }
              const pctBooked = stats.totalSlots ? Math.round((stats.bookedCount / stats.totalSlots) * 100) : 0
              const tone: Tone = pctBooked >= 100 ? 'danger' : pctBooked >= 80 ? 'warning' : 'success'
              return (
                <div key={doctor} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-text">{doctor}</p>
                    <StatusChip value={`${stats.availableSlots.length} free`} tone={tone} />
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {stats.schedule.startTime}–{stats.schedule.endTime} · {stats.schedule.slotMinutes} min slots
                  </p>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                    <div className={`h-full rounded-full ${tone === 'danger' ? 'bg-danger' : tone === 'warning' ? 'bg-warning' : 'bg-success'}`} style={{ width: `${Math.min(pctBooked, 100)}%` }} />
                  </div>
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-text">
                    <Users size={12} /> {stats.bookedCount} booked of {stats.totalSlots} slots
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <ResourceModule<DoctorSchedule>
        tableKey="doctors-consultation-schedules"
        title="Consultation Schedules"
        description="Set up a consultation window per doctor so appointment times auto-assign; doctors left unset take a manually entered time instead."
        icon={CalendarCog}
        columns={columns}
        rows={schedules}
        permissionBase="doctors"
        newLabel="Add Schedule"
        emptyMessage={loading ? 'Loading…' : 'No consultation schedules configured — appointment times are entered manually for every doctor.'}
        toFormValues={toFormValues}
        buildRecord={(values, editing) => buildRecord({ ...values, id: editing?.id ?? makeId('sch') }, editing)}
        onSave={handleSave}
        renderForm={(values, setField) => (
          <SchemaForm sections={sections} values={values} onChange={setField} />
        )}
      />
    </div>
  )
}
