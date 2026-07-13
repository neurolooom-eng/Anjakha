# GST Filing — User Guide

**Where:** Sidebar → Finance → GST Filing (`/gst`)
**Who can see it:** `gst:view`. Generating returns and adding tax mappings needs `gst:create`
(Accountant and Administrator have it).

Two tabs: **GST Returns** and **Tax / HSN Config**. There is no separate edit permission for
this module — anyone with `gst:create` can both generate returns and manage the tax config.

## Tax / HSN Config — rates used across Pharmacy and Billing

A lookup table of HSN/SAC codes, their description, category (Goods/Service), and GST rate. This
is reference data for billing consistently — it doesn't drive tax calculation automatically on
invoices or pharmacy items (those set GST% per line item directly), but keeping it current gives
your team one place to look up the right code and rate.

## GST Returns — GSTR-1 / GSTR-3B summaries

1. Click **Generate Return**.
2. Choose the return type (`GSTR-1` or `GSTR-3B`) and type in the period (e.g. `July 2026`).
3. The **Preview** panel shows the document count, taxable value, CGST, SGST, and total tax the
   app will pull together for that period, computed from every Billing invoice and Pharmacy sale
   dated in that month.
4. Click **Generate** to save it to the list.

Click **JSON** on any row in the list to export that return for your CA or GST filing tool.

> **This does not file anything with the government.** It produces a compliant summary you (or
> your CA) use to file GSTR-1/3B on the GSTN portal — there's no live GSTN integration here.

## Tips

- Generate returns *after* the month is closed out (all that month's invoices and pharmacy sales
  entered) so the preview reflects the complete period.
- The period field is free text matched against each record's date — use the same format
  consistently (e.g. always "July 2026", not "Jul-26") so everything for a month groups together.
