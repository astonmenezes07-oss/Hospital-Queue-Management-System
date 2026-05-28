// ===== Seed Data =====
// Pre-populates the system on first load

import { Store } from './store.js';
import { hashPassword } from '../utils/crypto.js';

export async function seedData() {
  if (Store.isInitialized()) return;

  // --- Admin Accounts ---
  const admins = [
    {
      id: 'ADMIN001',
      adminId: 'ADMIN001',
      password: await hashPassword('admin123'),
      fullName: 'Dr. Sarah Mitchell',
      role: 'admin',
      department: 'Emergency Medicine',
      createdAt: new Date().toISOString()
    },
    {
      id: 'ADMIN002',
      adminId: 'ADMIN002',
      password: await hashPassword('admin456'),
      fullName: 'Dr. James Carter',
      role: 'admin',
      department: 'Hospital Administration',
      createdAt: new Date().toISOString()
    }
  ];
  Store.set('admins', admins);

  // --- Departments ---
  const departments = [
    { id: 'dept_emergency', name: 'Emergency', icon: 'alert-triangle', description: 'Critical and life-threatening conditions', color: 'red' },
    { id: 'dept_cardiology', name: 'Cardiology', icon: 'heart', description: 'Heart and cardiovascular conditions', color: 'red' },
    { id: 'dept_orthopedics', name: 'Orthopedics', icon: 'bone', description: 'Bones, joints, and musculoskeletal issues', color: 'blue' },
    { id: 'dept_general', name: 'General Medicine', icon: 'stethoscope', description: 'General health consultations', color: 'teal' },
    { id: 'dept_pediatrics', name: 'Pediatrics', icon: 'baby', description: 'Children and infant care', color: 'green' },
    { id: 'dept_neurology', name: 'Neurology', icon: 'brain', description: 'Brain and nervous system disorders', color: 'navy' },
  ];
  Store.set('departments', departments);

  // --- Doctors ---
  const doctors = [
    // Emergency
    { id: 'doc_001', name: 'Dr. Emily Watson', department: 'Emergency', specialization: 'Emergency Medicine', status: 'available', avatar: 'EW' },
    { id: 'doc_002', name: 'Dr. Robert Chen', department: 'Emergency', specialization: 'Trauma Surgery', status: 'available', avatar: 'RC' },
    { id: 'doc_003', name: 'Dr. Lisa Park', department: 'Emergency', specialization: 'Critical Care', status: 'busy', avatar: 'LP' },
    // Cardiology
    { id: 'doc_004', name: 'Dr. Michael Brooks', department: 'Cardiology', specialization: 'Interventional Cardiology', status: 'available', avatar: 'MB' },
    { id: 'doc_005', name: 'Dr. Amanda Foster', department: 'Cardiology', specialization: 'Electrophysiology', status: 'available', avatar: 'AF' },
    // Orthopedics
    { id: 'doc_006', name: 'Dr. David Kim', department: 'Orthopedics', specialization: 'Sports Medicine', status: 'available', avatar: 'DK' },
    { id: 'doc_007', name: 'Dr. Rachel Adams', department: 'Orthopedics', specialization: 'Joint Replacement', status: 'off-duty', avatar: 'RA' },
    // General Medicine
    { id: 'doc_008', name: 'Dr. Thomas Wright', department: 'General Medicine', specialization: 'Internal Medicine', status: 'available', avatar: 'TW' },
    { id: 'doc_009', name: 'Dr. Jennifer Lee', department: 'General Medicine', specialization: 'Family Medicine', status: 'available', avatar: 'JL' },
    // Pediatrics
    { id: 'doc_010', name: 'Dr. Maria Garcia', department: 'Pediatrics', specialization: 'Pediatric Emergency', status: 'available', avatar: 'MG' },
    { id: 'doc_011', name: 'Dr. Kevin O\'Brien', department: 'Pediatrics', specialization: 'Neonatology', status: 'busy', avatar: 'KO' },
    // Neurology
    { id: 'doc_012', name: 'Dr. Susan Taylor', department: 'Neurology', specialization: 'Stroke Medicine', status: 'available', avatar: 'ST' },
  ];
  Store.set('doctors', doctors);

  // --- Sample patients in queue ---
  const now = Date.now();
  const sampleQueue = [
    {
      id: 'Q_sample_001',
      patientId: 'P_sample_001',
      fullName: 'John Harrison',
      age: 68,
      symptoms: ['chest_pain', 'shortness_breath'],
      symptomText: 'Chest pain and shortness of breath for the last hour',
      vitalSigns: { heartRate: 110, systolicBP: 160, diastolicBP: 95, spo2: 92, temperature: 37.2 },
      preExistingConditions: ['heart_disease', 'hypertension'],
      department: 'Cardiology',
      priorityScore: 82,
      category: 'EMERGENCY',
      arrivalTime: new Date(now - 15 * 60000).toISOString(),
      status: 'in_queue',
      assignedDoctor: null,
      assessment: null, breakdown: null, appointmentId: null,
    },
    {
      id: 'Q_sample_002',
      patientId: 'P_sample_002',
      fullName: 'Maria Santos',
      age: 34,
      symptoms: ['fast_breathing', 'wheezing'],
      symptomText: 'Asthma attack, difficulty breathing, wheezing',
      vitalSigns: { heartRate: 95, spo2: 93 },
      preExistingConditions: ['asthma'],
      department: 'Emergency',
      priorityScore: 65,
      category: 'EMERGENCY',
      arrivalTime: new Date(now - 25 * 60000).toISOString(),
      status: 'in_queue',
      assignedDoctor: null,
      assessment: null, breakdown: null, appointmentId: null,
    },
    {
      id: 'Q_sample_003',
      patientId: 'P_sample_003',
      fullName: 'Robert Wilson',
      age: 45,
      symptoms: [],
      symptomText: 'High fever, severe body ache, weakness for 3 days',
      vitalSigns: { heartRate: 88, temperature: 39.5 },
      preExistingConditions: ['diabetes'],
      department: 'General Medicine',
      priorityScore: 42,
      category: 'PRIORITY',
      arrivalTime: new Date(now - 40 * 60000).toISOString(),
      status: 'in_queue',
      assignedDoctor: null,
      assessment: null, breakdown: null, appointmentId: null,
    },
    {
      id: 'Q_sample_004',
      patientId: 'P_sample_004',
      fullName: 'Sarah Thompson',
      age: 28,
      symptoms: [],
      symptomText: 'Fractured wrist from a fall, moderate pain',
      vitalSigns: {},
      preExistingConditions: [],
      department: 'Orthopedics',
      priorityScore: 35,
      category: 'PRIORITY',
      arrivalTime: new Date(now - 55 * 60000).toISOString(),
      status: 'in_queue',
      assignedDoctor: null,
      assessment: null, breakdown: null, appointmentId: null,
    },
    {
      id: 'Q_sample_005',
      patientId: 'P_sample_005',
      fullName: 'David Chen',
      age: 3,
      symptoms: ['persistent_vomiting', 'lethargy'],
      symptomText: 'Vomiting, lethargic, not eating for 2 days',
      vitalSigns: { heartRate: 120, temperature: 38.8 },
      preExistingConditions: [],
      department: 'Pediatrics',
      priorityScore: 52,
      category: 'PRIORITY',
      arrivalTime: new Date(now - 30 * 60000).toISOString(),
      status: 'in_queue',
      assignedDoctor: null,
      assessment: null, breakdown: null, appointmentId: null,
    },
    {
      id: 'Q_sample_006',
      patientId: 'P_sample_006',
      fullName: 'Emily Rogers',
      age: 55,
      symptoms: [],
      symptomText: 'Mild headache, routine blood pressure check',
      vitalSigns: { systolicBP: 140, diastolicBP: 88 },
      preExistingConditions: ['hypertension'],
      department: 'General Medicine',
      priorityScore: 15,
      category: 'NON_URGENT',
      arrivalTime: new Date(now - 70 * 60000).toISOString(),
      status: 'in_queue',
      assignedDoctor: null,
      assessment: null, breakdown: null, appointmentId: null,
    },
    {
      id: 'Q_sample_007',
      patientId: 'P_sample_007',
      fullName: 'James Park',
      age: 22,
      symptoms: [],
      symptomText: 'Regular checkup, mild cold',
      vitalSigns: {},
      preExistingConditions: [],
      department: 'General Medicine',
      priorityScore: 5,
      category: 'NON_URGENT',
      arrivalTime: new Date(now - 80 * 60000).toISOString(),
      status: 'in_queue',
      assignedDoctor: null,
      assessment: null, breakdown: null, appointmentId: null,
    },
  ];
  Store.set('queue', sampleQueue);

  // --- Sample appointments ---
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);

  const appointments = [
    {
      id: 'APT_001',
      patientId: 'P_sample_006',
      patientName: 'Emily Rogers',
      department: 'General Medicine',
      doctor: 'Dr. Thomas Wright',
      date: tomorrow.toISOString().split('T')[0],
      time: '10:00',
      symptoms: 'Follow-up for blood pressure management',
      status: 'confirmed',
      createdAt: new Date().toISOString()
    },
    {
      id: 'APT_002',
      patientId: 'P_sample_004',
      patientName: 'Sarah Thompson',
      department: 'Orthopedics',
      doctor: 'Dr. David Kim',
      date: dayAfter.toISOString().split('T')[0],
      time: '14:30',
      symptoms: 'Follow-up for wrist fracture',
      status: 'confirmed',
      createdAt: new Date().toISOString()
    },
  ];
  Store.set('appointments', appointments);

  // --- Empty collections ---
  Store.set('users', []);
  Store.set('notifications', {});
  Store.set('medicalHistory', {});

  Store.markInitialized();
  console.log('✅ MediQueue seed data initialized');
}
