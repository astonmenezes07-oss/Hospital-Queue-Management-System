// ===== Queue Manager =====
// Business logic wrapper around MaxHeapPriorityQueue

import { MaxHeapPriorityQueue } from './priority-queue.js';
import { calculatePriority, recalculatePriority } from './priority-calculator.js';
import { Store } from '../data/store.js';

class QueueManagerClass {
  constructor() {
    this.queue = new MaxHeapPriorityQueue();
    this.rebalanceInterval = null;
    this.AVG_TREATMENT_MINUTES = 15;
  }

  // Initialize queue from stored data
  init() {
    const stored = Store.get('queue') || [];
    const activePatients = stored.filter(p => p.status === 'waiting' || p.status === 'in_queue');
    this.queue.buildFrom(activePatients);

    // Auto-rebalance every 60 seconds
    this.startAutoRebalance();
  }

  // Add a patient to the queue
  addPatient(patientData) {
    const priority = calculatePriority(patientData);

    const queueEntry = {
      id: patientData.id || this._generateId(),
      patientId: patientData.patientId || patientData.id,
      fullName: patientData.fullName,
      age: patientData.age,
      symptoms: patientData.symptoms || [],
      symptomText: patientData.symptomText || '',
      vitalSigns: patientData.vitalSigns || {},
      preExistingConditions: patientData.preExistingConditions || [],
      department: patientData.department || 'General Medicine',
      priorityScore: priority.score,
      category: priority.category,
      assessment: priority.assessment,
      breakdown: priority.breakdown,
      arrivalTime: patientData.arrivalTime || new Date().toISOString(),
      status: 'in_queue',
      assignedDoctor: null,
      appointmentId: patientData.appointmentId || null,
    };

    this.queue.insert(queueEntry);
    this._persist();

    // Add notification
    this._addNotification(queueEntry.patientId, {
      type: 'queue_update',
      title: 'Added to Queue',
      message: `You have been placed in the ${priority.category.replace('_', '-').toLowerCase()} queue. Priority score: ${priority.score}`,
      timestamp: new Date().toISOString()
    });

    return queueEntry;
  }

  // Call the next patient (highest priority)
  callNextPatient(doctorName) {
    const patient = this.queue.extractMax();
    if (!patient) return null;

    patient.status = 'being_treated';
    patient.assignedDoctor = doctorName || 'Dr. Available';
    patient.calledAt = new Date().toISOString();

    // Update in medical history
    this._addToHistory(patient);

    // Update doctor status
    this._updateDoctorStatus(doctorName, 'busy');

    this._persist();

    // Notify patient
    this._addNotification(patient.patientId, {
      type: 'called',
      title: 'You\'re Next!',
      message: `Please proceed to ${patient.assignedDoctor}'s office. You are being called for treatment.`,
      timestamp: new Date().toISOString()
    });

    return patient;
  }

  // Complete treatment for a patient
  completePatient(patientId, doctorName) {
    const allQueue = Store.get('queue') || [];
    const patient = allQueue.find(p => p.patientId === patientId && p.status === 'being_treated');
    if (patient) {
      patient.status = 'completed';
      patient.completedAt = new Date().toISOString();
      Store.set('queue', allQueue);
    }

    // Free doctor
    this._updateDoctorStatus(doctorName, 'available');

    return patient;
  }

  // Update a patient's priority
  updatePatientPriority(patientId, newData) {
    const patient = this.queue.find(patientId);
    if (!patient) return null;

    // Merge new data
    Object.assign(patient, newData);

    // Recalculate priority
    const newScore = recalculatePriority(patient);
    this.queue.updatePriority(patientId, newScore);
    patient.priorityScore = newScore;

    this._persist();

    this._addNotification(patient.patientId, {
      type: 'priority_change',
      title: 'Priority Updated',
      message: `Your priority has been updated to ${newScore}. Category: ${patient.category}`,
      timestamp: new Date().toISOString()
    });

    return patient;
  }

  // Remove a patient from queue
  removePatient(patientId) {
    const removed = this.queue.remove(patientId);
    if (removed) {
      removed.status = 'removed';
      this._persist();
    }
    return removed;
  }

  // Rebalance the entire queue (recalculate all priorities with updated wait times)
  rebalanceQueue() {
    const patients = this.queue.toArray();
    for (const patient of patients) {
      const newScore = recalculatePriority(patient);
      const newPriority = calculatePriority(patient);
      patient.priorityScore = newScore;
      patient.category = newPriority.category;
    }
    this.queue.buildFrom(patients);
    this._persist();
  }

