import type { Invoice, Payment } from '@/types'
import { seedAudit } from './audit'

export const mockInvoices: Invoice[] = [
  {
    id: 'inv_1', invoiceNumber: 'INV-2026-3001', patientId: 'pat_1', patientName: 'Ramesh Kulkarni',
    date: '2026-07-13', category: 'OPD',
    items: [
      { description: 'Cardiology consultation', hsnSacCode: '999312', quantity: 1, rate: 800, gstRate: 18 },
      { description: 'ECG', hsnSacCode: '999312', quantity: 1, rate: 450, gstRate: 18 },
    ],
    subtotal: 1250, cgst: 112.5, sgst: 112.5, igst: 0, total: 1475, amountPaid: 1475,
    insuranceClaimId: 'clm_1', status: 'Paid', ...seedAudit(0),
  },
  {
    id: 'inv_2', invoiceNumber: 'INV-2026-3002', patientId: 'pat_5', patientName: 'Vikram Singh',
    date: '2026-07-12', category: 'IPD',
    items: [
      { description: 'ICU bed charges (2 days)', hsnSacCode: '999311', quantity: 2, rate: 9000, gstRate: 0 },
      { description: 'Ventilator support', hsnSacCode: '999311', quantity: 2, rate: 3500, gstRate: 0 },
    ],
    subtotal: 25000, cgst: 0, sgst: 0, igst: 0, total: 25000, amountPaid: 10000,
    insuranceClaimId: 'clm_2', status: 'Partially Paid', ...seedAudit(1),
  },
  {
    id: 'inv_3', invoiceNumber: 'INV-2026-3003', patientId: 'pat_4', patientName: 'Fatima Ansari',
    date: '2026-07-13', category: 'Pharmacy',
    items: [
      { description: 'Paracetamol 650mg x12', hsnSacCode: '30049099', quantity: 12, rate: 1.5, gstRate: 12 },
      { description: 'Amoxicillin 500mg x15', hsnSacCode: '30041020', quantity: 15, rate: 6.0, gstRate: 12 },
    ],
    subtotal: 108, cgst: 6.48, sgst: 6.48, igst: 0, total: 120.96, amountPaid: 120.96,
    status: 'Paid', ...seedAudit(0),
  },
  {
    id: 'inv_4', invoiceNumber: 'INV-2026-3004', patientId: 'pat_2', patientName: 'Sunita Deshmukh',
    date: '2026-07-13', category: 'OPD',
    items: [{ description: 'Gynaecology consultation', hsnSacCode: '999312', quantity: 1, rate: 700, gstRate: 18 }],
    subtotal: 700, cgst: 63, sgst: 63, igst: 0, total: 826, amountPaid: 0, status: 'Unpaid', ...seedAudit(0),
  },
]

export const mockPayments: Payment[] = [
  { id: 'pay_1', invoiceId: 'inv_1', invoiceNumber: 'INV-2026-3001', patientName: 'Ramesh Kulkarni', date: '2026-07-13', amount: 1475, mode: 'UPI', referenceNo: 'UPI2607130001', ...seedAudit(0) },
  { id: 'pay_2', invoiceId: 'inv_2', invoiceNumber: 'INV-2026-3002', patientName: 'Vikram Singh', date: '2026-07-12', amount: 10000, mode: 'Insurance', referenceNo: 'TPA-CASHLESS-778', ...seedAudit(1) },
  { id: 'pay_3', invoiceId: 'inv_3', invoiceNumber: 'INV-2026-3003', patientName: 'Fatima Ansari', date: '2026-07-13', amount: 120.96, mode: 'Cash', ...seedAudit(0) },
]
