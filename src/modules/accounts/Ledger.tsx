import { useState } from 'react'
import { ScrollText } from 'lucide-react'
import { useCollection } from '@/lib/useCollection'
import { loadAccounts, loadJournalEntries } from '@/lib/repository'
import { formatCurrency, formatDate } from '@/lib/format'
import { EmptyState } from '@/components/ui/EmptyState'

export function LedgerTab() {
  const { data: accounts, loading: loadingAccounts } = useCollection(loadAccounts)
  const { data: entries, loading: loadingEntries } = useCollection(loadJournalEntries)
  const [accountId, setAccountId] = useState('')

  const account = accounts.find((a) => a.id === accountId)
  const loading = loadingAccounts || loadingEntries

  const movements = entries
    .filter((e) => e.lines.some((l) => l.accountId === accountId))
    .sort((a, b) => a.date.localeCompare(b.date))
    .flatMap((e) => e.lines.filter((l) => l.accountId === accountId).map((l) => ({ entry: e, line: l })))

  let running = account?.openingBalance ?? 0
  const rows = movements.map(({ entry, line }) => {
    running += line.debit - line.credit
    return { entry, line, balance: running }
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="card p-4">
        <label className="label">Select account</label>
        <select className="select max-w-md" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
          <option value="">Choose an account…</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
          ))}
        </select>
      </div>

      {!accountId ? (
        <EmptyState icon={ScrollText} title="Pick an account to view its ledger" message="Every posted journal line — manual, billing, or pharmacy — appears here with a running balance." />
      ) : loading ? null : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-2">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-muted">Date</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-muted">Entry #</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-muted">Narration</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-muted">Debit</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-muted">Credit</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-muted">Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border bg-surface-2/50">
                <td colSpan={5} className="px-3 py-2 text-sm font-medium text-text">Opening balance</td>
                <td className="px-3 py-2 text-right text-sm font-medium tabular-nums text-text">{formatCurrency(account?.openingBalance ?? 0)}</td>
              </tr>
              {rows.map(({ entry, line, balance }, idx) => (
                <tr key={`${entry.id}-${idx}`} className="border-t border-border">
                  <td className="px-3 py-2 text-text">{formatDate(entry.date)}</td>
                  <td className="px-3 py-2 text-text">{entry.entryNumber}</td>
                  <td className="px-3 py-2 text-text">{entry.narration}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-text">{line.debit ? formatCurrency(line.debit) : '—'}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-text">{line.credit ? formatCurrency(line.credit) : '—'}</td>
                  <td className="px-3 py-2 text-right tabular-nums font-medium text-text">{formatCurrency(balance)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={6} className="px-3 py-6 text-center text-sm text-muted">No movements posted to this account yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
