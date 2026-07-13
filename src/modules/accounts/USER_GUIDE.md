# Books & Ledgers — User Guide

**Where:** Sidebar → Finance → Books & Ledgers (`/accounts`)
**Who can see it:** `accounts:view`. Posting journal entries needs `accounts:create`; editing the
chart of accounts needs `accounts:edit` (Accountant and Administrator have both).

Four tabs: **Chart of Accounts**, **Journal Entries**, **General Ledger**, **Reports**.

## Chart of Accounts — the account structure

Every account used anywhere in the app (Cash, Patient Receivables, Pharmacy Inventory, GST
Payable, OPD Income, Staff Salaries, …) lives here, each with a code, a type (Asset / Liability /
Equity / Income / Expense), and an opening balance. Click **New Account** to add one — do this
before referencing it in a journal entry.

## Journal Entries — where every transaction lands

Most entries here appear automatically:

- **Billing** invoices post here the moment they're saved (source: `Billing`).
- **Pharmacy** purchases (GRN) and sales post here automatically too (sources: `Pharmacy
  Purchase` / `Pharmacy Sale`).

For anything else — a manual adjustment, a salary run, a write-off — click **New Entry**:

1. Enter the date and a narration describing the transaction.
2. Add each line: account, debit amount, credit amount.
3. Total debits must equal total credits before you can save — the running totals are shown live
   under the line table.

## General Ledger — one account's full history

Pick an account from the dropdown to see every line ever posted to it — manual and automatic —
in date order with a running balance, starting from its opening balance.

## Reports — Trial Balance, P&L, Balance Sheet

Auto-computed from the Chart of Accounts and every posted Journal Entry — nothing to generate or
refresh by hand:

- **Trial Balance** — total debit vs. credit balances across all accounts (should match).
- **Profit & Loss** — total income, total expense, and net profit for the current data.
- **Balance Sheet** — total assets vs. total liabilities + equity (including retained profit).

A bar chart at the top visualizes income vs. expense vs. net profit, and a full account-by-account
balance table sits below the report cards.

## Tips

- You almost never need to post a manual Billing or Pharmacy entry — if you find yourself doing
  that, check whether the invoice/purchase/sale itself was saved correctly instead.
- If Trial Balance debit and credit totals don't match, the culprit is usually an unbalanced
  manual journal entry — the app won't let you save one that doesn't balance, so check for
  entries that predate that safeguard or were edited outside the app (e.g. directly in the Sheet).
