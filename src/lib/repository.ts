/**
 * Single data-access seam. Every page reads/writes through this module.
 * Each entity gets a load/save/update triplet that tries the configured
 * Google Sheets tab first and falls back to bundled mock data if the API
 * URL isn't configured or the live call fails.
 */
import { getTabName, isBackendConfigured } from './config'
import { fetchTab, insertRow, updateRow } from './sheetsClient'
import { makeId } from './id'
import { nowISO } from './format'
import type {
  Account, Admission, Appointment, Bed, Claim, Consultation, Drug, Group, GstReturnSummary,
  Insurer, Invoice, JournalEntry, Patient, Payment, PharmacyPurchase, PharmacySale, Policy,
  Prescription, StockBatch, TaxRate, User, Ward,
} from '@/types'
import * as mock from '@/mock'

async function loadEntity<T>(entity: string, mockData: T[]): Promise<T[]> {
  if (!isBackendConfigured()) return mockData
  try {
    return await fetchTab<T>(getTabName(entity))
  } catch {
    return mockData
  }
}

async function saveEntity<T extends { id: string }>(entity: string, record: T): Promise<T> {
  if (isBackendConfigured()) {
    try {
      return await insertRow<T>(getTabName(entity), record)
    } catch {
      // fall through to local-only save
    }
  }
  return record
}

async function updateEntity<T extends { id: string }>(entity: string, record: T): Promise<T> {
  if (isBackendConfigured()) {
    try {
      return await updateRow<T>(getTabName(entity), record)
    } catch {
      // fall through to local-only update
    }
  }
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
export const savePatient = (r: Patient) => saveEntity('patients', r)
export const updatePatient = (r: Patient) => updateEntity('patients', r)

export const loadAppointments = () => loadEntity<Appointment>('appointments', mock.mockAppointments)
export const saveAppointment = (r: Appointment) => saveEntity('appointments', r)
export const updateAppointment = (r: Appointment) => updateEntity('appointments', r)

// ---- IPD ----
export const loadWards = () => loadEntity<Ward>('wards', mock.mockWards)
export const saveWard = (r: Ward) => saveEntity('wards', r)
export const updateWard = (r: Ward) => updateEntity('wards', r)

export const loadBeds = () => loadEntity<Bed>('beds', mock.mockBeds)
export const saveBed = (r: Bed) => saveEntity('beds', r)
export const updateBed = (r: Bed) => updateEntity('beds', r)

export const loadAdmissions = () => loadEntity<Admission>('admissions', mock.mockAdmissions)
export const saveAdmission = (r: Admission) => saveEntity('admissions', r)
export const updateAdmission = (r: Admission) => updateEntity('admissions', r)

// ---- Clinical ----
export const loadConsultations = () => loadEntity<Consultation>('consultations', mock.mockConsultations)
export const saveConsultation = (r: Consultation) => saveEntity('consultations', r)
export const updateConsultation = (r: Consultation) => updateEntity('consultations', r)

export const loadPrescriptions = () => loadEntity<Prescription>('prescriptions', mock.mockPrescriptions)
export const savePrescription = (r: Prescription) => saveEntity('prescriptions', r)
export const updatePrescription = (r: Prescription) => updateEntity('prescriptions', r)

// ---- Pharmacy ----
export const loadDrugs = () => loadEntity<Drug>('drugs', mock.mockDrugs)
export const saveDrug = (r: Drug) => saveEntity('drugs', r)
export const updateDrug = (r: Drug) => updateEntity('drugs', r)

export const loadStockBatches = () => loadEntity<StockBatch>('stockBatches', mock.mockStockBatches)
export const saveStockBatch = (r: StockBatch) => saveEntity('stockBatches', r)
export const updateStockBatch = (r: StockBatch) => updateEntity('stockBatches', r)

export const loadPharmacyPurchases = () => loadEntity<PharmacyPurchase>('pharmacyPurchases', mock.mockPharmacyPurchases)
export const savePharmacyPurchase = (r: PharmacyPurchase) => saveEntity('pharmacyPurchases', r)
export const updatePharmacyPurchase = (r: PharmacyPurchase) => updateEntity('pharmacyPurchases', r)

export const loadPharmacySales = () => loadEntity<PharmacySale>('pharmacySales', mock.mockPharmacySales)
export const savePharmacySale = (r: PharmacySale) => saveEntity('pharmacySales', r)
export const updatePharmacySale = (r: PharmacySale) => updateEntity('pharmacySales', r)

// ---- Billing ----
export const loadInvoices = () => loadEntity<Invoice>('invoices', mock.mockInvoices)
export const saveInvoice = (r: Invoice) => saveEntity('invoices', r)
export const updateInvoice = (r: Invoice) => updateEntity('invoices', r)

export const loadPayments = () => loadEntity<Payment>('payments', mock.mockPayments)
export const savePayment = (r: Payment) => saveEntity('payments', r)
export const updatePayment = (r: Payment) => updateEntity('payments', r)

// ---- Accounts / Books & Ledgers ----
export const loadAccounts = () => loadEntity<Account>('accounts', mock.mockAccounts)
export const saveAccount = (r: Account) => saveEntity('accounts', r)
export const updateAccount = (r: Account) => updateEntity('accounts', r)

export const loadJournalEntries = () => loadEntity<JournalEntry>('journalEntries', mock.mockJournalEntries)
export const saveJournalEntry = (r: JournalEntry) => saveEntity('journalEntries', r)
export const updateJournalEntry = (r: JournalEntry) => updateEntity('journalEntries', r)

// ---- GST ----
export const loadTaxRates = () => loadEntity<TaxRate>('taxRates', mock.mockTaxRates)
export const saveTaxRate = (r: TaxRate) => saveEntity('taxRates', r)
export const updateTaxRate = (r: TaxRate) => updateEntity('taxRates', r)

export const loadGstReturns = () => loadEntity<GstReturnSummary>('gstReturns', mock.mockGstReturns)
export const saveGstReturn = (r: GstReturnSummary) => saveEntity('gstReturns', r)
export const updateGstReturn = (r: GstReturnSummary) => updateEntity('gstReturns', r)

// ---- Insurance ----
export const loadInsurers = () => loadEntity<Insurer>('insurers', mock.mockInsurers)
export const saveInsurer = (r: Insurer) => saveEntity('insurers', r)
export const updateInsurer = (r: Insurer) => updateEntity('insurers', r)

export const loadPolicies = () => loadEntity<Policy>('policies', mock.mockPolicies)
export const savePolicy = (r: Policy) => saveEntity('policies', r)
export const updatePolicy = (r: Policy) => updateEntity('policies', r)

export const loadClaims = () => loadEntity<Claim>('claims', mock.mockClaims)
export const saveClaim = (r: Claim) => saveEntity('claims', r)
export const updateClaim = (r: Claim) => updateEntity('claims', r)

// ---- Admin ----
export const loadUsers = () => loadEntity<User>('users', mock.mockUsers)
export const saveUser = (r: User) => saveEntity('users', r)
export const updateUser = (r: User) => updateEntity('users', r)

export const loadGroups = () => loadEntity<Group>('groups', mock.mockGroups)
export const saveGroup = (r: Group) => saveEntity('groups', r)
export const updateGroup = (r: Group) => updateEntity('groups', r)

// ---- Settings ----
export const loadCompanyProfile = async () => mock.mockCompanyProfile
