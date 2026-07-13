import { useMemo, useState } from 'react'
import { Phone, Search, UserPlus } from 'lucide-react'
import { Drawer } from '@/components/ui/Drawer'
import { AppointmentTimeField } from './AppointmentTimeField'
import { GENDER_OPTIONS } from './Registry'
import { DEPARTMENTS } from './Appointments'
import { savePatient, saveAppointment, withAudit } from '@/lib/repository'
import { useAuth } from '@/context/AuthContext'
import { makeId } from '@/lib/id'
import { nextTokenNo } from '@/lib/scheduling'
import { todayISO } from '@/lib/format'
import type { Appointment, Doctor, DoctorSchedule, Patient } from '@/types'

function digitsOf(s: string) {
  return s.replace(/\D/g, '')
}

export function NewOpdVisitDrawer({
  open,
  onClose,
  patients,
  appointments,
  schedules,
  doctors,
  onPatientCreated,
  onAppointmentCreated,
}: {
  open: boolean
  onClose: () => void
  patients: Patient[]
  appointments: Appointment[]
  schedules: DoctorSchedule[]
  doctors: Doctor[]
  onPatientCreated: (p: Patient) => void
  onAppointmentCreated: (a: Appointment, patient: Patient) => void
}) {
  const { currentUser } = useAuth()
  const [phone, setPhone] = useState('')
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [registerNew, setRegisterNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newAge, setNewAge] = useState('')
  const [newGender, setNewGender] = useState('')
  const [doctorName, setDoctorName] = useState('')
  const [department, setDepartment] = useState('')
  const [date, setDate] = useState(todayISO())
  const [time, setTime] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const phoneDigits = digitsOf(phone)
  const matches = useMemo(() => {
    if (phoneDigits.length < 4) return []
    return patients.filter((p) => digitsOf(p.phone).includes(phoneDigits))
  }, [patients, phoneDigits])

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) ?? null
  const canRegisterMinimal = newName.trim().length > 0 && newAge.trim().length > 0 && newGender.length > 0
  const patientReady = selectedPatient !== null || (registerNew && canRegisterMinimal)

  function reset() {
    setPhone(''); setSelectedPatientId(null); setRegisterNew(false)
    setNewName(''); setNewAge(''); setNewGender('')
    setDoctorName(''); setDepartment(''); setDate(todayISO()); setTime('')
    setError(''); setSaving(false)
  }

  function handleClose() {
    reset()
    onClose()
  }

  function selectPatient(p: Patient) {
    setSelectedPatientId(p.id)
    setRegisterNew(false)
  }

  function startRegisterNew() {
    setSelectedPatientId(null)
    setRegisterNew(true)
  }

  async function handleBook() {
    setError('')
    if (!patientReady) {
      setError('Select a matching patient or fill in the minimal registration details.')
      return
    }
    if (!doctorName || !department || !date || !time) {
      setError('Doctor, department, date, and a consultation time are all required.')
      return
    }

    setSaving(true)
    try {
      let patient = selectedPatient
      if (!patient) {
        const age = Number(newAge)
        const approxDob = `${new Date().getFullYear() - (Number.isFinite(age) ? age : 0)}-01-01`
        const draft: Patient = withAudit(
          {
            id: makeId('pat'),
            uhid: `ANJ-${new Date().getFullYear()}-${String(patients.length + 1).padStart(4, '0')}`,
            name: newName.trim(),
            gender: newGender as Patient['gender'],
            dob: approxDob,
            phone,
            address: '',
            category: 'General',
            status: 'Active',
          },
          currentUser?.name ?? 'system',
        ) as Patient
        await savePatient(draft)
        onPatientCreated(draft)
        patient = draft
      }

      const tokenNo = nextTokenNo(doctorName, date, appointments)
      const appointment: Appointment = withAudit(
        {
          id: makeId('apt'),
          patientId: patient.id,
          patientName: patient.name,
          doctorName,
          department,
          date,
          time,
          type: selectedPatient ? 'Follow-up' : 'New',
          status: 'Checked In',
          tokenNo,
        },
        currentUser?.name ?? 'system',
      ) as Appointment
      await saveAppointment(appointment)
      onAppointmentCreated(appointment, patient)
      handleClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title="New OPD Visit"
      subtitle="Look up by phone, register on the spot if needed, and book the visit — all in one step."
      footer={
        <>
          <button className="btn-outline" onClick={handleClose}>Cancel</button>
          <button className="btn-primary" disabled={saving} onClick={handleBook}>
            {saving ? 'Booking…' : 'Book Visit'}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="card p-4">
          <label className="label">
            Patient phone number <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <Phone size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              className="input pl-8"
              placeholder="Enter 10-digit phone number"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value)
                setSelectedPatientId(null)
                setRegisterNew(false)
              }}
            />
          </div>

          {phoneDigits.length >= 4 && (
            <div className="mt-3">
              {matches.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  <p className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-muted">
                    <Search size={11} /> {matches.length} match{matches.length === 1 ? '' : 'es'} found
                  </p>
                  {matches.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => selectPatient(p)}
                      className={`flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                        selectedPatientId === p.id ? 'border-primary bg-primary/10' : 'border-border hover:bg-surface-2'
                      }`}
                    >
                      <span>
                        <span className="font-medium text-text">{p.name}</span>{' '}
                        <span className="text-muted">· {p.uhid} · {p.gender}</span>
                      </span>
                      <span className="text-xs text-muted">{p.phone}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted">No patient registered with this number yet.</p>
              )}

              {!registerNew && (
                <button type="button" className="btn-outline mt-2" onClick={startRegisterNew}>
                  <UserPlus size={14} /> Register new patient with this number
                </button>
              )}
            </div>
          )}

          {selectedPatient && (
            <p className="mt-2 text-xs text-success">
              Selected: {selectedPatient.name} ({selectedPatient.uhid})
            </p>
          )}
        </div>

        {registerNew && (
          <div className="card p-4">
            <h3 className="mb-2 text-sm font-semibold text-text">Quick registration</h3>
            <p className="mb-3 text-[11px] text-muted">
              Bare-minimum details to get the patient into the queue — the full profile (address, blood group,
              allergies, etc.) can be filled in later from Patient Registry.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-3">
                <label className="label">
                  Full name <span className="text-danger">*</span>
                </label>
                <input className="input" value={newName} onChange={(e) => setNewName(e.target.value)} />
              </div>
              <div>
                <label className="label">
                  Age <span className="text-danger">*</span>
                </label>
                <input className="input" type="number" min={0} value={newAge} onChange={(e) => setNewAge(e.target.value)} />
              </div>
              <div>
                <label className="label">
                  Sex <span className="text-danger">*</span>
                </label>
                <select className="select" value={newGender} onChange={(e) => setNewGender(e.target.value)}>
                  <option value="">Select…</option>
                  {GENDER_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" value={phone} disabled />
              </div>
            </div>
          </div>
        )}

        {patientReady && (
          <div className="card p-4">
            <h3 className="mb-3 text-sm font-semibold text-text">Visit details</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label">
                  Doctor <span className="text-danger">*</span>
                </label>
                <select className="select" value={doctorName} onChange={(e) => { setDoctorName(e.target.value); setTime('') }}>
                  <option value="">Select doctor…</option>
                  {doctors.filter((d) => d.status === 'Active').map((d) => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">
                  Department <span className="text-danger">*</span>
                </label>
                <select className="select" value={department} onChange={(e) => setDepartment(e.target.value)}>
                  <option value="">Select department…</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">
                  Date <span className="text-danger">*</span>
                </label>
                <input className="input" type="date" value={date} onChange={(e) => { setDate(e.target.value); setTime('') }} />
              </div>
              <AppointmentTimeField
                doctorName={doctorName}
                date={date}
                time={time}
                onTimeChange={setTime}
                schedules={schedules}
                appointments={appointments}
              />
            </div>
            {doctorName && date && (
              <p className="mt-3 text-xs text-muted">
                Will be booked as <span className="font-semibold text-text">Token #{nextTokenNo(doctorName, date, appointments)}</span> for {doctorName}, status <span className="font-medium text-text">Checked In</span>.
              </p>
            )}
          </div>
        )}

        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    </Drawer>
  )
}
