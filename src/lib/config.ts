const LS_KEYS = {
  apiUrl: 'config.sheetsApiUrl',
  spreadsheetId: 'config.spreadsheetId',
  tabPrefix: 'config.tab.',
} as const

export const DEFAULT_TABS: Record<string, string> = {
  patients: 'Patients',
  appointments: 'Appointments',
  wards: 'Wards',
  beds: 'Beds',
  admissions: 'Admissions',
  consultations: 'Consultations',
  prescriptions: 'Prescriptions',
  drugs: 'Drugs',
  stockBatches: 'StockBatches',
  pharmacyPurchases: 'PharmacyPurchases',
  pharmacySales: 'PharmacySales',
  invoices: 'Invoices',
  payments: 'Payments',
  accounts: 'Accounts',
  journalEntries: 'JournalEntries',
  taxRates: 'TaxRates',
  gstReturns: 'GstReturns',
  insurers: 'Insurers',
  policies: 'Policies',
  claims: 'Claims',
  users: 'Users',
  groups: 'Groups',
}

export function getSheetsApiUrl(): string {
  const override = localStorage.getItem(LS_KEYS.apiUrl)
  if (override) return override
  return import.meta.env.VITE_SHEETS_API_URL ?? ''
}

export function setSheetsApiUrl(url: string) {
  if (url) localStorage.setItem(LS_KEYS.apiUrl, url)
  else localStorage.removeItem(LS_KEYS.apiUrl)
}

export function getSpreadsheetId(): string {
  const override = localStorage.getItem(LS_KEYS.spreadsheetId)
  if (override) return override
  return import.meta.env.VITE_SHEETS_SPREADSHEET_ID ?? ''
}

export function setSpreadsheetId(id: string) {
  if (id) localStorage.setItem(LS_KEYS.spreadsheetId, id)
  else localStorage.removeItem(LS_KEYS.spreadsheetId)
}

export function getTabName(entity: string): string {
  const override = localStorage.getItem(LS_KEYS.tabPrefix + entity)
  return override || DEFAULT_TABS[entity] || entity
}

export function setTabName(entity: string, tab: string) {
  if (tab) localStorage.setItem(LS_KEYS.tabPrefix + entity, tab)
  else localStorage.removeItem(LS_KEYS.tabPrefix + entity)
}

export function isBackendConfigured(): boolean {
  return Boolean(getSheetsApiUrl())
}
