# Patients — User Guide

**Where:** Sidebar → Front Office → Patients (`/patients`)
**Who can see it:** `patients:view`. Registering/editing needs `patients:create` /
`patients:edit` (Front Desk and Administrator have both by default).

Three tabs: **Registry**, **Appointments**, **OPD Queue**.

## Registry — the master patient list

1. Click **Register Patient** (top right).
2. Fill in Identity (name, gender, DOB, blood group), Contact (phone, address, emergency
   contact), and Care (billing category, known allergies, status). The **UHID** is generated for
   you and is read-only.
3. Click **Save**.

To edit an existing patient, click their row (only if you have `patients:edit`). Use **Search**
to find a patient by name, UHID, or phone; use **Columns** to show/hide fields; **Export CSV** to
download the visible list.

> **Allergies matter clinically** — anything entered here is visible to clinical staff when they
> see the patient in the Clinical module, so keep it current.

## Appointments — scheduling OPD visits

1. Click **Schedule Appointment**.
2. Pick the patient, doctor, department, date, and time, and whether it's a **New** or
   **Follow-up** visit.
3. Save. The appointment starts as **Scheduled**.

Click an existing appointment to change its status by hand, or use the **OPD Queue** tab for the
normal day-of-visit workflow instead.

## OPD Queue — the front-desk view for today

Shows only *today's* appointments, in time order, with a one-click **Mark ⟶** button that walks
each visit through the standard flow:

```
Scheduled → Checked In → In Consultation → Completed
```

Cancelled and No-Show appointments don't appear here — manage those from the Appointments tab.

## Tips

- A patient's UHID (e.g. `ANJ-2026-0004`) is the identifier used everywhere else in the app —
  IPD admissions, Clinical consultations, Billing invoices — so register the patient here first.
- Front Desk staff typically live in the OPD Queue tab during clinic hours and only visit
  Registry/Appointments to onboard new patients or fix scheduling.
