import type { Doctor } from '@/types'
import { seedAudit } from './audit'

export const mockDoctors: Doctor[] = [
  {
    id: 'doc_1', name: 'Dr. Rohit Verma', department: 'Cardiology', qualification: 'MD, DM Cardiology',
    registrationNo: 'MCI-88231', phone: '+91 98100 22334', email: 'rohit.verma@anjakha.in',
    consultationFee: 800, status: 'Active', ...seedAudit(200),
  },
  {
    id: 'doc_2', name: 'Dr. Kavya Rao', department: 'Gynaecology', qualification: 'MBBS, MS Obstetrics & Gynaecology',
    registrationNo: 'MCI-77120', phone: '+91 98200 44556', email: 'kavya.rao@anjakha.in',
    consultationFee: 700, status: 'Active', ...seedAudit(180),
  },
  {
    id: 'doc_3', name: 'Dr. Sanjay Bhat', department: 'General Medicine', qualification: 'MBBS, MD Internal Medicine',
    registrationNo: 'MCI-65010', phone: '+91 98300 66778', email: 'sanjay.bhat@anjakha.in',
    consultationFee: 500, status: 'Active', ...seedAudit(150),
  },
]
