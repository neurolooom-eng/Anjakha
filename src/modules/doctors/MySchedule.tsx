import { useEffect, useState } from 'react'
import { CalendarClock, ShieldAlert } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { SchemaForm, type FormSection, type FormValues } from '@/components/form/SchemaForm'
import { useCollection } from '@/lib/useCollection'
import { loadDoctors, loadDoctorSchedules, saveDoctorSchedule, updateDoctorSchedule, withAudit } from '@/lib/repository'
import { useAuth } from '@/context/AuthContext'
import { makeId } from '@/lib/id'
import { WEEKDAYS, type DoctorSchedule } from '@/types'

const DAY_OPTIONS = WEEKDAYS.map((d) => ({ value: d, label: d }))
const STATUS_OPTIONS = ['Active', 'Inactive'].map((v) => ({ value: v, label: v }))

const sections: FormSection[] = [
  {
    title: 'My consultation window',
    fields: [
      { key: 'daysOfWeek', label: 'Working days', type: 'multiselect', options: DAY_OPTIONS, required: true },
      { key: 'startTime', label: 'Start time', type: 'text', placeholder: '09:00', required: true, help: '24-hour HH:MM' },
      { key: 'endTime', label: 'End time', type: 'text', placeholder: '13:00', required: true, help: '24-hour HH:MM' },
      { key: 'slotMinutes', label: 'Approx. time per patient (minutes)', type: 'number', required: true },
      { key: 'status', label: 'Active', type: 'status', options: STATUS_OPTIONS },
    ],
  },
]

export function MyScheduleTab() {
  const { currentUser } = useAuth()
  const { data: doctors, loading: loadingDoctors } = useCollection(loadDoctors)
  const { data: schedules, loading: loadingSchedules, setData: setSchedules } = useCollection(loadDoctorSchedules)
  const [values, setValues] = useState<FormValues>({})
  const [saved, setSaved] = useState(false)

  const myDoctor = doctors.find((d) => d.id === currentUser?.doctorId) ?? null
  const mySchedule = myDoctor ? schedules.find((s) => s.doctorName === myDoctor.name) ?? null : null

  useEffect(() => {
    if (mySchedule) setValues({ ...mySchedule })
    else if (myDoctor) setValues({ daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], slotMinutes: 15, status: 'Active' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mySchedule?.id, myDoctor?.id])

  if (loadingDoctors || loadingSchedules) return null

  if (!myDoctor) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Your login isn't linked to a doctor profile"
        message="Ask an Administrator to link your user account to a Doctor Registry entry from the Registry tab's Login column."
      />
    )
  }

  async function handleSave() {
    const base = {
      ...(mySchedule ?? {}), ...values, doctorName: myDoctor!.name, department: myDoctor!.department,
    } as DoctorSchedule
    const record = withAudit(
      { ...base, id: mySchedule?.id ?? makeId('sch') },
      currentUser?.name ?? 'system',
      mySchedule ?? undefined,
    ) as DoctorSchedule
    if (mySchedule) {
      await updateDoctorSchedule(record)
      setSchedules((rows) => rows.map((r) => (r.id === record.id ? record : r)))
    } else {
      await saveDoctorSchedule(record)
      setSchedules((rows) => [record, ...rows])
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <div>
        <h2 className="flex items-center gap-2 text-sm font-semibold text-text">
          <CalendarClock size={16} className="text-primary" /> My Schedule — {myDoctor.name}
        </h2>
        <p className="text-xs text-muted">
          Set your consulting days, hours, and approximate time per patient. This drives auto-assigned
          appointment slots and tokens across the OPD Queue and Appointments.
        </p>
      </div>
      <SchemaForm sections={sections} values={values} onChange={(k, v) => setValues((s) => ({ ...s, [k]: v }))} />
      <div className="flex items-center gap-2">
        <button className="btn-primary" onClick={handleSave}>Save Schedule</button>
        {saved && <span className="text-xs text-success">Saved.</span>}
      </div>
    </div>
  )
}
