# Clinical — User Guide

**Where:** Sidebar → Clinical → Clinical (`/clinical`)
**Who can see it:** `clinical:view`. Adding notes/prescriptions needs `clinical:create` /
`clinical:edit` (Doctors have full access; Nurses have view-only).

Two tabs: **Consultations** and **Prescriptions**.

## Consultations — the visit record (EMR)

1. Click **New Consultation**.
2. Pick the patient, doctor, department, and date.
3. Record **Vitals** (temperature, pulse, BP, SpO2, weight, height) — all optional, fill in what
   was measured.
4. Write the **Complaints** and **Diagnosis** (required) and any **Advice**, plus a follow-up
   date if one is needed.
5. Leave **Status** as `Draft` while the note is still being written, or set it to `Finalized`
   once it's complete.

## Prescriptions — what gets sent to Pharmacy

1. Click **New Prescription**.
2. Optionally pick the **Consultation** it belongs to, or just pick the patient directly.
3. Add each medicine as a line: drug, dosage, frequency, duration in days, and quantity.
4. Save with status `Pending` — this is what makes it show up in Pharmacy's **Sales &
   Dispensing** tab, ready to be dispensed.

Once Pharmacy dispenses it, the prescription's status updates to `Dispensed` automatically — you
don't need to change it here.

## Tips

- A consultation and its prescription are two separate records — write the consultation note
  first, then create the prescription (optionally linking it back to that consultation) so the
  Pharmacy team has full context if they need it.
- Prescriptions left at `Pending` are exactly the ones pharmacists see queued up — there's no
  separate "send to pharmacy" step.
