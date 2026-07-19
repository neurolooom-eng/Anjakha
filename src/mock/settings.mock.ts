import type { CompanyProfile } from '@/types'

// Real hospital details (from the practice's Google Business profile). GSTIN left blank —
// not on file here — rather than fabricated.
export const mockCompanyProfile: CompanyProfile = {
  legalName: 'Anjakha Hospital',
  displayName: 'Anjakha Hospital',
  tagline: 'Quality care at affordable cost',
  establishedOn: '14 April 2009',
  gstin: '',
  hqAddress:
    '23, Medavakkam Main Road, near Ganesh Nagar, Iyappa Nagar, Madipakkam, Chennai, Tamil Nadu 600091',
  phone: '+91 96001 45762',
  email: 'anjakhaj@yahoo.co.in',
  website: 'anjakhahospitals.com',
  accreditation: 'Obstetrics, Gynaecology & Surgical Care',
}
