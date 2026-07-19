import { useEffect, useState } from 'react'
import { Globe, HeartPulse, MapPin, Palette, Phone, RefreshCw, Settings as SettingsIcon, Stethoscope } from 'lucide-react'
import { loadCompanyProfile } from '@/lib/repository'
import type { CompanyProfile } from '@/types'

// Leadership, as published on the hospital's business profile.
const LEADERSHIP = [
  { name: 'Dr. Anusuya M', role: 'Chief Obstetrician & Gynaecologist · M.S. (General Surgery)', note: '30+ years in Obstetrics & Gynaecology; surgical care and infertility.' },
  { name: 'Dr. Kaushik J', role: 'Surgical Oncologist · MS (Gen. Surgery), DNB (Oncosurgery)', note: 'Young and active surgical oncology practice.' },
  { name: 'Dr. Deepika K.V.', role: 'Obstetrician & Gynaecologist · MS (O.G), DNB (OG)', note: 'Deliveries, caesarean, ultrasound, laparoscopy and infertility evaluation.' },
  { name: 'Adv. Jaganathan', role: 'Founder', note: 'Co-founded Anjakha Hospital in 2009.' },
]

async function hardRefresh() {
  if ('caches' in window) {
    const keys = await caches.keys()
    await Promise.all(keys.map((k) => caches.delete(k)))
  }
  window.location.reload()
}

export function SettingsPage() {
  const [profile, setProfile] = useState<CompanyProfile | null>(null)

  useEffect(() => {
    loadCompanyProfile().then(setProfile)
  }, [])

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <div>
        <h1 className="flex items-center gap-2 text-lg font-semibold text-text">
          <SettingsIcon size={18} className="text-primary" /> Settings
        </h1>
        <p className="text-sm text-muted">Branding, company profile, appearance, and build information.</p>
      </div>

      {/* Brand */}
      <div className="card overflow-hidden">
        <div className="flex items-center gap-4 bg-gradient-to-br from-primary/10 via-surface to-accent/10 p-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-fg shadow-sm">
            <HeartPulse size={30} />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold tracking-tight text-text">{profile?.displayName ?? 'Anjakha Hospital'}</p>
            {profile?.tagline && <p className="text-sm font-medium text-primary">{profile.tagline}</p>}
            <p className="text-xs text-muted">
              {profile?.establishedOn ? `Established ${profile.establishedOn}` : profile?.legalName}
              {profile?.accreditation ? ` · ${profile.accreditation}` : ''}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-y-3 border-t border-border p-5 sm:grid-cols-2">
          <IconField icon={MapPin} label="Address" value={profile?.hqAddress} full />
          <IconField icon={Phone} label="Phone" value={profile?.phone} />
          <IconField icon={Globe} label="Website" value={profile?.website} />
          <Field label="Email" value={profile?.email} />
          <Field label="GSTIN" value={profile?.gstin} />
        </div>
      </div>

      {/* Leadership */}
      <div className="card p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text">
          <Stethoscope size={16} className="text-primary" /> Leadership
        </h2>
        <div className="flex flex-col divide-y divide-border">
          {LEADERSHIP.map((d) => (
            <div key={d.name} className="flex flex-col gap-0.5 py-2.5 first:pt-0 last:pb-0">
              <p className="text-sm font-semibold text-text">{d.name}</p>
              <p className="text-xs font-medium text-primary">{d.role}</p>
              <p className="text-xs text-muted">{d.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Appearance */}
      <div className="card p-5">
        <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-text">
          <Palette size={16} className="text-primary" /> Appearance
        </h2>
        <p className="text-sm text-muted">
          <span className="font-medium text-text">Anjakha Premium</span> is the default theme. The previous look is
          preserved as <span className="font-medium text-text">Anjakha Classic</span> — switch anytime from the
          palette menu <Palette size={13} className="mx-0.5 inline align-text-bottom text-muted" /> in the top bar,
          which also offers light and dark variants.
        </p>
      </div>

      {/* Build */}
      <div className="card p-5">
        <h2 className="mb-3 text-sm font-semibold text-text">Build info</h2>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Build ID" value={__BUILD_ID__} />
          <Field label="Build date" value={new Date(__BUILD_DATE__).toLocaleString('en-IN')} />
        </dl>
        <button className="btn-outline mt-3" onClick={hardRefresh}>
          <RefreshCw size={14} /> Hard refresh
        </button>
        <p className="mt-1 text-[11px] text-muted">Clears cached assets — useful right after a redeploy if the browser is showing a stale build.</p>
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="text-sm text-text">{value || <span className="text-muted">—</span>}</p>
    </div>
  )
}

function IconField({
  icon: Icon,
  label,
  value,
  full,
}: {
  icon: typeof MapPin
  label: string
  value?: string
  full?: boolean
}) {
  return (
    <div className={`flex items-start gap-2.5 ${full ? 'sm:col-span-2' : ''}`}>
      <span className="mt-0.5 rounded-lg bg-primary/10 p-1.5 text-primary"><Icon size={14} /></span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted">{label}</p>
        <p className="text-sm text-text">{value || <span className="text-muted">—</span>}</p>
      </div>
    </div>
  )
}
