# Users & Access (Admin) — User Guide

**Where:** Sidebar → Admin → Users & Access (`/admin`)
**Who can see it:** `admin:access` only (Administrator, by default). This single permission
covers both viewing and managing everything on this page.

Two tabs: **Users** and **Groups & Permissions**.

## Users — who has an account

Click **Add User** to add someone: name, email, and which **Group** they belong to. A user's
Group determines everything they can see and do in the app — there's no per-user permission
override, so if someone needs different access, either change their Group or adjust that Group's
permissions.

## Groups & Permissions — the access matrix

A live checkbox grid: one column per Group, one row per permission, organized by module. Ticking
or unticking a box takes effect immediately — no save button, no publish step.

Seeded groups out of the box: **Administrator** (everything), **Doctor**, **Nurse**,
**Pharmacist**, **Front Desk**, **Accountant**, **Insurance Desk**, **Developer** (view-only plus
Developer Config), and **Viewer** (view-only everywhere). Adjust these or add new ones to match
your hospital's actual roles.

## Tips

- Changes here are immediate and global — unticking a box for a Group signs every user in that
  Group out of that capability right away, including anyone currently using the app.
- This app has no real login yet (see Settings for the "switch user" note) — Users & Access
  controls *what a user can do once identified*, which is real and enforced, but *who they are*
  is currently a topbar switcher rather than a password/SSO login. Treat this as fine for an
  internal pilot, not yet for production use with real patient data.
