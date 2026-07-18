import type { Drug, PharmacyPurchase, PharmacySale, StockBatch } from '@/types'
import { seedAudit } from './audit'
import { relativeDate } from './dates'

export const mockDrugs: Drug[] = [
  { id: 'drg_1', name: 'Atorvastatin', genericName: 'Atorvastatin', form: 'Tablet', strength: '20 mg', hsnCode: '30049099', category: 'Cardiac', unit: 'Strip', gstRate: 12, reorderLevel: 100, mrp: 8.5, status: 'Active', ...seedAudit(120) },
  { id: 'drg_2', name: 'Metoprolol', genericName: 'Metoprolol Tartrate', form: 'Tablet', strength: '25 mg', hsnCode: '30049099', category: 'Cardiac', unit: 'Strip', gstRate: 12, reorderLevel: 100, mrp: 4.2, status: 'Active', ...seedAudit(120) },
  { id: 'drg_3', name: 'Ibuprofen', genericName: 'Ibuprofen', form: 'Tablet', strength: '400 mg', hsnCode: '30049099', category: 'Analgesic', unit: 'Strip', gstRate: 12, reorderLevel: 150, mrp: 2.8, status: 'Active', ...seedAudit(120) },
  { id: 'drg_4', name: 'Paracetamol', genericName: 'Paracetamol', form: 'Tablet', strength: '650 mg', hsnCode: '30049099', category: 'Analgesic', unit: 'Strip', gstRate: 12, reorderLevel: 200, mrp: 1.5, status: 'Active', ...seedAudit(120) },
  { id: 'drg_5', name: 'Amoxicillin', genericName: 'Amoxicillin', form: 'Capsule', strength: '500 mg', hsnCode: '30041020', category: 'Antibiotic', unit: 'Strip', gstRate: 12, reorderLevel: 100, mrp: 6.0, status: 'Active', ...seedAudit(120) },
  { id: 'drg_6', name: 'Insulin Glargine', genericName: 'Insulin Glargine', form: 'Injection', strength: '100 IU/ml', doseUnit: 'IU', hsnCode: '30043100', category: 'Endocrine', unit: 'Vial', gstRate: 5, reorderLevel: 20, mrp: 420, status: 'Active', ...seedAudit(120) },
  { id: 'drg_7', name: 'Normal Saline', genericName: 'Sodium Chloride 0.9%', form: 'Other', strength: '500 ml', hsnCode: '30049099', category: 'IV Fluid', unit: 'Bottle', gstRate: 12, reorderLevel: 50, mrp: 45, status: 'Active', ...seedAudit(120) },
  { id: 'drg_8', name: 'Surgical Gloves', genericName: 'Latex Examination Gloves', form: 'Other', strength: '', hsnCode: '40151900', category: 'Consumable', unit: 'Box', gstRate: 12, reorderLevel: 30, mrp: 320, status: 'Active', ...seedAudit(120) },
  { id: 'drg_9', name: 'Ambroxol', genericName: 'Ambroxol HCl', form: 'Syrup', strength: '15 mg/5 ml', doseUnit: 'ml', hsnCode: '30049099', category: 'Respiratory', unit: 'Bottle', gstRate: 12, reorderLevel: 40, mrp: 92, status: 'Active', ...seedAudit(120) },
  { id: 'drg_10', name: 'Paracetamol', genericName: 'Paracetamol', form: 'Suspension', strength: '250 mg/5 ml', doseUnit: 'ml', hsnCode: '30049099', category: 'Analgesic', unit: 'Bottle', gstRate: 12, reorderLevel: 40, mrp: 45, status: 'Active', ...seedAudit(120) },
]

