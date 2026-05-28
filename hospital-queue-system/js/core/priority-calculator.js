// ===== Multi-Factor Priority Calculator =====
// Calculates a composite priority score (0–100) using weighted factors.

import { assessABCD } from './triage.js';

/**
 * Calculate composite priority score for a patient
 * @param {Object} patient
 * @param {string[]} patient.symptoms - Selected ABCD symptom IDs
 * @param {string} patient.symptomText - Free-text symptoms
 * @param {Object} patient.vitalSigns - { heartRate, systolicBP, diastolicBP, spo2, temperature }
 * @param {number} patient.age - Patient age
 * @param {string[]} patient.preExistingConditions - e.g. ['diabetes', 'heart_disease']
 * @param {string} patient.arrivalTime - ISO timestamp
 * @returns {Object} { score, category, breakdown, assessment }
 */
export function calculatePriority(patient) {
  const weights = {
    triage: 0.40,       // 40% from ABCD triage
    symptoms: 0.25,     // 25% from symptom severity
    age: 0.10,          // 10% from age factor
    conditions: 0.10,   // 10% from pre-existing conditions
    vitals: 0.10,       // 10% from vital signs abnormality
    waitTime: 0.05      // 5% from wait time (prevents starvation)
  };

  // 1. ABCD Triage Assessment
  const assessment = assessABCD(
    patient.symptoms || [],
    patient.symptomText || '',
    patient.vitalSigns || {}
  );

  const triageComponent = assessment.triageScore;

  // 2. Symptom severity component
  let symptomComponent = 0;
  if (assessment.matchedSymptoms.length > 0) {
    const maxSeverity = Math.max(...assessment.matchedSymptoms.map(s => s.severity));
    const avgSeverity = assessment.matchedSymptoms.reduce((sum, s) => sum + s.severity, 0) / assessment.matchedSymptoms.length;
    symptomComponent = Math.min(100, (maxSeverity * 7 + avgSeverity * 3));
  }
  if (assessment.generalSymptoms.length > 0 && symptomComponent === 0) {
    const maxSev = Math.max(...assessment.generalSymptoms.map(s => s.severity));
    symptomComponent = maxSev * 10;
  }

  // 3. Age factor component
  let ageComponent = 0;
  const age = patient.age || 30;
  if (age < 2) {
    ageComponent = 80;
  } else if (age < 5) {
    ageComponent = 60;
  } else if (age < 12) {
    ageComponent = 30;
  } else if (age > 80) {
    ageComponent = 70;
  } else if (age > 65) {
    ageComponent = 50;
  } else if (age > 55) {
    ageComponent = 25;
  } else {
    ageComponent = 10;
  }

  // 4. Pre-existing conditions component
  let conditionsComponent = 0;
  const conditions = patient.preExistingConditions || [];
  const conditionScores = {
    'heart_disease': 30,
    'diabetes': 20,
    'hypertension': 15,
    'asthma': 20,
    'copd': 25,
    'cancer': 25,
    'immunocompromised': 30,
    'kidney_disease': 20,
    'liver_disease': 20,
    'stroke_history': 25,
    'pregnancy': 15,
    'hiv': 20,
    'transplant': 25,
    'other': 10,
  };
  for (const cond of conditions) {
    conditionsComponent += (conditionScores[cond] || 10);
  }
  conditionsComponent = Math.min(100, conditionsComponent);

  // 5. Vital signs abnormality component (from triage assessment data)
  let vitalsComponent = 0;
  const vitalsFindings = [
    ...assessment.airway.findings,
    ...assessment.breathing.findings,
    ...assessment.circulation.findings,
    ...assessment.dehydration.findings
  ].filter(f => f.id.startsWith('vital_'));

  if (vitalsFindings.length > 0) {
    vitalsComponent = Math.min(100, Math.max(...vitalsFindings.map(f => f.severity)) * 10);
  }

  // 6. Wait time decay component (increases priority over time to prevent starvation)
  let waitTimeComponent = 0;
  if (patient.arrivalTime) {
    const waitMinutes = (Date.now() - new Date(patient.arrivalTime).getTime()) / (1000 * 60);
    // Gradually increase: 10 pts at 30 min, 30 pts at 60 min, caps at 100 at 3h
    waitTimeComponent = Math.min(100, Math.round(waitMinutes / 1.8));
  }

  // Calculate weighted total
  const score = Math.min(100, Math.round(
    triageComponent * weights.triage +
    symptomComponent * weights.symptoms +
    ageComponent * weights.age +
    conditionsComponent * weights.conditions +
    vitalsComponent * weights.vitals +
    waitTimeComponent * weights.waitTime
  ));

  // Determine priority category
  let category;
  if (score >= 60 || assessment.overallCategory === 'EMERGENCY') {
    category = 'EMERGENCY';
  } else if (score >= 30 || assessment.overallCategory === 'PRIORITY') {
    category = 'PRIORITY';
  } else {
    category = 'NON_URGENT';
  }

  return {
    score,
    category,
    assessment,
    breakdown: {
      triage: { raw: triageComponent, weighted: Math.round(triageComponent * weights.triage) },
      symptoms: { raw: symptomComponent, weighted: Math.round(symptomComponent * weights.symptoms) },
      age: { raw: ageComponent, weighted: Math.round(ageComponent * weights.age) },
      conditions: { raw: conditionsComponent, weighted: Math.round(conditionsComponent * weights.conditions) },
      vitals: { raw: vitalsComponent, weighted: Math.round(vitalsComponent * weights.vitals) },
      waitTime: { raw: waitTimeComponent, weighted: Math.round(waitTimeComponent * weights.waitTime) },
    }
  };
}

/**
 * Recalculate priority for a patient (used during queue rebalancing)
 */
export function recalculatePriority(patient) {
  const result = calculatePriority(patient);
  return result.score;
}
