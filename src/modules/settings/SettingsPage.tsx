import { useEffect, useState } from 'react'
import { HeartPulse, RefreshCw, Settings as SettingsIcon } from 'lucide-react'
import { loadCompanyProfile } from '@/lib/repository'
import type { CompanyProfile } from '@/types'

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
        <p className="text-sm text-muted">Branding, company profile, and build information.</p>
      </div>

      <div className="card flex items-center gap-4 p-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-fg">
          <HeartPulse size={28} />
        </div>
        <div>
          <p className="text-base font-semibold text-text">{profile?.displayName ?? 'Anjakha Hospital'}</p>
          <p className="text-sm text-muted">{profile?.legalName}</p>
        </div>
      </div>

      <div className="card p-4">
        <h2 className="mb-3 text-sm font-semibold text-text">Company profile</h2>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="GSTIN" value={profile?.gstin} />
          <Field label="Phone" value={profile?.phone} />
          <Field label="Email" value={profile?.email} />
          <Field label="Accreditation" value={profile?.accreditation} />
          <div className="sm:col-span-2">
            <Field label="Registered address" value={profile?.hqAddress} />
          </div>
        </dl>
      </div>

      <div className="card p-4">
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
