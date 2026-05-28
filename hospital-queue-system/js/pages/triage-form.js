// ===== ABCD Triage Assessment Form =====

import { Icons, escapeHtml, getPriorityDisplay } from '../utils/helpers.js';
import { Auth } from '../auth.js';
import { Router } from '../router.js';
import { getSymptomDatabase, assessABCD, getCategoryInfo } from '../core/triage.js';
import { calculatePriority } from '../core/priority-calculator.js';
import { QueueManager } from '../core/queue-manager.js';
import { showToast } from '../utils/notifications.js';

export function renderTriageForm(container) {
  const user = Auth.getCurrentUser();
  if (!user) { Router.navigate('/login'); return; }

  const symptomDB = getSymptomDatabase();
  let selectedSymptoms = new Set();
  let vitalSigns = { heartRate: '', systolicBP: '', diastolicBP: '', spo2: '', temperature: '' };
  let assessment = null;
  let showResults = false;

  function render() {
    if (selectedSymptoms.size > 0 || Object.values(vitalSigns).some(v => v)) {
      assessment = assessABCD(Array.from(selectedSymptoms), '', vitalSigns);
    }

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

      <div style="padding-top:calc(var(--topbar-height) + var(--space-8));max-width:900px;margin:0 auto;padding-left:var(--space-6);padding-right:var(--space-6);padding-bottom:var(--space-12);">
        <div class="page-header" style="text-align:center;">
          <h1>${Icons.clipboardList} ABCD Triage Assessment</h1>
          <p>Complete the emergency assessment checklist based on WHO ETAT guidelines. Select all symptoms that apply.</p>
        </div>

        ${showResults ? renderResults() : renderForm()}
      </div>
    `;
    attachEvents();
  }

  function renderForm() {
    return `
      <!-- ABCD Grid -->
      <div class="abcd-grid" style="margin-bottom:var(--space-6);">
        ${Object.entries(symptomDB).map(([key, category]) => {
          const hasEmergency = category.symptoms.some(s => selectedSymptoms.has(s.id) && s.emergency);
          return `
            <div class="abcd-card ${hasEmergency ? 'has-emergency' : ''}">
              <div class="abcd-letter ${key === 'airway' ? 'a' : key === 'breathing' ? 'b' : key === 'circulation' ? 'c' : 'd'}">
                ${category.letter}
              </div>
              <h4>${category.label}</h4>
              <div class="abcd-symptoms">
                ${category.symptoms.map(symptom => `
                  <label class="form-check">
                    <input type="checkbox" value="${symptom.id}" 
                           ${selectedSymptoms.has(symptom.id) ? 'checked' : ''} 
                           class="symptom-checkbox">
                    <span>${symptom.label} ${symptom.emergency ? '<span style="color:var(--color-danger-500);font-size:var(--font-size-xs);">(EMERGENCY)</span>' : ''}</span>
                  </label>
                `).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Vital Signs -->
      <div class="card" style="margin-bottom:var(--space-6);">
        <div class="card-header">
          <h3 class="card-title">${Icons.activity} Vital Signs (Optional)</h3>
        </div>
        <div class="card-body">
          <p style="font-size:var(--font-size-sm);color:var(--text-muted);margin-bottom:var(--space-4);">Enter vital signs if available for more accurate triage scoring.</p>
          <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(180px, 1fr));gap:var(--space-4);">
            <div class="form-group">
              <label class="form-label">Heart Rate (bpm)</label>
              <input type="number" class="form-input vital-input" id="vital-hr" placeholder="60-100" value="${vitalSigns.heartRate}" min="20" max="250">
            </div>
            <div class="form-group">
              <label class="form-label">Systolic BP (mmHg)</label>
              <input type="number" class="form-input vital-input" id="vital-sbp" placeholder="120" value="${vitalSigns.systolicBP}" min="50" max="300">
            </div>
            <div class="form-group">
              <label class="form-label">Diastolic BP (mmHg)</label>
              <input type="number" class="form-input vital-input" id="vital-dbp" placeholder="80" value="${vitalSigns.diastolicBP}" min="30" max="200">
            </div>
            <div class="form-group">
              <label class="form-label">SpO2 (%)</label>
              <input type="number" class="form-input vital-input" id="vital-spo2" placeholder="95-100" value="${vitalSigns.spo2}" min="50" max="100">
            </div>
            <div class="form-group">
              <label class="form-label">Temperature (°C)</label>
              <input type="number" class="form-input vital-input" id="vital-temp" placeholder="36.5" value="${vitalSigns.temperature}" min="30" max="45" step="0.1">
            </div>
          </div>
        </div>
      </div>

      <!-- Real-time Assessment Preview -->
      ${assessment ? renderAssessmentPreview() : ''}

      <!-- Actions -->
      <div style="display:flex;gap:var(--space-4);justify-content:center;">
        <button class="btn btn-ghost btn-lg" onclick="location.hash='#/patient'">Cancel</button>
        <button class="btn btn-primary btn-lg" id="submit-triage" ${selectedSymptoms.size === 0 ? 'disabled' : ''}>
          ${Icons.check} Complete Assessment & Join Queue
        </button>
      </div>
    `;
  }

  function renderAssessmentPreview() {
    const catInfo = getCategoryInfo(assessment.overallCategory);
    const circumference = 2 * Math.PI * 50;
    const offset = circumference - (assessment.triageScore / 100) * circumference;
    const gaugeColor = assessment.overallCategory === 'EMERGENCY' ? 'var(--color-danger-500)'
      : assessment.overallCategory === 'PRIORITY' ? 'var(--color-warning-500)'
      : 'var(--color-success-500)';

    return `
      <div class="card animate-fade-in" style="margin-bottom:var(--space-6);">
        <div class="card-header">
          <h3 class="card-title">Assessment Preview</h3>
          <span class="badge ${catInfo.badge} badge-dot">${catInfo.label}</span>
        </div>
        <div class="card-body">
          <div style="display:flex;align-items:center;gap:var(--space-8);flex-wrap:wrap;">
            <!-- Gauge -->
            <div class="priority-gauge">
              <svg viewBox="0 0 120 120">
                <circle class="gauge-bg" cx="60" cy="60" r="50" />
                <circle class="gauge-fill" cx="60" cy="60" r="50"
                  stroke="${gaugeColor}"
                  stroke-dasharray="${circumference}"
                  stroke-dashoffset="${offset}" />
              </svg>
              <div style="text-align:center;">
                <div class="priority-gauge-value">${assessment.triageScore}</div>
                <div class="priority-gauge-label">Triage Score</div>
              </div>
            </div>

            <!-- ABCD Summary -->
            <div style="flex:1;display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);">
              ${['airway', 'breathing', 'circulation', 'dehydration'].map(cat => {
                const data = assessment[cat];
                const letter = cat === 'airway' ? 'A' : cat === 'breathing' ? 'B' : cat === 'circulation' ? 'C' : 'D';
                return `
                  <div style="padding:var(--space-3);border-radius:var(--radius-md);background:${data.isEmergency ? 'var(--color-danger-50)' : 'var(--color-gray-50)'};">
                    <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:2px;">
                      <strong style="color:${data.isEmergency ? 'var(--color-danger-600)' : 'var(--text-primary)'};">${letter}</strong>
                      <span style="font-size:var(--font-size-xs);color:var(--text-muted);">${cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                    </div>
                    <div style="font-size:var(--font-size-sm);font-weight:var(--font-weight-semibold);color:${data.isEmergency ? 'var(--color-danger-600)' : 'var(--text-primary)'};">
                      ${data.score}/10 ${data.isEmergency ? '🚨' : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          ${assessment.recommendations.length > 0 ? `
            <div style="margin-top:var(--space-4);padding:var(--space-4);background:var(--color-gray-50);border-radius:var(--radius-md);">
              <div style="font-size:var(--font-size-sm);font-weight:var(--font-weight-medium);margin-bottom:var(--space-2);">Recommendations:</div>
              ${assessment.recommendations.map(r => `<div style="font-size:var(--font-size-sm);color:var(--text-secondary);margin-bottom:2px;">${r}</div>`).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  function renderResults() {
    const priority = calculatePriority({
      symptoms: Array.from(selectedSymptoms),
      symptomText: '',
      vitalSigns,
      age: user.age || 30,
      preExistingConditions: user.preExistingConditions || [],
      arrivalTime: new Date().toISOString()
    });

    const pd = getPriorityDisplay(priority.category);
    const position = QueueManager.getPatientPosition(user.id);

    return `
      <div class="card animate-fade-in" style="text-align:center;padding:var(--space-10);">
        <div style="font-size:48px;margin-bottom:var(--space-4);">
          ${priority.category === 'EMERGENCY' ? '🚨' : priority.category === 'PRIORITY' ? '⚠️' : '✅'}
        </div>
        <h2 style="margin-bottom:var(--space-2);">Triage Assessment Complete</h2>
        <p style="margin-bottom:var(--space-6);">You have been added to the priority queue.</p>

        <div style="display:inline-flex;gap:var(--space-8);margin-bottom:var(--space-8);">
          <div>
            <div style="font-size:var(--font-size-4xl);font-weight:var(--font-weight-bold);color:${pd.color};">${priority.score}</div>
            <div style="font-size:var(--font-size-sm);color:var(--text-muted);">Priority Score</div>
          </div>
          <div>
            <div style="font-size:var(--font-size-4xl);font-weight:var(--font-weight-bold);color:var(--color-primary-600);">#${position || '—'}</div>
            <div style="font-size:var(--font-size-sm);color:var(--text-muted);">Queue Position</div>
          </div>
        </div>

        <span class="badge ${pd.badge} badge-dot" style="font-size:var(--font-size-md);padding:8px 20px;">${pd.label}</span>

        <div style="margin-top:var(--space-8);">
          <a href="#/patient" class="btn btn-primary btn-lg">${Icons.home} Go to Dashboard</a>
        </div>
      </div>
    `;
  }

  function attachEvents() {
    // Symptom checkboxes
    document.querySelectorAll('.symptom-checkbox').forEach(cb => {
      cb.addEventListener('change', () => {
        if (cb.checked) {
          selectedSymptoms.add(cb.value);
        } else {
          selectedSymptoms.delete(cb.value);
        }
        render();
      });
    });

    // Vital signs
    document.querySelectorAll('.vital-input').forEach(input => {
      input.addEventListener('change', () => {
        vitalSigns = {
          heartRate: document.getElementById('vital-hr')?.value || '',
          systolicBP: document.getElementById('vital-sbp')?.value || '',
          diastolicBP: document.getElementById('vital-dbp')?.value || '',
          spo2: document.getElementById('vital-spo2')?.value || '',
          temperature: document.getElementById('vital-temp')?.value || '',
        };
        render();
      });
    });

    // Submit triage
    document.getElementById('submit-triage')?.addEventListener('click', () => {
      // Add to queue
      QueueManager.addPatient({
        patientId: user.id,
        fullName: user.fullName,
        age: user.age || 30,
        symptoms: Array.from(selectedSymptoms),
        symptomText: Array.from(selectedSymptoms).join(', '),
        vitalSigns,
        preExistingConditions: user.preExistingConditions || [],
        department: 'Emergency',
      });

      showResults = true;
      showToast('success', 'Triage Complete', 'You have been placed in the priority queue.');
      render();
    });
  }

  render();
}
