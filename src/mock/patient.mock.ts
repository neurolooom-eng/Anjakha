import type { Appointment, Patient } from '@/types'
import { seedAudit } from './audit'

export const mockPatients: Patient[] = [
  {
    id: 'pat_1', uhid: 'ANJ-2026-0001', name: 'Ramesh Kulkarni', gender: 'Male', dob: '1978-04-12',
    phone: '+91 98200 11223', email: 'ramesh.k@example.com', address: 'Andheri West, Mumbai',
    bloodGroup: 'B+', category: 'Insurance', allergies: 'Penicillin', emergencyContact: '+91 98200 99887',
    status: 'Active', ...seedAudit(40),
  },
  {
    id: 'pat_2', uhid: 'ANJ-2026-0002', name: 'Sunita Deshmukh', gender: 'Female', dob: '1990-09-02',
    phone: '+91 98221 44556', address: 'Kothrud, Pune', bloodGroup: 'O+', category: 'General',
    status: 'Active', ...seedAudit(35),
  },
  {
    id: 'pat_3', uhid: 'ANJ-2026-0003', name: 'Arjun Reddy', gender: 'Male', dob: '2001-01-20',
    phone: '+91 90000 12121', address: 'Banjara Hills, Hyderabad', bloodGroup: 'A+', category: 'Corporate',
    status: 'Active', ...seedAudit(30),
  },
  {
    id: 'pat_4', uhid: 'ANJ-2026-0004', name: 'Fatima Ansari', gender: 'Female', dob: '1965-11-30',
    phone: '+91 98765 43210', address: 'Salt Lake, Kolkata', bloodGroup: 'AB-', category: 'Government Scheme',
    allergies: 'Sulfa drugs', status: 'Active', ...seedAudit(20),
  },
  {
    id: 'pat_5', uhid: 'ANJ-2026-0005', name: 'Vikram Singh', gender: 'Male', dob: '1985-06-18',
    phone: '+91 99887 76655', address: 'Sector 21, Chandigarh', bloodGroup: 'B-', category: 'Insurance',
    status: 'Active', ...seedAudit(15),
  },
  {
    id: 'pat_6', uhid: 'ANJ-2026-0006', name: 'Neha Kapoor', gender: 'Female', dob: '1996-03-05',
    phone: '+91 91234 56789', address: 'Indiranagar, Bengaluru', bloodGroup: 'O-', category: 'General',
    status: 'Active', ...seedAudit(8),
  },
  {
    id: 'pat_7', uhid: 'ANJ-2026-0007', name: 'Manoj Pillai', gender: 'Male', dob: '1972-12-25',
    phone: '+91 90909 08080', address: 'Fort Kochi, Kerala', bloodGroup: 'A-', category: 'Insurance',
    allergies: 'Latex', status: 'Active', ...seedAudit(5),
  },
  {
    id: 'pat_8', uhid: 'ANJ-2026-0008', name: 'Divya Menon', gender: 'Female', dob: '2010-07-14',
    phone: '+91 93456 78901', address: 'Anna Nagar, Chennai', bloodGroup: 'B+', category: 'Corporate',
    status: 'Active', ...seedAudit(2),
  },
]

export const mockAppointments: Appointment[] = [
  { id: 'apt_1', patientId: 'pat_1', patientName: 'Ramesh Kulkarni', doctorName: 'Dr. Rohit Verma', department: 'Cardiology', date: '2026-07-13', time: '09:30', type: 'Follow-up', status: 'Checked In', tokenNo: 1, ...seedAudit(1) },
  { id: 'apt_2', patientId: 'pat_2', patientName: 'Sunita Deshmukh', doctorName: 'Dr. Kavya Rao', department: 'Gynaecology', date: '2026-07-13', time: '10:00', type: 'New', status: 'Scheduled', tokenNo: 1, ...seedAudit(1) },
  { id: 'apt_3', patientId: 'pat_3', patientName: 'Arjun Reddy', doctorName: 'Dr. Rohit Verma', department: 'Orthopaedics', date: '2026-07-13', time: '10:30', type: 'New', status: 'In Consultation', tokenNo: 2, ...seedAudit(1) },
  { id: 'apt_4', patientId: 'pat_4', patientName: 'Fatima Ansari', doctorName: 'Dr. Sanjay Bhat', department: 'General Medicine', date: '2026-07-13', time: '11:00', type: 'Follow-up', status: 'Completed', tokenNo: 1, ...seedAudit(1) },
  { id: 'apt_5', patientId: 'pat_5', patientName: 'Vikram Singh', doctorName: 'Dr. Kavya Rao', department: 'Dermatology', date: '2026-07-14', time: '09:00', type: 'New', status: 'Scheduled', tokenNo: 1, ...seedAudit(0) },
  { id: 'apt_6', patientId: 'pat_6', patientName: 'Neha Kapoor', doctorName: 'Dr. Sanjay Bhat', department: 'ENT', date: '2026-07-14', time: '09:45', type: 'New', status: 'Scheduled', tokenNo: 1, ...seedAudit(0) },
  { id: 'apt_7', patientId: 'pat_7', patientName: 'Manoj Pillai', doctorName: 'Dr. Rohit Verma', department: 'Cardiology', date: '2026-07-12', time: '15:00', type: 'Follow-up', status: 'No Show', tokenNo: 1, ...seedAudit(2) },
  { id: 'apt_8', patientId: 'pat_8', patientName: 'Divya Menon', doctorName: 'Dr. Kavya Rao', department: 'Paediatrics', date: '2026-07-12', time: '16:00', type: 'New', status: 'Cancelled', tokenNo: 1, ...seedAudit(2) },
]
