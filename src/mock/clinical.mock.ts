import type { Consultation, Prescription } from '@/types'
import { seedAudit } from './audit'
import { relativeDate } from './dates'

export const mockConsultations: Consultation[] = [
  {
    id: 'con_1', patientId: 'pat_1', patientName: 'Ramesh Kulkarni', doctorName: 'Dr. Rohit Verma',
    date: relativeDate(0), department: 'Cardiology',
    vitals: { tempF: 98.6, pulse: 84, bp: '138/88', spo2: 97, weightKg: 78, heightCm: 172 },
    complaints: 'Chest tightness on exertion, follow-up post ACS admission',
    diagnosis: 'Stable angina', advice: 'Continue medication, low-salt diet, review in 2 weeks',
    followUpDate: relativeDate(14), status: 'Finalized', ...seedAudit(0),
  },
  {
    id: 'con_2', patientId: 'pat_3', patientName: 'Arjun Reddy', doctorName: 'Dr. Rohit Verma',
    date: relativeDate(0), department: 'Orthopaedics',
    vitals: { tempF: 98.2, pulse: 76, bp: '118/76', spo2: 99 },
    complaints: 'Right knee pain after sports injury',
    diagnosis: 'Grade II MCL sprain', advice: 'RICE protocol, physiotherapy referral',
    status: 'Finalized', ...seedAudit(0),
  },
  {
    id: 'con_3', patientId: 'pat_4', patientName: 'Fatima Ansari', doctorName: 'Dr. Sanjay Bhat',
    date: relativeDate(0), department: 'General Medicine',
    vitals: { tempF: 99.1, pulse: 90, bp: '128/82', spo2: 96 },
    complaints: 'Fever and body ache for 3 days', diagnosis: 'Viral fever',
    advice: 'Rest, hydration, antipyretics', status: 'Finalized', ...seedAudit(0),
  },
  {
    id: 'con_4', patientId: 'pat_6', patientName: 'Neha Kapoor', doctorName: 'Dr. Sanjay Bhat',
    date: relativeDate(-1), department: 'ENT',
    vitals: { tempF: 98.4, pulse: 72, bp: '110/70', spo2: 99 },
    complaints: 'Recurrent sinus congestion', diagnosis: 'Chronic sinusitis',
    advice: 'Nasal irrigation, course of antibiotics', status: 'Draft', ...seedAudit(1),
  },
]

export const mockPrescriptions: Prescription[] = [
  {
    id: 'rx_1', consultationId: 'con_1', patientId: 'pat_1', patientName: 'Ramesh Kulkarni',
    doctorName: 'Dr. Rohit Verma', date: relativeDate(0),
    items: [
      { drugId: 'drg_1', drugName: 'Atorvastatin 20mg', dosage: '1 tablet', frequency: 'OD (night)', durationDays: 30, quantity: 30 },
      { drugId: 'drg_2', drugName: 'Metoprolol 25mg', dosage: '1 tablet', frequency: 'BD', durationDays: 30, quantity: 60 },
    ],
    status: 'Pending', ...seedAudit(0),
  },
  {
    id: 'rx_2', consultationId: 'con_2', patientId: 'pat_3', patientName: 'Arjun Reddy',
    doctorName: 'Dr. Rohit Verma', date: relativeDate(0),
    items: [
      { drugId: 'drg_3', drugName: 'Ibuprofen 400mg', dosage: '1 tablet', frequency: 'TDS after food', durationDays: 5, quantity: 15 },
    ],
    status: 'Pending', ...seedAudit(0),
  },
  {
    id: 'rx_3', consultationId: 'con_3', patientId: 'pat_4', patientName: 'Fatima Ansari',
    doctorName: 'Dr. Sanjay Bhat', date: relativeDate(0),
    items: [
      { drugId: 'drg_4', drugName: 'Paracetamol 650mg', dosage: '1 tablet', frequency: 'QID', durationDays: 3, quantity: 12 },
      { drugId: 'drg_5', drugName: 'Amoxicillin 500mg', dosage: '1 capsule', frequency: 'TDS', durationDays: 5, quantity: 15 },
    ],
    status: 'Dispensed', ...seedAudit(0),
  },
]
