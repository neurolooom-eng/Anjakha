import { useMemo } from 'react'
import { FileBarChart } from 'lucide-react'
import { useCollection } from '@/lib/useCollection'
import { loadAccounts, loadJournalEntries } from '@/lib/repository'
import { formatCurrency } from '@/lib/format'
import { ChartCard, CHART_PALETTE } from '@/components/ui/ChartCard'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts'
import type { Account, JournalEntry } from '@/types'

function accountBalances(accounts: Account[], entries: JournalEntry[]) {
  return accounts.map((a) => {
    const movement = entries.reduce((sum, e) => {
      const lines = e.lines.filter((l) => l.accountId === a.id)
      return sum + lines.reduce((s, l) => s + l.debit - l.credit, 0)
    }, 0)
    return { account: a, balance: a.openingBalance + movement }
  })
}

export function ReportsTab() {
  const { data: accounts, loading: la } = useCollection(loadAccounts)
  const { data: entries, loading: le } = useCollection(loadJournalEntries)
  const loading = la || le

  const balances = useMemo(() => accountBalances(accounts, entries), [accounts, entries])

  const totalDebit = balances.reduce((s, b) => s + Math.max(b.balance, 0), 0)
  const totalCredit = balances.reduce((s, b) => s + Math.max(-b.balance, 0), 0)

  const income = balances.filter((b) => b.account.type === 'Income')
  const expense = balances.filter((b) => b.account.type === 'Expense')
  const totalIncome = income.reduce((s, b) => s + Math.abs(b.balance), 0)
  const totalExpense = expense.reduce((s, b) => s + Math.abs(b.balance), 0)
  const netProfit = totalIncome - totalExpense

  const assets = balances.filter((b) => b.account.type === 'Asset')
  const liabilities = balances.filter((b) => b.account.type === 'Liability')
  const equity = balances.filter((b) => b.account.type === 'Equity')
  const totalAssets = assets.reduce((s, b) => s + b.balance, 0)
  const totalLiabilities = liabilities.reduce((s, b) => s + Math.abs(b.balance), 0)
  const totalEquity = equity.reduce((s, b) => s + Math.abs(b.balance), 0) + netProfit

  const pnlChartData = [
    { name: 'Income', value: totalIncome },
    { name: 'Expense', value: totalExpense },
    { name: 'Net Profit', value: netProfit },
  ]

  if (loading) return null

  return (
    <div className="flex flex-col gap-4">
      <ChartCard title="Income vs. Expense">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={pnlChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--c-border))" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="rgb(var(--c-muted))" />
            <YAxis tick={{ fontSize: 11 }} stroke="rgb(var(--c-muted))" />
            <Tooltip formatter={(v: number) => formatCurrency(v)} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {pnlChartData.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ReportCard title="Trial Balance" icon={FileBarChart}>
          <ReportRow label="Total Debit balances" value={totalDebit} />
          <ReportRow label="Total Credit balances" value={totalCredit} bold />
        </ReportCard>

        <ReportCard title="Profit & Loss" icon={FileBarChart}>
          <ReportRow label="Total Income" value={totalIncome} />
          <ReportRow label="Total Expense" value={totalExpense} />
          <ReportRow label="Net Profit" value={netProfit} bold tone={netProfit >= 0 ? 'success' : 'danger'} />
        </ReportCard>

        <ReportCard title="Balance Sheet" icon={FileBarChart}>
          <ReportRow label="Total Assets" value={totalAssets} />
          <ReportRow label="Total Liabilities" value={totalLiabilities} />
          <ReportRow label="Total Equity (incl. retained profit)" value={totalEquity} bold />
        </ReportCard>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-2">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold text-muted">Code</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-muted">Account</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-muted">Type</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-muted">Balance</th>
            </tr>
          </thead>
          <tbody>
            {balances.map(({ account, balance }) => (
              <tr key={account.id} className="border-t border-border">
                <td className="px-3 py-2 text-text">{account.code}</td>
                <td className="px-3 py-2 text-text">{account.name}</td>
                <td className="px-3 py-2 text-muted">{account.type}</td>
                <td className="px-3 py-2 text-right tabular-nums text-text">{formatCurrency(balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ReportCard({ title, icon: Icon, children }: { title: string; icon: typeof FileBarChart; children: React.ReactNode }) {
  return (
    <div className="card p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text">
        <Icon size={15} className="text-primary" /> {title}
      </h3>
      <div className="flex flex-col gap-1.5">{children}</div>
    </div>
  )
}

function ReportRow({ label, value, bold, tone }: { label: string; value: number; bold?: boolean; tone?: 'success' | 'danger' }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted">{label}</span>
      <span
        className={`tabular-nums ${bold ? 'font-semibold' : ''} ${
          tone === 'success' ? 'text-success' : tone === 'danger' ? 'text-danger' : 'text-text'
        }`}
      >
        {formatCurrency(value)}
      </span>
    </div>
  )
}
