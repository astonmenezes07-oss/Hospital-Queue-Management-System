// ===== Appointment Booking Page =====

import { Icons, escapeHtml, generateId, getTimeSlots, getTodayString, getPriorityDisplay } from '../utils/helpers.js';
import { Auth } from '../auth.js';
import { Router } from '../router.js';
import { Store } from '../data/store.js';
import { QueueManager } from '../core/queue-manager.js';
import { predictPriorityFromSymptoms } from '../core/triage.js';
import { showToast } from '../utils/notifications.js';

export function renderAppointment(container) {
  const user = Auth.getCurrentUser();
  if (!user) { Router.navigate('/login'); return; }

  let step = 1;
  let selectedDepartment = null;
  let symptomsText = '';
  let selectedDate = '';
  let selectedTime = '';
  let prediction = null;

  const departments = Store.getAll('departments');
  const doctors = Store.getAll('doctors');

  function render() {
    container.innerHTML = `
      <nav class="public-topbar">
        <a href="#/patient" class="public-topbar-logo">
          ${Icons.heartPulse}
          <span>Medi<span class="logo-highlight">Queue</span></span>
        </a>
        <div class="public-topbar-actions">
          <a href="#/patient" class="btn btn-ghost">← Back to Dashboard</a>
        </div>
      </nav>

      <div class="auth-page" style="background:var(--bg-body);align-items:flex-start;">
        <div style="width:100%;max-width:720px;margin:calc(var(--topbar-height) + var(--space-10)) auto var(--space-10);padding:0 var(--space-6);">
          <div class="page-header" style="text-align:center;">
            <h1>${Icons.calendar} Book an Appointment</h1>
            <p>Follow the steps to schedule your visit and get an automatic priority assessment.</p>
          </div>

          <!-- Stepper -->
          <div class="stepper">
            <div class="stepper-step ${step >= 1 ? (step > 1 ? 'completed' : 'active') : ''}">
              <div class="stepper-number">${step > 1 ? Icons.check : '1'}</div>
              <span>Department</span>
            </div>
            <div class="stepper-line ${step > 1 ? 'completed' : ''}"></div>
            <div class="stepper-step ${step >= 2 ? (step > 2 ? 'completed' : 'active') : ''}">
              <div class="stepper-number">${step > 2 ? Icons.check : '2'}</div>
              <span>Symptoms</span>
            </div>
            <div class="stepper-line ${step > 2 ? 'completed' : ''}"></div>
            <div class="stepper-step ${step >= 3 ? (step > 3 ? 'completed' : 'active') : ''}">
              <div class="stepper-number">${step > 3 ? Icons.check : '3'}</div>
              <span>Schedule</span>
            </div>
            <div class="stepper-line ${step > 3 ? 'completed' : ''}"></div>
            <div class="stepper-step ${step >= 4 ? 'active' : ''}">
              <div class="stepper-number">4</div>
              <span>Confirm</span>
            </div>
          </div>

          <!-- Step Content -->
          <div class="card">
            ${renderStep()}
          </div>
        </div>
      </div>
    `;
    attachEvents();
  }

  function renderStep() {
    switch (step) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return '';
    }
  }

  function renderStep1() {
    return `
      <div class="booking-step">
        <h3 style="margin-bottom:var(--space-6);">Select Department</h3>
        <div class="department-grid">
          ${departments.map(dept => `
            <div class="department-card ${selectedDepartment === dept.name ? 'selected' : ''}" data-dept="${dept.name}">
              <div class="department-card-icon">${getDeptIcon(dept.icon)}</div>
              <h5>${escapeHtml(dept.name)}</h5>
              <p>${escapeHtml(dept.description)}</p>
            </div>
          `).join('')}
        </div>
        <div class="card-footer" style="justify-content:flex-end;">
          <button class="btn btn-primary" id="step1-next" ${!selectedDepartment ? 'disabled' : ''}>
            Next: Enter Symptoms ${Icons.arrowRight}
          </button>
        </div>
      </div>
    `;
  }

  function renderStep2() {
    prediction = symptomsText ? predictPriorityFromSymptoms(symptomsText) : null;
    const pd = prediction ? getPriorityDisplay(prediction.category) : null;

    return `
      <div class="booking-step">
        <h3 style="margin-bottom:var(--space-2);">Describe Your Symptoms</h3>
        <p style="margin-bottom:var(--space-6);font-size:var(--font-size-sm);color:var(--text-muted);">Describe your symptoms in detail. Our system will automatically estimate your priority level.</p>

        <div class="form-group" style="margin-bottom:var(--space-6);">
          <label class="form-label">What symptoms are you experiencing?</label>
          <textarea class="form-textarea" id="symptoms-input" rows="4" placeholder="e.g., Severe headache, chest pain, difficulty breathing, high fever for 3 days...">${escapeHtml(symptomsText)}</textarea>
          <div class="form-hint">Be as specific as possible for accurate triage assessment</div>
        </div>

        ${prediction ? `
          <div class="alert alert-${prediction.category === 'EMERGENCY' ? 'emergency' : prediction.category === 'PRIORITY' ? 'warning' : 'info'}" style="margin-bottom:var(--space-4);">
            ${prediction.category === 'EMERGENCY' ? Icons.alertTriangle : Icons.activity}
            <div>
              <strong>Predicted Priority: <span class="badge ${pd.badge}">${pd.label}</span></strong>
              <div style="font-size:var(--font-size-xs);margin-top:4px;">
                Triage Score: ${prediction.triageScore}/100
                ${prediction.matchedSymptoms.length > 0 ? ` — Detected: ${prediction.matchedSymptoms.map(s => s.label).join(', ')}` : ''}
              </div>
              ${prediction.recommendations.length > 0 ? `<div style="font-size:var(--font-size-xs);margin-top:4px;">${prediction.recommendations[0]}</div>` : ''}
            </div>
          </div>
        ` : ''}

        <div style="display:flex;gap:var(--space-3);flex-wrap:wrap;margin-bottom:var(--space-4);">
          <span style="font-size:var(--font-size-xs);color:var(--text-muted);width:100%;">Quick add:</span>
          ${['Chest pain', 'High fever', 'Difficulty breathing', 'Headache', 'Fracture', 'Bleeding', 'Vomiting', 'Regular checkup'].map(s => `
            <span class="chip quick-symptom" data-symptom="${s}">${s}</span>
          `).join('')}
        </div>

        <div class="card-footer" style="justify-content:space-between;">
          <button class="btn btn-ghost" id="step2-back">&larr; Back</button>
          <button class="btn btn-primary" id="step2-next" ${!symptomsText.trim() ? 'disabled' : ''}>
            Next: Schedule ${Icons.arrowRight}
          </button>
        </div>
      </div>
    `;
  }

  function renderStep3() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const todayStr = getTodayString();
    const dateToShow = selectedDate || todayStr;
    const slots = getTimeSlots(dateToShow);

    const deptDoctors = doctors.filter(d => d.department === selectedDepartment && d.status === 'available');

    return `
      <div class="booking-step">
        <h3 style="margin-bottom:var(--space-6);">Choose Date & Time</h3>

        <div class="form-group" style="margin-bottom:var(--space-6);">
          <label class="form-label">Select Date</label>
          <input type="date" class="form-input" id="date-input" min="${todayStr}" value="${dateToShow}">
        </div>

        <div style="margin-bottom:var(--space-6);">
          <label class="form-label" style="margin-bottom:var(--space-3);">Available Time Slots</label>
          <div class="time-slots">
            ${slots.map(s => `
              <div class="time-slot ${s.available ? '' : 'disabled'} ${selectedTime === s.time ? 'selected' : ''}" 
                   data-time="${s.time}" ${!s.available ? 'aria-disabled="true"' : ''}>
                ${s.time}
              </div>
            `).join('')}
          </div>
        </div>

        ${deptDoctors.length > 0 ? `
          <div style="margin-bottom:var(--space-4);">
            <label class="form-label" style="margin-bottom:var(--space-3);">Available Doctors in ${selectedDepartment}</label>
            <div style="display:flex;gap:var(--space-3);flex-wrap:wrap;">
              ${deptDoctors.map(doc => `
                <div class="doctor-card" style="flex:1;min-width:200px;">
                  <div class="avatar">${doc.avatar}</div>
                  <div class="doctor-card-info">
                    <div class="doctor-card-name">${escapeHtml(doc.name)}</div>
                    <div class="doctor-card-dept">${escapeHtml(doc.specialization)}</div>
                  </div>
                  <div class="doctor-status-indicator available">Available</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div class="card-footer" style="justify-content:space-between;">
          <button class="btn btn-ghost" id="step3-back">&larr; Back</button>
          <button class="btn btn-primary" id="step3-next" ${!selectedTime ? 'disabled' : ''}>
            Next: Review ${Icons.arrowRight}
          </button>
        </div>
      </div>
    `;
  }

  function renderStep4() {
    const pd = prediction ? getPriorityDisplay(prediction.category) : getPriorityDisplay('NON_URGENT');
    const deptDoctor = doctors.find(d => d.department === selectedDepartment && d.status === 'available');
    const doctorName = deptDoctor ? deptDoctor.name : 'Next Available Doctor';

    return `
      <div class="booking-step">
        <h3 style="margin-bottom:var(--space-6);">Confirm Your Appointment</h3>

        <div style="background:var(--color-gray-50);border-radius:var(--radius-lg);padding:var(--space-6);margin-bottom:var(--space-6);">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);">
            <div>
              <div style="font-size:var(--font-size-xs);color:var(--text-muted);margin-bottom:2px;">Patient</div>
              <div style="font-weight:var(--font-weight-medium);">${escapeHtml(user.fullName)}</div>
            </div>
            <div>
              <div style="font-size:var(--font-size-xs);color:var(--text-muted);margin-bottom:2px;">Department</div>
              <div style="font-weight:var(--font-weight-medium);">${escapeHtml(selectedDepartment)}</div>
            </div>
            <div>
              <div style="font-size:var(--font-size-xs);color:var(--text-muted);margin-bottom:2px;">Date & Time</div>
              <div style="font-weight:var(--font-weight-medium);">${selectedDate || getTodayString()} at ${selectedTime}</div>
            </div>
            <div>
              <div style="font-size:var(--font-size-xs);color:var(--text-muted);margin-bottom:2px;">Doctor</div>
              <div style="font-weight:var(--font-weight-medium);">${escapeHtml(doctorName)}</div>
            </div>
            <div style="grid-column:span 2;">
              <div style="font-size:var(--font-size-xs);color:var(--text-muted);margin-bottom:2px;">Symptoms</div>
              <div style="font-size:var(--font-size-sm);">${escapeHtml(symptomsText)}</div>
            </div>
            <div style="grid-column:span 2;">
              <div style="font-size:var(--font-size-xs);color:var(--text-muted);margin-bottom:2px;">Estimated Priority</div>
              <span class="badge ${pd.badge} badge-dot">${pd.label}</span>
              ${prediction ? `<span style="font-size:var(--font-size-xs);color:var(--text-muted);margin-left:var(--space-2);">Score: ${prediction.triageScore}/100</span>` : ''}
            </div>
          </div>
        </div>

        ${prediction && prediction.category === 'EMERGENCY' ? `
          <div class="alert alert-emergency" style="margin-bottom:var(--space-4);">
            ${Icons.alertTriangle}
            <div>
              <strong>Emergency Detected!</strong>
              <div style="font-size:var(--font-size-xs);margin-top:2px;">Based on your symptoms, you will be placed in the emergency queue for immediate attention upon arrival.</div>
            </div>
          </div>
        ` : ''}

        <div class="card-footer" style="justify-content:space-between;">
          <button class="btn btn-ghost" id="step4-back">&larr; Back</button>
          <button class="btn btn-primary btn-lg" id="confirm-booking">
            ${Icons.check} Confirm Appointment
          </button>
        </div>
      </div>
    `;
  }

  function getDeptIcon(icon) {
    const map = {
      'alert-triangle': Icons.alertTriangle,
      'heart': Icons.heartPulse,
      'bone': Icons.activity,
      'stethoscope': Icons.stethoscope,
      'baby': Icons.users,
      'brain': Icons.activity,
    };
    return map[icon] || Icons.stethoscope;
  }

  function attachEvents() {
    // Step 1: Department selection
    document.querySelectorAll('.department-card').forEach(card => {
      card.addEventListener('click', () => {
        selectedDepartment = card.dataset.dept;
        render();
      });
    });

    // Step 1 next
    document.getElementById('step1-next')?.addEventListener('click', () => { step = 2; render(); });

    // Step 2: Symptoms
    document.getElementById('symptoms-input')?.addEventListener('input', (e) => {
      symptomsText = e.target.value;
      prediction = symptomsText.trim() ? predictPriorityFromSymptoms(symptomsText) : null;
      // Update prediction display without full re-render
      const nextBtn = document.getElementById('step2-next');
      if (nextBtn) nextBtn.disabled = !symptomsText.trim();
    });

    // Quick symptom chips
    document.querySelectorAll('.quick-symptom').forEach(chip => {
      chip.addEventListener('click', () => {
        const symptom = chip.dataset.symptom;
        const input = document.getElementById('symptoms-input');
        if (input) {
          symptomsText = input.value ? input.value + ', ' + symptom : symptom;
          input.value = symptomsText;
          prediction = predictPriorityFromSymptoms(symptomsText);
          render(); // Re-render to show prediction
        }
      });
    });

    // Step 2 navigation
    document.getElementById('step2-back')?.addEventListener('click', () => { step = 1; render(); });
    document.getElementById('step2-next')?.addEventListener('click', () => {
      symptomsText = document.getElementById('symptoms-input')?.value || symptomsText;
      prediction = symptomsText.trim() ? predictPriorityFromSymptoms(symptomsText) : null;
      step = 3;
      render();
    });

    // Step 3: Date
    document.getElementById('date-input')?.addEventListener('change', (e) => {
      selectedDate = e.target.value;
      selectedTime = '';
      render();
    });

    // Time slots
    document.querySelectorAll('.time-slot:not(.disabled)').forEach(slot => {
      slot.addEventListener('click', () => {
        selectedTime = slot.dataset.time;
        render();
      });
    });

    // Step 3 navigation
    document.getElementById('step3-back')?.addEventListener('click', () => { step = 2; render(); });
    document.getElementById('step3-next')?.addEventListener('click', () => { step = 4; render(); });

    // Step 4: Back
    document.getElementById('step4-back')?.addEventListener('click', () => { step = 3; render(); });

    // Confirm booking
    document.getElementById('confirm-booking')?.addEventListener('click', () => {
      const deptDoctor = doctors.find(d => d.department === selectedDepartment && d.status === 'available');
      const doctorName = deptDoctor ? deptDoctor.name : 'Next Available Doctor';

      // Create appointment
      const appointment = {
        id: generateId('APT_'),
        patientId: user.id,
        patientName: user.fullName,
        department: selectedDepartment,
        doctor: doctorName,
        date: selectedDate || getTodayString(),
        time: selectedTime,
        symptoms: symptomsText,
        status: 'confirmed',
        createdAt: new Date().toISOString()
      };
      Store.add('appointments', appointment);

      // Add to queue
      QueueManager.addPatient({
        patientId: user.id,
        fullName: user.fullName,
        age: user.age || 30,
        symptoms: prediction?.matchedSymptoms?.map(s => s.id) || [],
        symptomText: symptomsText,
        vitalSigns: {},
        preExistingConditions: user.preExistingConditions || [],
        department: selectedDepartment,
        appointmentId: appointment.id,
      });

      showToast('success', 'Appointment Booked!', `Your appointment has been confirmed for ${appointment.date} at ${appointment.time}.`);
      Router.navigate('/patient');
    });
  }

  render();
}
