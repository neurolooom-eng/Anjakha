import type { AuditFields, ID } from './common'

export type AccountType = 'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense'

export interface Account extends AuditFields {
  id: ID
  code: string
  name: string
  type: AccountType
  openingBalance: number
  status: 'Active' | 'Inactive'
}

export interface JournalLine {
  accountId: ID
  accountName: string
  debit: number
  credit: number
}

export type JournalSource = 'Manual' | 'Billing' | 'Pharmacy Purchase' | 'Pharmacy Sale'

export interface JournalEntry extends AuditFields {
  id: ID
  entryNumber: string
  date: string
  narration: string
  source: JournalSource
  sourceRefId?: ID
  lines: JournalLine[]
  status: 'Posted' | 'Draft'
}