export const mockStockBatches: StockBatch[] = [
  { id: 'stk_1', drugId: 'drg_1', drugName: 'Atorvastatin 20 mg Tablet', batchNo: 'ATV-2405', expiryDate: '2027-05-31', quantity: 420, purchaseRate: 5.2, mrp: 8.5, supplierName: 'MedPlus Distributors', ...seedAudit(60) },
  { id: 'stk_2', drugId: 'drg_2', drugName: 'Metoprolol 25 mg Tablet', batchNo: 'MET-2403', expiryDate: '2026-08-15', quantity: 85, purchaseRate: 2.6, mrp: 4.2, supplierName: 'Sunrise Pharma', ...seedAudit(55) },
  { id: 'stk_3', drugId: 'drg_3', drugName: 'Ibuprofen 400 mg Tablet', batchNo: 'IBU-2501', expiryDate: '2028-01-31', quantity: 610, purchaseRate: 1.6, mrp: 2.8, supplierName: 'MedPlus Distributors', ...seedAudit(20) },
  { id: 'stk_4', drugId: 'drg_4', drugName: 'Paracetamol 650 mg Tablet', batchNo: 'PCM-2412', expiryDate: '2026-07-25', quantity: 40, purchaseRate: 0.8, mrp: 1.5, supplierName: 'Wellness Pharma Co.', ...seedAudit(45) },
  { id: 'stk_5', drugId: 'drg_5', drugName: 'Amoxicillin 500 mg Capsule', batchNo: 'AMX-2409', expiryDate: '2027-03-10', quantity: 275, purchaseRate: 3.4, mrp: 6.0, supplierName: 'Sunrise Pharma', ...seedAudit(30) },
  { id: 'stk_6', drugId: 'drg_6', drugName: 'Insulin Glargine 100 IU/ml Injection', batchNo: 'INS-2502', expiryDate: '2026-12-01', quantity: 18, purchaseRate: 310, mrp: 420, supplierName: 'BioGen Supplies', ...seedAudit(10) },
  { id: 'stk_7', drugId: 'drg_7', drugName: 'Normal Saline 500 ml', batchNo: 'NS-2411', expiryDate: '2027-11-30', quantity: 340, purchaseRate: 28, mrp: 45, supplierName: 'MedPlus Distributors', ...seedAudit(25) },
  { id: 'stk_8', drugId: 'drg_8', drugName: 'Surgical Gloves', batchNo: 'GLV-2501', expiryDate: '2028-06-30', quantity: 22, purchaseRate: 240, mrp: 320, supplierName: 'BioGen Supplies', ...seedAudit(15) },
  { id: 'stk_9', drugId: 'drg_9', drugName: 'Ambroxol 15 mg/5 ml Syrup', batchNo: 'AMB-2504', expiryDate: '2027-04-30', quantity: 120, purchaseRate: 64, mrp: 92, supplierName: 'Wellness Pharma Co.', ...seedAudit(18) },
  { id: 'stk_10', drugId: 'drg_10', drugName: 'Paracetamol 250 mg/5 ml Suspension', batchNo: 'PCS-2503', expiryDate: '2027-02-28', quantity: 95, purchaseRate: 31, mrp: 45, supplierName: 'Wellness Pharma Co.', ...seedAudit(22) },
]

export const mockPharmacyPurchases: PharmacyPurchase[] = [
  {
    id: 'grn_1', grnNumber: 'GRN-2026-0041', supplierName: 'MedPlus Distributors', supplierGstin: '27AAECM1234F1Z5',
    date: relativeDate(-5), status: 'Received',
    items: [
      { drugId: 'drg_1', drugName: 'Atorvastatin 20 mg Tablet', batchNo: 'ATV-2405', expiryDate: '2027-05-31', quantity: 500, rate: 5.2, gstRate: 12 },
      { drugId: 'drg_3', drugName: 'Ibuprofen 400 mg Tablet', batchNo: 'IBU-2501', expiryDate: '2028-01-31', quantity: 700, rate: 1.6, gstRate: 12 },
    ],
    totalAmount: 4116.8, ...seedAudit(5),
  },
  {
    id: 'grn_2', grnNumber: 'GRN-2026-0042', supplierName: 'Sunrise Pharma', supplierGstin: '29AACCS5678G1ZQ',
    date: relativeDate(-2), status: 'Received',
    items: [
      { drugId: 'drg_5', drugName: 'Amoxicillin 500 mg Capsule', batchNo: 'AMX-2409', expiryDate: '2027-03-10', quantity: 300, rate: 3.4, gstRate: 12 },
    ],
    totalAmount: 1142.4, ...seedAudit(2),
  },
]

export const mockPharmacySales: PharmacySale[] = [
  {
    id: 'sal_1', invoiceNumber: 'PH-2026-1001', prescriptionId: 'rx_3', patientId: 'pat_4', patientName: 'Fatima Ansari',
    date: relativeDate(0), status: 'Dispensed',
    items: [
      { drugId: 'drg_4', drugName: 'Paracetamol 650 mg Tablet', batchNo: 'PCM-2412', quantity: 12, rate: 1.5, gstRate: 12 },
      { drugId: 'drg_5', drugName: 'Amoxicillin 500 mg Capsule', batchNo: 'AMX-2409', quantity: 15, rate: 6.0, gstRate: 12 },
    ],
    totalAmount: 118.16, ...seedAudit(0),
  },
]
