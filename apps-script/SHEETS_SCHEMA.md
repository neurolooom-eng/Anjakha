# Sheets schema

Each tab is a flat table; row 1 is the header row and must match the column names below
exactly (case-sensitive). The `id` column is required on every tab — it's the update key.

Columns typed **JSON** hold nested data (line items, vitals, permission lists) — Apps Script
writes them with `JSON.stringify`; the client is expected to `JSON.parse` them back on read
(the current `sheetsClient.ts` passes rows straight through, so any tab you round-trip through
Sheets should keep those columns as JSON-encoded strings; nested fields display best-effort
otherwise).

Every entity also carries the standard audit columns: `createdAt`, `createdBy`, `updatedAt`,
`updatedBy` (all plain text/ISO date strings) — omitted from the lists below for brevity.

| Tab | Columns (beyond audit fields) |
|---|---|
| `Patients` | id, uhid, name, gender, dob, phone, email, address, bloodGroup, category, allergies, emergencyContact, status |
| `Appointments` | id, patientId, patientName, doctorName, department, date, time, type, status, notes |
| `Wards` | id, name, type, floor |
| `Beds` | id, wardId, wardName, bedNumber, status, dailyRate |
| `Admissions` | id, patientId, patientName, bedId, bedLabel, admittingDoctor, admissionDate, dischargeDate, diagnosis, status, notes |
| `Consultations` | id, patientId, patientName, doctorName, date, department, vitals (JSON), complaints, diagnosis, advice, followUpDate, status |
| `Prescriptions` | id, consultationId, patientId, patientName, doctorName, date, items (JSON), status |
| `Drugs` | id, name, genericName, hsnCode, category, unit, gstRate, reorderLevel, mrp, status |
| `StockBatches` | id, drugId, drugName, batchNo, expiryDate, quantity, purchaseRate, mrp, supplierName |
| `PharmacyPurchases` | id, grnNumber, supplierName, supplierGstin, date, items (JSON), totalAmount, status |
| `PharmacySales` | id, invoiceNumber, prescriptionId, patientId, patientName, date, items (JSON), totalAmount, status |
| `Invoices` | id, invoiceNumber, patientId, patientName, date, category, items (JSON), subtotal, cgst, sgst, igst, total, amountPaid, insuranceClaimId, status |
| `Payments` | id, invoiceId, invoiceNumber, patientName, date, amount, mode, referenceNo |
| `Accounts` | id, code, name, type, openingBalance, status |
| `JournalEntries` | id, entryNumber, date, narration, source, sourceRefId, lines (JSON), status |
| `TaxRates` | id, hsnSacCode, description, gstRate, category |
| `GstReturns` | id, returnType, period, taxableValue, cgst, sgst, igst, totalTax, invoiceCount, status, generatedAt |
| `Insurers` | id, name, type, contactPerson, phone, email, status |
| `Policies` | id, patientId, patientName, insurerId, insurerName, policyNumber, sumInsured, validTill, status |
| `Claims` | id, claimNumber, patientId, patientName, policyId, policyNumber, insurerName, invoiceId, admissionId, claimAmount, approvedAmount, settledAmount, date, status, remarks |
| `Users` | id, name, email, groupId, groupName, status |
| `Groups` | id, name, permissions (JSON array of permission keys) |

## Deploying

1. Create a new Google Sheet, add one tab per row above, paste the header row.
2. Extensions → Apps Script → paste `Code.gs` → Deploy → New deployment → **Web app**
   (Execute as: Me, Who has access: Anyone with the link).
3. Copy the `/exec` URL into the app's **Developer Config** page (`/config`) as the
   "Apps Script Exec URL", or set `VITE_SHEETS_API_URL` at build time.
4. Use the "Test Connection" button per tab in Developer Config to confirm reachability.

Leaving the URL unset keeps the app fully functional on bundled mock data.
