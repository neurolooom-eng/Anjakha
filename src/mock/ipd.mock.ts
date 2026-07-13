import type { Admission, Bed, Ward } from '@/types'
import { seedAudit } from './audit'

export const mockWards: Ward[] = [
  { id: 'wrd_1', name: 'General Ward A', type: 'General', floor: '1st Floor', ...seedAudit(90) },
  { id: 'wrd_2', name: 'Semi-Private B', type: 'Semi-Private', floor: '2nd Floor', ...seedAudit(90) },
  { id: 'wrd_3', name: 'Private Suites', type: 'Private', floor: '3rd Floor', ...seedAudit(90) },
  { id: 'wrd_4', name: 'ICU', type: 'ICU', floor: '4th Floor', ...seedAudit(90) },
  { id: 'wrd_5', name: 'NICU', type: 'NICU', floor: '4th Floor', ...seedAudit(90) },
]

export const mockBeds: Bed[] = [
  { id: 'bed_1', wardId: 'wrd_1', wardName: 'General Ward A', bedNumber: 'A-101', status: 'Occupied', dailyRate: 1500, ...seedAudit(90) },
  { id: 'bed_2', wardId: 'wrd_1', wardName: 'General Ward A', bedNumber: 'A-102', status: 'Available', dailyRate: 1500, ...seedAudit(90) },
  { id: 'bed_3', wardId: 'wrd_1', wardName: 'General Ward A', bedNumber: 'A-103', status: 'Cleaning', dailyRate: 1500, ...seedAudit(90) },
  { id: 'bed_4', wardId: 'wrd_2', wardName: 'Semi-Private B', bedNumber: 'B-201', status: 'Occupied', dailyRate: 3200, ...seedAudit(90) },
  { id: 'bed_5', wardId: 'wrd_2', wardName: 'Semi-Private B', bedNumber: 'B-202', status: 'Available', dailyRate: 3200, ...seedAudit(90) },
  { id: 'bed_6', wardId: 'wrd_3', wardName: 'Private Suites', bedNumber: 'P-301', status: 'Reserved', dailyRate: 6500, ...seedAudit(90) },
  { id: 'bed_7', wardId: 'wrd_3', wardName: 'Private Suites', bedNumber: 'P-302', status: 'Available', dailyRate: 6500, ...seedAudit(90) },
  { id: 'bed_8', wardId: 'wrd_4', wardName: 'ICU', bedNumber: 'ICU-01', status: 'Occupied', dailyRate: 9000, ...seedAudit(90) },
  { id: 'bed_9', wardId: 'wrd_4', wardName: 'ICU', bedNumber: 'ICU-02', status: 'Maintenance', dailyRate: 9000, ...seedAudit(90) },
  { id: 'bed_10', wardId: 'wrd_5', wardName: 'NICU', bedNumber: 'N-01', status: 'Available', dailyRate: 7500, ...seedAudit(90) },
]

export const mockAdmissions: Admission[] = [
  {
    id: 'adm_1', patientId: 'pat_1', patientName: 'Ramesh Kulkarni', bedId: 'bed_1', bedLabel: 'A-101 · General Ward A',
    admittingDoctor: 'Dr. Rohit Verma', admissionDate: '2026-07-10', diagnosis: 'Acute coronary syndrome, under observation',
    status: 'Admitted', ...seedAudit(3),
  },
  {
    id: 'adm_2', patientId: 'pat_7', patientName: 'Manoj Pillai', bedId: 'bed_4', bedLabel: 'B-201 · Semi-Private B',
    admittingDoctor: 'Dr. Sanjay Bhat', admissionDate: '2026-07-11', diagnosis: 'Post-operative recovery — appendectomy',
    status: 'Admitted', ...seedAudit(2),
  },
  {
    id: 'adm_3', patientId: 'pat_5', patientName: 'Vikram Singh', bedId: 'bed_8', bedLabel: 'ICU-01 · ICU',
    admittingDoctor: 'Dr. Rohit Verma', admissionDate: '2026-07-12', diagnosis: 'Severe pneumonia, on ventilator support',
    status: 'Admitted', ...seedAudit(1),
  },
  {
    id: 'adm_4', patientId: 'pat_4', patientName: 'Fatima Ansari', bedId: 'bed_6', bedLabel: 'P-301 · Private Suites',
    admittingDoctor: 'Dr. Kavya Rao', admissionDate: '2026-06-28', dischargeDate: '2026-07-02',
    diagnosis: 'Elective gall bladder surgery', status: 'Discharged', ...seedAudit(11),
  },
]
