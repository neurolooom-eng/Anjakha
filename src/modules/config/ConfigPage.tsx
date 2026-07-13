import { useState } from 'react'
import { CheckCircle2, Wrench, XCircle } from 'lucide-react'
import {
  DEFAULT_TABS, getSheetsApiUrl, getSpreadsheetId, getTabName, setSheetsApiUrl, setSpreadsheetId, setTabName,
} from '@/lib/config'
import { testConnection } from '@/lib/sheetsClient'

type TestResult = { ok: boolean; message: string } | null

export function ConfigPage() {
  const [apiUrl, setApiUrl] = useState(getSheetsApiUrl())
  const [spreadsheetId, setSpreadsheetIdState] = useState(getSpreadsheetId())
  const [tabs, setTabs] = useState<Record<string, string>>(
    Object.fromEntries(Object.keys(DEFAULT_TABS).map((k) => [k, getTabName(k)])),
  )
  const [results, setResults] = useState<Record<string, TestResult>>({})
  const [testing, setTesting] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  function saveAll() {
    setSheetsApiUrl(apiUrl.trim())
    setSpreadsheetId(spreadsheetId.trim())
    for (const [entity, tab] of Object.entries(tabs)) setTabName(entity, tab)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function runTest(entity: string) {
    setSheetsApiUrl(apiUrl.trim())
    setSpreadsheetId(spreadsheetId.trim())
    setTabName(entity, tabs[entity])
    setTesting(entity)
    const result = await testConnection(tabs[entity])
    setResults((r) => ({ ...r, [entity]: result }))
    setTesting(null)
  }

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <div>
        <h1 className="flex items-center gap-2 text-lg font-semibold text-text">
          <Wrench size={18} className="text-primary" /> Developer Config
        </h1>
        <p className="text-sm text-muted">
          Per-browser overrides for the Google Sheets backend. Leave the Exec URL blank to run entirely on bundled
          mock data. See <code>apps-script/SHEETS_SCHEMA.md</code> for the expected tab schema.
        </p>
      </div>

      <div className="card p-4">
        <h2 className="mb-3 text-sm font-semibold text-text">Connection</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className="label">Apps Script Exec URL</label>
            <input
              className="input"
              placeholder="https://script.google.com/macros/s/…/exec"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
            />
            <p className="mt-0.5 text-[11px] text-muted">Overrides VITE_SHEETS_API_URL for this browser only.</p>
          </div>
          <div>
            <label className="label">Spreadsheet ID (optional)</label>
            <input
              className="input"
              placeholder="Only needed if the script serves multiple sheets"
              value={spreadsheetId}
              onChange={(e) => setSpreadsheetIdState(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card p-4">
        <h2 className="mb-3 text-sm font-semibold text-text">Sheet tabs</h2>
        <div className="flex flex-col divide-y divide-border">
          {Object.keys(DEFAULT_TABS).map((entity) => {
            const result = results[entity]
            return (
              <div key={entity} className="flex flex-wrap items-center gap-2 py-2">
                <span className="w-40 shrink-0 text-xs font-medium text-muted">{entity}</span>
                <input
                  className="input max-w-[220px]"
                  value={tabs[entity]}
                  onChange={(e) => setTabs((t) => ({ ...t, [entity]: e.target.value }))}
                />
                <button className="btn-outline" disabled={testing === entity} onClick={() => runTest(entity)}>
                  {testing === entity ? 'Testing…' : 'Test Connection'}
                </button>
                {result && (
                  <span className={`flex items-center gap-1 text-xs ${result.ok ? 'text-success' : 'text-danger'}`}>
                    {result.ok ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                    {result.message}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="btn-primary" onClick={saveAll}>Save Config</button>
        {saved && <span className="text-xs text-success">Saved.</span>}
      </div>
    </div>
  )
}
