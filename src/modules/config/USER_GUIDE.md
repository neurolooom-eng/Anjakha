# Developer Config — User Guide

**Where:** Sidebar → Admin → Developer Config (`/config`)
**Who can see it:** `config:access` (Administrator and Developer, by default).

This page points the app at a live data backend. It's the only place you configure this — no
rebuild needed.

## Connecting a Google Sheets backend

1. Deploy the Apps Script backend in `apps-script/Code.gs` as a Web App (see
   `apps-script/SHEETS_SCHEMA.md` for the exact steps and the sheet tab schema it expects).
2. Paste the deployment's `/exec` URL into **Apps Script Exec URL** here.
3. If that script serves more than one spreadsheet, also set **Spreadsheet ID**.
4. Each entity's **sheet tab** name defaults to something sensible (e.g. `Patients`,
   `Invoices`) — override any of them here if your sheet uses different tab names.
5. Click **Test Connection** next to a tab to confirm the app can reach it before relying on it.
6. Click **Save Config**.

These settings are stored per-browser (in `localStorage`), so they don't affect other users or
require a deploy.

## Running on mock data only

Leave **Apps Script Exec URL** blank (or clear it and save) and the app runs entirely on its
bundled demo data — useful for training, demos, or local development without touching real
records.

## Tips

- If a page you expect to show live data is still showing the same demo records after you've
  configured a Sheets URL, run **Test Connection** for that entity's tab first — a failed
  connection silently falls back to mock data rather than breaking the page.
- This backend has no authentication of its own — anyone with the Exec URL can read/write it.
  Treat the URL itself as a secret, and don't paste it anywhere public.
