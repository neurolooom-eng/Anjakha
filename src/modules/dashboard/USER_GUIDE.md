# Dashboard — User Guide

**Where:** Sidebar → Overview → Dashboard (`/`)
**Who can see it:** Anyone with the `dashboard:view` permission (granted to every seeded role).

## What it's for

A one-screen snapshot of the hospital's day: how many patients are registered, how full the
wards are, what's been collected today, and what needs attention (low stock, pending claims,
unpaid invoices).

## What you'll see

- **KPI row** — registered patients, today's appointments, bed occupancy (red/amber/green
  against an 85% target), today's collections, active admissions, pending insurance claims,
  low-stock drugs, and outstanding invoices.
- **Revenue by category** — a bar chart splitting today's billed revenue across OPD, IPD, and
  Pharmacy.
- **Appointments by department** — a donut chart of today's appointment load per department.
- **Modules grid** — a shortcut tile per module you have access to; click any tile to jump
  straight there.

## Tips

- The KPI colour (green/amber/red) is relative to a target, not just the raw number — e.g. bed
  occupancy turns red as it climbs *past* 85%, since high occupancy is the thing to watch, not a
  thing to maximize.
- Every number here is computed live from the same records you see in Patients, Pharmacy,
  Billing, etc. — there's nothing to "refresh" or "publish" separately.
- If a tile you expect isn't in the modules grid, you likely don't have the `view` permission for
  that module — ask an Administrator to check Users & Access.
