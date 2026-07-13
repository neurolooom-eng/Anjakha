/**
 * Single data-access seam. Every page reads/writes through this module.
 * Each entity gets a load/save/update triplet that tries the configured
 * Google Sheets tab first and falls back to bundled mock data if the API
 * URL isn't configured or the live call fails.
 *
 * When there's no backend, saves/updates are kept in a per-entity in-memory
 * store (seeded from the mock array on first use) rather than just handed
 * back to the caller — otherwise a record created in one component (e.g. a
 * nurse recording vitals) would never be visible to another (e.g. the
 * doctor's Clinical tab), since each `useCollection` call would keep
 * re-reading the pristine mock array. The store lives for the browser tab's
 * lifetime and is not persisted across a real reload.
 */
import { getTabName, isBackendConfigured } from './config'
import { fetchTab, insertRow, updateRow } from './sheetsClient'
import { makeId } from './id'
import { nowISO } from './format'
import type {
  Account, Admission, Appointment, Bed, Claim, Consultation, Doctor, DoctorSchedule, Drug, Group,
  GstReturnSummary, Insurer, Invoice, JournalEntry, Patient, Payment, PharmacyPurchase,
  PharmacySale, Policy, Prescription, StockBatch, TaxRate, User, Ward,
} from '@/types'
import * as mock from '@/mock'

const memoryStore = new Map<string, { id: string }[]>()

function getStore<T extends { id: string }>(entity: string, mockData: T[]): T[] {
  if (!memoryStore.has(entity)) memoryStore.set(entity, [...mockData])
  return memoryStore.get(entity) as T[]
}

async function loadEntity<T extends { id: string }>(entity: string, mockData: T[]): Promise<T[]> {
  if (!isBackendConfigured()) return [...getStore(entity, mockData)]
  try {
    return await fetchTab<T>(getTabName(entity))
  } catch {
    return [...getStore(entity, mockData)]
  }
}

async function saveEntity<T extends { id: string }>(entity: string, record: T, mockData: T[]): Promise<T> {
  if (isBackendConfigured()) {
    try {
      return await insertRow<T>(getTabName(entity), record)
    } catch {
      // fall through to local-only save
    }
  }
  const store = getStore(entity, mockData)
  store.unshift(record)
  return record
}

async function updateEntity<T extends { id: string }>(entity: string, record: T, mockData: T[]): Promise<T> {
  if (isBackendConfigured()) {
    try {
      return await updateRow<T>(getTabName(entity), record)
    } catch {
      // fall through to local-only update
    }
  }
  const store = getStore(entity, mockData)
  const idx = store.findIndex((r) => r.id === record.id)
  if (idx >= 0) store[idx] = record
  else store.unshift(record)
  return record
}

export function withAudit<T extends object>(
  partial: T,
  user: string,
  existing?: { createdAt: string; createdBy: string },
) {
  const ts = nowISO()
  return {
    ...partial,
    id: (partial as { id?: string }).id ?? makeId('rec'),
    createdAt: existing?.createdAt ?? ts,
    createdBy: existing?.createdBy ?? user,
    updatedAt: ts,
    updatedBy: user,
  }
}

// ---- Patients ----
export const loadPatients = () => loadEntity<Patient>('patients', mock.mockPatients)
export const savePatient = (r: Patient) => saveEntity('patients', r, mock.mockPatients)
export const updatePatient = (r: Patient) => updateEntity('patients', r, mock.mockPatients)

export const loadAppointments = () => loadEntity<Appointment>('appointments', mock.mockAppointments)
export const saveAppointment = (r: Appointment) => saveEntity('appointments', r, mock.mockAppointments)
export const updateAppointment = (r: Appointment) => updateEntity('appointments', r, mock.mockAppointments)

export const loadDoctorSchedules = () => loadEntity<DoctorSchedule>('doctorSchedules', mock.mockDoctorSchedules)
export const saveDoctorSchedule = (r: DoctorSchedule) => saveEntity('doctorSchedules', r, mock.mockDoctorSchedules)
export const updateDoctorSchedule = (r: DoctorSchedule) => updateEntity('doctorSchedules', r, mock.mockDoctorSchedules)

// ---- Doctors ----
export const loadDoctors = () => loadEntity<Doctor>('doctors', mock.mockDoctors)
export const saveDoctor = (r: Doctor) => saveEntity('doctors', r, mock.mockDoctors)
export const updateDoctor = (r: Doctor) => updateEntity('doctors', r, mock.mockDoctors)

// ---- IPD ----
export const loadWards = () => loadEntity<Ward>('wards', mock.mockWards)
export const saveWard = (r: Ward) => saveEntity('wards', r, mock.mockWards)
export const updateWard = (r: Ward) => updateEntity('wards', r, mock.mockWards)

export const loadBeds = () => loadEntity<Bed>('beds', mock.mockBeds)
export const saveBed = (r: Bed) => saveEntity('beds', r, mock.mockBeds)
export const updateBed = (r: Bed) => updateEntity('beds', r, mock.mockBeds)

export const loadAdmissions = () => loadEntity<Admission>('admissions', mock.mockAdmissions)
export const saveAdmission = (r: Admission) => saveEntity('admissions', r, mock.mockAdmissions)
export const updateAdmission = (r: Admission) => updateEntity('admissions', r, mock.mockAdmissions)

// ---- Clinical ----
export const loadConsultations = () => loadEntity<Consultation>('consultations', mock.mockConsultations)
export const saveConsultation = (r: Consultation) => saveEntity('consultations', r, mock.mockConsultations)
export const updateConsultation = (r: Consultation) => updateEntity('consultations', r, mock.mockConsultations)

