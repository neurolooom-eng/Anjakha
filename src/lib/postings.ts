/**
 * Cross-module ledger postings — keeps Books & Ledgers in sync automatically
 * whenever Billing or Pharmacy create a money-moving record, instead of
 * requiring a manual journal entry for every transaction.
 */
import { makeId } from './id'
import { nowISO } from './format'
import { saveJournalEntry } from './repository'
import type { Invoice, JournalEntry, PharmacyPurchase, PharmacySale } from '@/types'

const ACCOUNTS = {
  cash: { id: 'acc_1', name: 'Cash in Hand' },
  receivable: { id: 'acc_3', name: 'Patient Receivables' },
  inventory: { id: 'acc_5', name: 'Pharmacy Inventory' },
  payables: { id: 'acc_6', name: 'Trade Payables — Suppliers' },
  gstPayable: { id: 'acc_7', name: 'GST Output Payable' },
  opdIncome: { id: 'acc_9', name: 'OPD Consultation Income' },
  ipdIncome: { id: 'acc_10', name: 'IPD Room & Treatment Income' },
  pharmacyIncome: { id: 'acc_11', name: 'Pharmacy Sales Income' },
}

function entryNumber() {
  return `JE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
}

export async function postInvoiceToLedger(invoice: Invoice, user: string): Promise<JournalEntry> {
  const tax = invoice.cgst + invoice.sgst + invoice.igst
  const incomeAccount =
    invoice.category === 'OPD' ? ACCOUNTS.opdIncome
      : invoice.category === 'IPD' ? ACCOUNTS.ipdIncome
        : ACCOUNTS.pharmacyIncome
  const paid = invoice.amountPaid > 0
  const entry: JournalEntry = {
    id: makeId('je'),
    entryNumber: entryNumber(),
    date: invoice.date,
    narration: `${invoice.category} invoice ${invoice.invoiceNumber} — ${invoice.patientName}`,
    source: 'Billing',
    sourceRefId: invoice.id,
    status: 'Posted',
    lines: [
      {
        accountId: paid ? ACCOUNTS.cash.id : ACCOUNTS.receivable.id,
        accountName: paid ? ACCOUNTS.cash.name : ACCOUNTS.receivable.name,
        debit: invoice.amountPaid || invoice.total,
        credit: 0,
      },
      { accountId: incomeAccount.id, accountName: incomeAccount.name, debit: 0, credit: invoice.subtotal },
      ...(tax > 0 ? [{ accountId: ACCOUNTS.gstPayable.id, accountName: ACCOUNTS.gstPayable.name, debit: 0, credit: tax }] : []),
    ],
    createdAt: nowISO(), createdBy: user, updatedAt: nowISO(), updatedBy: user,
  }
  await saveJournalEntry(entry)
  return entry
}

export async function postPharmacySaleToLedger(sale: PharmacySale, user: string): Promise<JournalEntry> {
  const taxable = sale.items.reduce((sum, i) => sum + i.quantity * i.rate, 0)
  const tax = sale.totalAmount - taxable
  const entry: JournalEntry = {
    id: makeId('je'),
    entryNumber: entryNumber(),
    date: sale.date,
    narration: `Pharmacy sale ${sale.invoiceNumber} — ${sale.patientName}`,
    source: 'Pharmacy Sale',
    sourceRefId: sale.id,
    status: 'Posted',
    lines: [
      { accountId: ACCOUNTS.cash.id, accountName: ACCOUNTS.cash.name, debit: sale.totalAmount, credit: 0 },
      { accountId: ACCOUNTS.pharmacyIncome.id, accountName: ACCOUNTS.pharmacyIncome.name, debit: 0, credit: taxable },
      ...(tax > 0 ? [{ accountId: ACCOUNTS.gstPayable.id, accountName: ACCOUNTS.gstPayable.name, debit: 0, credit: tax }] : []),
    ],
    createdAt: nowISO(), createdBy: user, updatedAt: nowISO(), updatedBy: user,
  }
  await saveJournalEntry(entry)
  return entry
}

export async function postPharmacyPurchaseToLedger(purchase: PharmacyPurchase, user: string): Promise<JournalEntry> {
  const taxable = purchase.items.reduce((sum, i) => sum + i.quantity * i.rate, 0)
  const tax = purchase.totalAmount - taxable
  const entry: JournalEntry = {
    id: makeId('je'),
    entryNumber: entryNumber(),
    date: purchase.date,
    narration: `${purchase.grnNumber} — ${purchase.supplierName} purchase`,
    source: 'Pharmacy Purchase',
    sourceRefId: purchase.id,
    status: 'Posted',
    lines: [
      { accountId: ACCOUNTS.inventory.id, accountName: ACCOUNTS.inventory.name, debit: taxable, credit: 0 },
      ...(tax > 0 ? [{ accountId: ACCOUNTS.gstPayable.id, accountName: ACCOUNTS.gstPayable.name, debit: tax, credit: 0 }] : []),
      { accountId: ACCOUNTS.payables.id, accountName: ACCOUNTS.payables.name, debit: 0, credit: purchase.totalAmount },
    ],
    createdAt: nowISO(), createdBy: user, updatedAt: nowISO(), updatedBy: user,
  }
  await saveJournalEntry(entry)
  return entry
}
