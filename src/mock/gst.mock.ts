import type { GstReturnSummary, TaxRate } from '@/types'
import { seedAudit } from './audit'

export const mockTaxRates: TaxRate[] = [
  { id: 'tax_1', hsnSacCode: '999312', description: 'Medical consultation services', gstRate: 18, category: 'Service', ...seedAudit(365) },
  { id: 'tax_2', hsnSacCode: '999311', description: 'Inpatient hospital services (exempt)', gstRate: 0, category: 'Service', ...seedAudit(365) },
  { id: 'tax_3', hsnSacCode: '30049099', description: 'Medicaments — general', gstRate: 12, category: 'Goods', ...seedAudit(365) },
  { id: 'tax_4', hsnSacCode: '30041020', description: 'Antibiotic formulations', gstRate: 12, category: 'Goods', ...seedAudit(365) },
  { id: 'tax_5', hsnSacCode: '30043100', description: 'Insulin', gstRate: 5, category: 'Goods', ...seedAudit(365) },
  { id: 'tax_6', hsnSacCode: '40151900', description: 'Examination gloves & consumables', gstRate: 12, category: 'Goods', ...seedAudit(365) },
]

export const mockGstReturns: GstReturnSummary[] = [
  {
    id: 'gst_1', returnType: 'GSTR-1', period: 'June 2026', taxableValue: 186400, cgst: 12408,
    sgst: 12408, igst: 0, totalTax: 24816, invoiceCount: 214, status: 'Filed', generatedAt: '2026-07-05T10:00:00.000Z',
    ...seedAudit(8),
  },
  {
    id: 'gst_2', returnType: 'GSTR-3B', period: 'June 2026', taxableValue: 186400, cgst: 12408,
    sgst: 12408, igst: 0, totalTax: 24816, invoiceCount: 214, status: 'Filed', generatedAt: '2026-07-06T10:00:00.000Z',
    ...seedAudit(7),
  },
  {
    id: 'gst_3', returnType: 'GSTR-1', period: 'July 2026', taxableValue: 34210, cgst: 2271.4,
    sgst: 2271.4, igst: 0, totalTax: 4542.8, invoiceCount: 42, status: 'Draft',
    ...seedAudit(0),
  },
]
