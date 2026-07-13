# Anjakha HMS

Hospital Management System — Patients/OPD/IPD, Clinical (EMR), Pharmacy Management, Billing,
Books & Ledgers, GST Filing, and Insurance, in one app.

## Stack

React + TypeScript + Vite + Tailwind CSS. No server of its own — data goes through
`src/lib/repository.ts`, which talks to a Google Sheets backend (see `apps-script/`) when
configured, and falls back to bundled mock data otherwise. See `apps-script/SHEETS_SCHEMA.md`
for the sheet schema and deployment steps.

## Development

```bash
npm install
npm run dev       # start the dev server
npm run lint       # oxlint/eslint
npm run build      # type-check + production build
npm run preview    # sanity-check the production build locally
```

Copy `.env.example` to `.env` and set `VITE_SHEETS_API_URL` to point at a deployed Apps Script
Web App, or leave it unset to run entirely on mock data. The same URL can also be set per-browser
from the in-app **Developer Config** page (`/#/config`) without a rebuild.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which lints, builds, and publishes to
GitHub Pages at `https://neurolooom-eng.github.io/Anjakha/`. The app uses a hash router
(`/#/...`) so deep links survive a hard refresh on static hosting with no server-side rewrites.

First-time setup: in the repo's **Settings → Pages**, set **Source** to **GitHub Actions** (the
workflow will configure the rest on its next run).

## User documentation

Each module ships a `USER_GUIDE.md` right next to its code, written for hospital staff rather
than developers — open the folder for the feature you're working on and its guide is there:

- [Dashboard](src/modules/dashboard/USER_GUIDE.md)
- [Patients](src/modules/patients/USER_GUIDE.md) — Registry, Appointments, OPD Queue
- [IPD](src/modules/ipd/USER_GUIDE.md) — Admissions, Wards & Beds
- [Clinical](src/modules/clinical/USER_GUIDE.md) — Consultations, Prescriptions
- [Pharmacy](src/modules/pharmacy/USER_GUIDE.md) — Drug Master, Stock & Batches, Purchases, Sales
- [Billing](src/modules/billing/USER_GUIDE.md) — Invoices, Payments
- [Books & Ledgers](src/modules/accounts/USER_GUIDE.md) — Chart of Accounts, Journal, Ledger, Reports
- [GST Filing](src/modules/gst/USER_GUIDE.md) — Tax/HSN Config, GST Returns
- [Insurance](src/modules/insurance/USER_GUIDE.md) — Insurers/TPAs, Policies, Pre-auth & Claims
- [Users & Access (Admin)](src/modules/admin/USER_GUIDE.md)
- [Settings](src/modules/settings/USER_GUIDE.md)
- [Developer Config](src/modules/config/USER_GUIDE.md)

When you add a new module, add its `USER_GUIDE.md` alongside the code and link it here.
