# Settings — User Guide

**Where:** Sidebar → Admin → Settings (`/settings`)
**Who can see it:** Everyone — no permission gate.

## What's here

- **Branding** — the hospital's display name and logo mark.
- **Company profile** — legal name, GSTIN, phone, email, accreditation, and registered address.
  This is read-only display data sourced from the app's configuration; to change it, a developer
  updates the company profile in the data layer (`src/mock/settings.mock.ts`, or the equivalent
  Sheet row if a live backend is connected).
- **Build info** — the current build ID and build date, so you can confirm which deployment
  you're looking at.

## Hard refresh

If the app looks stale right after a new version is deployed (old styles, a missing feature),
click **Hard refresh**. It clears cached assets in your browser and reloads — try this before
assuming something is broken.

## Related: switching users and themes

Switching the active user (for role/permission testing) and choosing a colour theme both live in
the **topbar**, not here — click the palette icon for themes, or your name/avatar for the user
switcher.