export const loadPrescriptions = () => loadEntity<Prescription>('prescriptions', mock.mockPrescriptions)
export const savePrescription = (r: Prescription) => saveEntity('prescriptions', r, mock.mockPrescriptions)
export const updatePrescription = (r: Prescription) => updateEntity('prescriptions', r, mock.mockPrescriptions)

// ---- Pharmacy ----
export const loadDrugs = () => loadEntity<Drug>('drugs', mock.mockDrugs)
export const saveDrug = (r: Drug) => saveEntity('drugs', r, mock.mockDrugs)
export const updateDrug = (r: Drug) => updateEntity('drugs', r, mock.mockDrugs)

export const loadStockBatches = () => loadEntity<StockBatch>('stockBatches', mock.mockStockBatches)
export const saveStockBatch = (r: StockBatch) => saveEntity('stockBatches', r, mock.mockStockBatches)
export const updateStockBatch = (r: StockBatch) => updateEntity('stockBatches', r, mock.mockStockBatches)

export const loadPharmacyPurchases = () => loadEntity<PharmacyPurchase>('pharmacyPurchases', mock.mockPharmacyPurchases)
export const savePharmacyPurchase = (r: PharmacyPurchase) => saveEntity('pharmacyPurchases', r, mock.mockPharmacyPurchases)
export const updatePharmacyPurchase = (r: PharmacyPurchase) => updateEntity('pharmacyPurchases', r, mock.mockPharmacyPurchases)

export const loadPharmacySales = () => loadEntity<PharmacySale>('pharmacySales', mock.mockPharmacySales)
export const savePharmacySale = (r: PharmacySale) => saveEntity('pharmacySales', r, mock.mockPharmacySales)
export const updatePharmacySale = (r: PharmacySale) => updateEntity('pharmacySales', r, mock.mockPharmacySales)

// ---- Billing ----
export const loadInvoices = () => loadEntity<Invoice>('invoices', mock.mockInvoices)
export const saveInvoice = (r: Invoice) => saveEntity('invoices', r, mock.mockInvoices)
export const updateInvoice = (r: Invoice) => updateEntity('invoices', r, mock.mockInvoices)

export const loadPayments = () => loadEntity<Payment>('payments', mock.mockPayments)
export const savePayment = (r: Payment) => saveEntity('payments', r, mock.mockPayments)
export const updatePayment = (r: Payment) => updateEntity('payments', r, mock.mockPayments)

// ---- Accounts / Books & Ledgers ----
export const loadAccounts = () => loadEntity<Account>('accounts', mock.mockAccounts)
export const saveAccount = (r: Account) => saveEntity('accounts', r, mock.mockAccounts)
export const updateAccount = (r: Account) => updateEntity('accounts', r, mock.mockAccounts)

export const loadJournalEntries = () => loadEntity<JournalEntry>('journalEntries', mock.mockJournalEntries)
export const saveJournalEntry = (r: JournalEntry) => saveEntity('journalEntries', r, mock.mockJournalEntries)
export const updateJournalEntry = (r: JournalEntry) => updateEntity('journalEntries', r, mock.mockJournalEntries)

// ---- GST ----
export const loadTaxRates = () => loadEntity<TaxRate>('taxRates', mock.mockTaxRates)
export const saveTaxRate = (r: TaxRate) => saveEntity('taxRates', r, mock.mockTaxRates)
export const updateTaxRate = (r: TaxRate) => updateEntity('taxRates', r, mock.mockTaxRates)

export const loadGstReturns = () => loadEntity<GstReturnSummary>('gstReturns', mock.mockGstReturns)
export const saveGstReturn = (r: GstReturnSummary) => saveEntity('gstReturns', r, mock.mockGstReturns)
export const updateGstReturn = (r: GstReturnSummary) => updateEntity('gstReturns', r, mock.mockGstReturns)

// ---- Insurance ----
export const loadInsurers = () => loadEntity<Insurer>('insurers', mock.mockInsurers)
export const saveInsurer = (r: Insurer) => saveEntity('insurers', r, mock.mockInsurers)
export const updateInsurer = (r: Insurer) => updateEntity('insurers', r, mock.mockInsurers)

export const loadPolicies = () => loadEntity<Policy>('policies', mock.mockPolicies)
export const savePolicy = (r: Policy) => saveEntity('policies', r, mock.mockPolicies)
export const updatePolicy = (r: Policy) => updateEntity('policies', r, mock.mockPolicies)

export const loadClaims = () => loadEntity<Claim>('claims', mock.mockClaims)
export const saveClaim = (r: Claim) => saveEntity('claims', r, mock.mockClaims)
export const updateClaim = (r: Claim) => updateEntity('claims', r, mock.mockClaims)

// ---- Admin ----
export const loadUsers = () => loadEntity<User>('users', mock.mockUsers)
export const saveUser = (r: User) => saveEntity('users', r, mock.mockUsers)
export const updateUser = (r: User) => updateEntity('users', r, mock.mockUsers)

export const loadGroups = () => loadEntity<Group>('groups', mock.mockGroups)
export const saveGroup = (r: Group) => saveEntity('groups', r, mock.mockGroups)
export const updateGroup = (r: Group) => updateEntity('groups', r, mock.mockGroups)

// ---- Settings ----
export const loadCompanyProfile = async () => mock.mockCompanyProfile
