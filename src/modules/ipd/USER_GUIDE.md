# IPD — User Guide

**Where:** Sidebar → Inpatient → IPD (`/ipd`)
**Who can see it:** `ipd:view`. Admitting/editing needs `ipd:create` / `ipd:edit` (Nurse has
create, Doctor and Administrator have full edit).

Two tabs: **Admissions** and **Wards & Beds**.

## Wards & Beds — bed inventory and live occupancy

The KPI row at the top shows total beds, occupied, available, and overall occupancy percentage
(flagged amber/red once it climbs past 85%).

The table below lists every bed with its ward, daily rate, and status
(`Available` / `Occupied` / `Reserved` / `Cleaning` / `Maintenance`). Click **Add Bed** to add a
new bed to a ward, or click a row to edit its rate or status directly (e.g. moving a bed from
`Cleaning` to `Available` once housekeeping is done).

## Admissions — admitting and discharging patients

1. Click **Admit Patient**.
2. Choose the patient, an **available** bed (the dropdown only lists beds that are currently
   free), the admitting doctor, admission date, and diagnosis.
3. Save. The bed you picked is automatically marked **Occupied** — you don't need to switch to
   Wards & Beds to do that separately.

To discharge a patient, open their admission and change **Status** to `Discharged` (optionally
setting a discharge date). Their bed automatically flips to **Cleaning**, signalling housekeeping
before it's marked `Available` again.

## Tips

- Only beds marked `Available` show up when admitting a new patient — if the bed you expect is
  missing, check its status on the Wards & Beds tab.
- `Transferred` and `Deceased` are also valid admission statuses for record-keeping, but only a
  `Discharged` status frees up the bed automatically; handle the other cases' bed status by hand
  on the Wards & Beds tab.
