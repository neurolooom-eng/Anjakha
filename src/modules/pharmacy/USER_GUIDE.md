# Pharmacy — User Guide

**Where:** Sidebar → Pharmacy → Pharmacy (`/pharmacy`)
**Who can see it:** `pharmacy:view`. Adding/editing anything needs `pharmacy:create` /
`pharmacy:edit` (Pharmacist has both by default).

Four tabs: **Drug Master**, **Stock & Batches**, **Purchases (GRN)**, **Sales & Dispensing**.

## Drug Master — the formulary

Click **Add Drug** to register a new medicine: brand name, generic name, HSN code, category,
unit, MRP, GST rate, and **reorder level** (the quantity below which it counts as "low stock" on
the Dashboard and Stock & Batches tab). Set every drug up here before it can be purchased or
dispensed — Purchases and Sales both pick drugs from this list.

## Stock & Batches — live inventory

The KPI row shows batches in stock, low-stock drug count, batches expiring within 90 days, and
total inventory value. Batches within 90 days of expiry are flagged **amber**; expired or
≤ 30 days are flagged **red**, right in the Expiry column.

You can add a batch by hand (**Add Batch**) for opening stock, but in normal operation batches
are created automatically when you receive a Purchase (see below).

## Purchases (GRN) — receiving stock from a supplier

1. Click **New GRN**.
2. Enter the supplier, their GSTIN, and the date.
3. Add each item received: drug, batch number, expiry date, quantity, rate, and GST%.
4. Save with status `Received`.

This does three things at once: creates the stock batches, posts a purchase entry to the Ledger
(inventory debited, GST input, supplier payable credited), and shows up under Books & Ledgers →
Journal Entries with source `Pharmacy Purchase`.

## Sales & Dispensing — selling to a patient or dispensing a prescription

1. Click **New Sale**.
2. To dispense a prescription, pick it from **From prescription** — the patient and line items
   fill in automatically from what the doctor prescribed (you can still edit quantities/rates).
   For an over-the-counter sale, just pick the patient directly and add items by hand.
3. Save with status `Dispensed`.

This deducts the sold quantity from stock, posts a Ledger entry (`Pharmacy Sale` source), and —
if it came from a prescription — marks that prescription `Dispensed` automatically.

## Tips

- The low-stock banner on Stock & Batches lists every drug currently below its reorder level —
  use it as your reorder checklist.
- You don't need to manually enter anything in Books & Ledgers for routine purchases or sales;
  both post there automatically. Manual journal entries are only for things Pharmacy/Billing
  don't cover (e.g. writing off expired stock).
