# Insurance — User Guide

**Where:** Sidebar → Insurance → Insurance (`/insurance`)
**Who can see it:** `insurance:view`. Adding/editing anything needs `insurance:create` /
`insurance:edit` (Insurance Desk and Administrator have both).

Three tabs: **Pre-auth & Claims**, **Patient Policies**, **Insurers & TPAs**.

## Insurers & TPAs — the master list

Register each insurance company or third-party administrator you deal with: name, whether it's
an `Insurer` or a `TPA`, and a contact person/phone/email. Set these up first — policies and
claims both reference this list.

## Patient Policies — linking a patient to their cover

Click **Add Policy** and record the patient, insurer/TPA, policy number, sum insured, and expiry
date (**Valid till**). Policies within 30 days of expiry (or already expired) are flagged in the
list so you can catch lapses before a claim is needed.

## Pre-auth & Claims — the cashless workflow

Click **New Claim** and pick the patient, their policy, and — if one exists — the Billing invoice
it relates to. The **Status** field tracks the claim through its lifecycle:

```
Pre-auth Requested → Pre-auth Approved → Claim Submitted → Settled
                   ↘ Pre-auth Rejected                   ↘ Repudiated
```

Update the status as the insurer/TPA responds, filling in **Approved amount** once pre-auth
clears and **Settled amount** once payment is finalized. Use **Remarks** for anything the insurer
communicates (e.g. partial approval conditions).

## Tips

- Raise the claim as soon as pre-authorization is requested, not after — that way its status is
  visible to Front Desk and Billing while the patient is still admitted.
- The Dashboard's "Pending insurance claims" KPI counts everything not yet `Settled` or
  `Repudiated` — use it as your daily follow-up list.
