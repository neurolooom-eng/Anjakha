# Billing — User Guide

**Where:** Sidebar → Finance → Billing (`/billing`)
**Who can see it:** `billing:view`. Raising invoices/payments needs `billing:create` /
`billing:edit` (Front Desk and Accountant have create; Administrator has full edit).

Two tabs: **Invoices** and **Payments**.

## Invoices — billing a patient

1. Click **New Invoice**.
2. Pick the patient and category (**OPD**, **IPD**, or **Pharmacy**).
3. Add each line item: description, HSN/SAC code, quantity, rate, and GST%. Subtotal, CGST, and
   SGST are calculated for you as you type, and shown live at the bottom of the line-item table.
4. If the patient is paying something now, enter it in **Amount paid now** — the invoice status
   updates itself (`Unpaid` → `Partially Paid` → `Paid`) based on what's been paid against the
   total.
5. Save.

Saving a new invoice automatically posts it to the Ledger (cash or receivable debited, income
credited, GST payable credited) — nothing further to do in Books & Ledgers.

## Payments — collecting against an outstanding invoice

1. Click **Record Payment**.
2. Pick the invoice (only invoices that aren't fully paid appear in the list, with the
   outstanding amount shown alongside each one), enter the amount and payment mode (Cash, Card,
   UPI, Net Banking, Cheque, or Insurance), and an optional reference number.
3. Save.

The linked invoice's **Amount Paid** and **Status** update automatically. Payments are a
transaction log — once recorded, a payment entry itself isn't edited; if a payment was entered in
error, record a note for your Accountant to make a correcting journal entry in Books & Ledgers.

## Tips

- HSN/SAC codes and GST rates you use repeatedly are worth adding once to GST Filing → Tax / HSN
  Configuration, so everyone bills consistently.
- An invoice's **Insurance Claim** link (if any) is set from the Insurance module when a claim is
  raised against it — you don't need to do anything extra here for insured patients beyond
  raising the invoice normally.
