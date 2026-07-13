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
