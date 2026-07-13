import type { Account, JournalEntry } from '@/types'
import { seedAudit } from './audit'

export const mockAccounts: Account[] = [
  { id: 'acc_1', code: '1001', name: 'Cash in Hand', type: 'Asset', openingBalance: 250000, status: 'Active', ...seedAudit(365) },
  { id: 'acc_2', code: '1002', name: 'Bank — HDFC Current A/c', type: 'Asset', openingBalance: 1800000, status: 'Active', ...seedAudit(365) },
  { id: 'acc_3', code: '1101', name: 'Patient Receivables', type: 'Asset', openingBalance: 320000, status: 'Active', ...seedAudit(365) },
  { id: 'acc_4', code: '1102', name: 'Insurance Claims Receivable', type: 'Asset', openingBalance: 540000, status: 'Active', ...seedAudit(365) },
  { id: 'acc_5', code: '1201', name: 'Pharmacy Inventory', type: 'Asset', openingBalance: 610000, status: 'Active', ...seedAudit(365) },
  { id: 'acc_6', code: '2001', name: 'Trade Payables — Suppliers', type: 'Liability', openingBalance: 275000, status: 'Active', ...seedAudit(365) },
  { id: 'acc_7', code: '2101', name: 'GST Output Payable', type: 'Liability', openingBalance: 42000, status: 'Active', ...seedAudit(365) },
  { id: 'acc_8', code: '3001', name: "Owner's Equity", type: 'Equity', openingBalance: 2000000, status: 'Active', ...seedAudit(365) },
  { id: 'acc_9', code: '4001', name: 'OPD Consultation Income', type: 'Income', openingBalance: 0, status: 'Active', ...seedAudit(365) },
  { id: 'acc_10', code: '4002', name: 'IPD Room & Treatment Income', type: 'Income', openingBalance: 0, status: 'Active', ...seedAudit(365) },
  { id: 'acc_11', code: '4003', name: 'Pharmacy Sales Income', type: 'Income', openingBalance: 0, status: 'Active', ...seedAudit(365) },
  { id: 'acc_12', code: '5001', name: 'Pharmacy Purchases (COGS)', type: 'Expense', openingBalance: 0, status: 'Active', ...seedAudit(365) },
  { id: 'acc_13', code: '5101', name: 'Staff Salaries', type: 'Expense', openingBalance: 0, status: 'Active', ...seedAudit(365) },
  { id: 'acc_14', code: '5102', name: 'Utilities & Maintenance', type: 'Expense', openingBalance: 0, status: 'Active', ...seedAudit(365) },
]

export const mockJournalEntries: JournalEntry[] = [
  {
    id: 'je_1', entryNumber: 'JE-2026-0501', date: '2026-07-13', narration: 'OPD invoice INV-2026-3001 — Ramesh Kulkarni',
    source: 'Billing', sourceRefId: 'inv_1', status: 'Posted',
    lines: [
      { accountId: 'acc_1', accountName: 'Cash in Hand', debit: 1475, credit: 0 },
      { accountId: 'acc_9', accountName: 'OPD Consultation Income', debit: 0, credit: 1250 },
      { accountId: 'acc_7', accountName: 'GST Output Payable', debit: 0, credit: 225 },
    ],
    ...seedAudit(0),
  },
  {
    id: 'je_2', entryNumber: 'JE-2026-0502', date: '2026-07-13', narration: 'Pharmacy sale PH-2026-1001 — Fatima Ansari',
    source: 'Pharmacy Sale', sourceRefId: 'sal_1', status: 'Posted',
    lines: [
      { accountId: 'acc_1', accountName: 'Cash in Hand', debit: 118.16, credit: 0 },
      { accountId: 'acc_11', accountName: 'Pharmacy Sales Income', debit: 0, credit: 105.5 },
      { accountId: 'acc_7', accountName: 'GST Output Payable', debit: 0, credit: 12.66 },
    ],
    ...seedAudit(0),
  },
  {
    id: 'je_3', entryNumber: 'JE-2026-0498', date: '2026-07-11', narration: 'GRN-2026-0042 — Sunrise Pharma purchase',
    source: 'Pharmacy Purchase', sourceRefId: 'grn_2', status: 'Posted',
    lines: [
      { accountId: 'acc_5', accountName: 'Pharmacy Inventory', debit: 1020, credit: 0 },
      { accountId: 'acc_7', accountName: 'GST Output Payable', debit: 122.4, credit: 0 },
      { accountId: 'acc_6', accountName: 'Trade Payables — Suppliers', debit: 0, credit: 1142.4 },
    ],
    ...seedAudit(2),
  },
  {
    id: 'je_4', entryNumber: 'JE-2026-0490', date: '2026-07-05', narration: 'Staff salary disbursement — June 2026',
    source: 'Manual', status: 'Posted',
    lines: [
      { accountId: 'acc_13', accountName: 'Staff Salaries', debit: 480000, credit: 0 },
      { accountId: 'acc_2', accountName: 'Bank — HDFC Current A/c', debit: 0, credit: 480000 },
    ],
    ...seedAudit(8),
  },
]