  // Get queue for display (sorted array)
  getQueueSnapshot() {
    return this.queue.toSortedArray();
  }

  // Get patient's position in queue
  getPatientPosition(patientId) {
    const sorted = this.queue.toSortedArray();
    const index = sorted.findIndex(p => p.id === patientId || p.patientId === patientId);
    return index === -1 ? null : index + 1;
  }

  // Get estimated wait time for a patient
  getEstimatedWaitTime(patientId) {
    const position = this.getPatientPosition(patientId);
    if (position === null) return null;
    return (position - 1) * this.AVG_TREATMENT_MINUTES;
  }

  // Get patient's queue entry
  getPatientQueueEntry(patientId) {
    const sorted = this.queue.toSortedArray();
    return sorted.find(p => p.patientId === patientId) || null;
  }

  // Get queue statistics
  getStats() {
    const snapshot = this.queue.toSortedArray();
    const allQueue = Store.get('queue') || [];
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const treated = allQueue.filter(p => p.status === 'completed' && new Date(p.completedAt) >= todayStart);
    const emergency = snapshot.filter(p => p.category === 'EMERGENCY');
    const priority = snapshot.filter(p => p.category === 'PRIORITY');
    const nonUrgent = snapshot.filter(p => p.category === 'NON_URGENT');

    return {
      totalInQueue: snapshot.length,
      emergencyCount: emergency.length,
      priorityCount: priority.length,
      nonUrgentCount: nonUrgent.length,
      treatedToday: treated.length,
      avgWaitTime: snapshot.length > 0
        ? Math.round(snapshot.reduce((sum, p) => {
          const wait = (Date.now() - new Date(p.arrivalTime).getTime()) / (1000 * 60);
          return sum + wait;
        }, 0) / snapshot.length)
        : 0,
    };
  }

  // Get queue by department
  getQueueByDepartment(department) {
    return this.queue.toSortedArray().filter(p => p.department === department);
  }

  // Get emergency patients
  getEmergencyPatients() {
    return this.queue.toSortedArray().filter(p => p.category === 'EMERGENCY');
  }

  // Start auto-rebalancing
  startAutoRebalance() {
    if (this.rebalanceInterval) clearInterval(this.rebalanceInterval);
    this.rebalanceInterval = setInterval(() => {
      this.rebalanceQueue();
    }, 60000); // Every 60 seconds
  }

  // Stop auto-rebalancing
  stopAutoRebalance() {
    if (this.rebalanceInterval) {
      clearInterval(this.rebalanceInterval);
      this.rebalanceInterval = null;
    }
  }

  // --- Internal helpers ---

  _persist() {
    const active = this.queue.toArray();
    const allQueue = Store.get('queue') || [];

    // Keep completed/removed entries, replace active ones
    const nonActive = allQueue.filter(p => p.status !== 'in_queue' && p.status !== 'waiting');
    Store.set('queue', [...nonActive, ...active]);
  }

  _generateId() {
    return 'Q' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  _addNotification(patientId, notification) {
    const notifications = Store.get('notifications') || {};
    if (!notifications[patientId]) notifications[patientId] = [];
    notifications[patientId].unshift({ id: this._generateId(), ...notification, read: false });
    // Keep only last 20 notifications per patient
    notifications[patientId] = notifications[patientId].slice(0, 20);
    Store.set('notifications', notifications);
  }

  _addToHistory(patient) {
    const history = Store.get('medicalHistory') || {};
    if (!history[patient.patientId]) history[patient.patientId] = [];
    history[patient.patientId].unshift({
      id: this._generateId(),
      date: new Date().toISOString(),
      department: patient.department,
      symptoms: patient.symptomText || patient.symptoms.join(', '),
      priority: patient.category,
      score: patient.priorityScore,
      doctor: patient.assignedDoctor,
      status: 'in_progress'
    });
    Store.set('medicalHistory', history);
  }

  _updateDoctorStatus(doctorName, status) {
    if (!doctorName) return;
    const doctors = Store.get('doctors') || [];
    const doctor = doctors.find(d => d.name === doctorName);
    if (doctor) {
      doctor.status = status;
      Store.set('doctors', doctors);
    }
  }
}

// Singleton export
export const QueueManager = new QueueManagerClass();
