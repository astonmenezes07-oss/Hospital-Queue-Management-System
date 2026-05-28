// ===== ABCD Emergency Triage Assessment Engine =====
// Based on WHO ETAT (Emergency Triage Assessment and Treatment) guidelines

// --- Symptom-to-ABCD Mapping Database ---
const SYMPTOM_DATABASE = {
  // A – Airway
  airway: {
    label: 'Airway',
    letter: 'A',
    symptoms: [
      { id: 'airway_obstruction', label: 'Airway obstruction', severity: 10, emergency: true },
      { id: 'choking', label: 'Choking', severity: 10, emergency: true },
      { id: 'stridor', label: 'Stridor / noisy breathing', severity: 9, emergency: true },
      { id: 'swollen_throat', label: 'Swollen throat / tongue', severity: 9, emergency: true },
      { id: 'inability_breathe', label: 'Inability to breathe properly', severity: 10, emergency: true },
      { id: 'drooling', label: 'Drooling / unable to swallow', severity: 7, emergency: false },
      { id: 'foreign_body', label: 'Foreign body in airway', severity: 9, emergency: true },
    ]
  },

  // B – Breathing
  breathing: {
    label: 'Breathing',
    letter: 'B',
    symptoms: [
      { id: 'severe_respiratory_distress', label: 'Severe respiratory distress', severity: 10, emergency: true },
      { id: 'fast_breathing', label: 'Fast / rapid breathing', severity: 7, emergency: false },
      { id: 'cyanosis', label: 'Cyanosis (blue skin/lips)', severity: 10, emergency: true },
      { id: 'low_oxygen', label: 'Low oxygen levels (SpO2 < 90%)', severity: 9, emergency: true },
      { id: 'wheezing', label: 'Wheezing / difficulty breathing', severity: 6, emergency: false },
      { id: 'asthma_attack', label: 'Severe asthma attack', severity: 8, emergency: true },
      { id: 'chest_tightness', label: 'Chest tightness', severity: 5, emergency: false },
      { id: 'shortness_breath', label: 'Shortness of breath', severity: 6, emergency: false },
      { id: 'apnea', label: 'Apnea (stopped breathing)', severity: 10, emergency: true },
    ]
  },

  // C – Circulation / Consciousness
  circulation: {
    label: 'Circulation / Consciousness',
    letter: 'C',
    symptoms: [
      { id: 'weak_pulse', label: 'Weak or absent pulse', severity: 10, emergency: true },
      { id: 'shock', label: 'Shock (cold extremities, rapid pulse)', severity: 10, emergency: true },
      { id: 'poor_circulation', label: 'Poor circulation', severity: 7, emergency: false },
      { id: 'coma', label: 'Coma / unresponsive', severity: 10, emergency: true },
      { id: 'convulsions', label: 'Convulsions / seizures', severity: 9, emergency: true },
      { id: 'chest_pain', label: 'Chest pain', severity: 8, emergency: true },
      { id: 'heart_attack', label: 'Suspected heart attack', severity: 10, emergency: true },
      { id: 'stroke', label: 'Suspected stroke', severity: 10, emergency: true },
      { id: 'heavy_bleeding', label: 'Heavy / uncontrolled bleeding', severity: 9, emergency: true },
      { id: 'unconscious', label: 'Unconscious patient', severity: 10, emergency: true },
      { id: 'confusion', label: 'Confusion / altered consciousness', severity: 6, emergency: false },
      { id: 'fainting', label: 'Fainting / syncope', severity: 5, emergency: false },
    ]
  },

  // D – Dehydration
  dehydration: {
    label: 'Dehydration',
    letter: 'D',
    symptoms: [
      { id: 'severe_dehydration', label: 'Severe dehydration', severity: 8, emergency: true },
      { id: 'sunken_eyes', label: 'Sunken eyes', severity: 6, emergency: false },
      { id: 'lethargy', label: 'Lethargy / extreme weakness', severity: 7, emergency: false },
      { id: 'delayed_skin_pinch', label: 'Delayed skin pinch recovery', severity: 6, emergency: false },
      { id: 'persistent_vomiting', label: 'Persistent vomiting', severity: 5, emergency: false },
      { id: 'persistent_diarrhea', label: 'Persistent diarrhea', severity: 5, emergency: false },
      { id: 'dry_mouth', label: 'Dry mouth / no tears', severity: 4, emergency: false },
      { id: 'reduced_urine', label: 'Reduced urine output', severity: 5, emergency: false },
    ]
  }
};

// --- Symptom keyword matching for free-text input ---
const KEYWORD_MAP = [
  { keywords: ['heart attack', 'cardiac arrest', 'myocardial'], symptomId: 'heart_attack', category: 'circulation' },
  { keywords: ['stroke', 'paralysis one side', 'slurred speech'], symptomId: 'stroke', category: 'circulation' },
  { keywords: ['chest pain', 'chest pressure', 'angina'], symptomId: 'chest_pain', category: 'circulation' },
  { keywords: ['choking', 'choke'], symptomId: 'choking', category: 'airway' },
  { keywords: ['can\'t breathe', 'cannot breathe', 'unable to breathe', 'not breathing'], symptomId: 'inability_breathe', category: 'airway' },
  { keywords: ['breathing difficulty', 'difficulty breathing', 'hard to breathe', 'breathless'], symptomId: 'shortness_breath', category: 'breathing' },
  { keywords: ['respiratory distress', 'severe breathing'], symptomId: 'severe_respiratory_distress', category: 'breathing' },
  { keywords: ['blue lips', 'blue skin', 'cyanosis', 'turning blue'], symptomId: 'cyanosis', category: 'breathing' },
  { keywords: ['unconscious', 'not conscious', 'passed out', 'unresponsive'], symptomId: 'unconscious', category: 'circulation' },
  { keywords: ['seizure', 'convulsion', 'fitting', 'fits'], symptomId: 'convulsions', category: 'circulation' },
  { keywords: ['bleeding', 'blood loss', 'hemorrhage', 'haemorrhage'], symptomId: 'heavy_bleeding', category: 'circulation' },
  { keywords: ['shock', 'cold hands', 'cold feet', 'clammy'], symptomId: 'shock', category: 'circulation' },
  { keywords: ['coma', 'unresponsive'], symptomId: 'coma', category: 'circulation' },
  { keywords: ['dehydration', 'dehydrated'], symptomId: 'severe_dehydration', category: 'dehydration' },
  { keywords: ['vomiting', 'throwing up', 'nausea'], symptomId: 'persistent_vomiting', category: 'dehydration' },
  { keywords: ['diarrhea', 'diarrhoea', 'loose stool'], symptomId: 'persistent_diarrhea', category: 'dehydration' },
  { keywords: ['asthma', 'asthma attack'], symptomId: 'asthma_attack', category: 'breathing' },
  { keywords: ['wheezing', 'wheeze'], symptomId: 'wheezing', category: 'breathing' },
  { keywords: ['fast breathing', 'rapid breathing', 'tachypnea'], symptomId: 'fast_breathing', category: 'breathing' },
  { keywords: ['weak pulse', 'no pulse', 'faint pulse'], symptomId: 'weak_pulse', category: 'circulation' },
  { keywords: ['faint', 'fainting', 'dizzy', 'lightheaded'], symptomId: 'fainting', category: 'circulation' },
  { keywords: ['confusion', 'confused', 'disoriented'], symptomId: 'confusion', category: 'circulation' },
  { keywords: ['swollen throat', 'throat swelling', 'anaphylaxis'], symptomId: 'swollen_throat', category: 'airway' },
  { keywords: ['sunken eyes'], symptomId: 'sunken_eyes', category: 'dehydration' },
  { keywords: ['lethargy', 'lethargic', 'extreme weakness', 'very weak'], symptomId: 'lethargy', category: 'dehydration' },
  { keywords: ['low oxygen', 'oxygen low', 'spo2'], symptomId: 'low_oxygen', category: 'breathing' },
];

// --- General symptom severity (for non-ABCD symptoms) ---
const GENERAL_SYMPTOMS = [
  { keywords: ['high fever', 'very high temperature', 'fever 103', 'fever 104', 'fever 40'], severity: 6, priority: 'medium' },
  { keywords: ['fever', 'temperature'], severity: 3, priority: 'low' },
  { keywords: ['fracture', 'broken bone', 'broken arm', 'broken leg'], severity: 6, priority: 'medium' },
  { keywords: ['severe pain', 'extreme pain', 'unbearable pain', 'intense pain'], severity: 7, priority: 'medium' },
  { keywords: ['moderate pain', 'pain'], severity: 3, priority: 'low' },
  { keywords: ['headache', 'head hurts', 'migraine'], severity: 2, priority: 'low' },
  { keywords: ['cold', 'cough', 'runny nose', 'sneezing', 'sore throat'], severity: 1, priority: 'low' },
  { keywords: ['trauma', 'accident', 'injury', 'fall', 'fell'], severity: 5, priority: 'medium' },
  { keywords: ['burn', 'burned', 'scalded'], severity: 5, priority: 'medium' },
  { keywords: ['allergic reaction', 'allergy', 'hives', 'rash'], severity: 4, priority: 'medium' },
  { keywords: ['abdominal pain', 'stomach pain', 'belly pain'], severity: 3, priority: 'low' },
  { keywords: ['back pain', 'backache'], severity: 2, priority: 'low' },
  { keywords: ['sprain', 'twisted ankle', 'swelling'], severity: 2, priority: 'low' },
  { keywords: ['cut', 'laceration', 'wound', 'minor bleeding'], severity: 2, priority: 'low' },
  { keywords: ['regular checkup', 'routine', 'check up', 'follow up', 'follow-up'], severity: 0, priority: 'low' },
  { keywords: ['vaccination', 'vaccine', 'immunization'], severity: 0, priority: 'low' },
  { keywords: ['pregnancy', 'prenatal'], severity: 2, priority: 'low' },
  { keywords: ['diabetes', 'blood sugar', 'insulin'], severity: 3, priority: 'low' },
  { keywords: ['hypertension', 'high blood pressure', 'bp high'], severity: 3, priority: 'low' },
];

/**
 * Assess a patient using ABCD triage
 * @param {string[]} selectedSymptoms - Array of symptom IDs from the ABCD checklist
 * @param {string} freeTextSymptoms - Free-text symptom description
 * @param {Object} vitalSigns - Optional: { heartRate, systolicBP, diastolicBP, spo2, temperature }
 * @returns {Object} Triage assessment result
 */
export function assessABCD(selectedSymptoms = [], freeTextSymptoms = '', vitalSigns = {}) {
  const results = {
    airway: { score: 0, findings: [], isEmergency: false },
    breathing: { score: 0, findings: [], isEmergency: false },
    circulation: { score: 0, findings: [], isEmergency: false },
    dehydration: { score: 0, findings: [], isEmergency: false },
    overallCategory: 'NON_URGENT',
    triageScore: 0,
    recommendations: [],
    matchedSymptoms: [],
    generalSymptoms: []
  };

  // 1. Process selected symptoms from checklist
  for (const symptomId of selectedSymptoms) {
    for (const [category, data] of Object.entries(SYMPTOM_DATABASE)) {
      const symptom = data.symptoms.find(s => s.id === symptomId);
      if (symptom) {
        results[category].findings.push(symptom);
        results[category].score = Math.max(results[category].score, symptom.severity);
        if (symptom.emergency) {
          results[category].isEmergency = true;
        }
        results.matchedSymptoms.push({ ...symptom, category });
      }
    }
  }

  // 2. Process free-text symptoms via keyword matching
  if (freeTextSymptoms) {
    const lowerText = freeTextSymptoms.toLowerCase();

    // Match ABCD symptoms
    for (const mapping of KEYWORD_MAP) {
      for (const keyword of mapping.keywords) {
        if (lowerText.includes(keyword)) {
          const categoryData = SYMPTOM_DATABASE[mapping.category];
          const symptom = categoryData.symptoms.find(s => s.id === mapping.symptomId);
          if (symptom && !results.matchedSymptoms.find(m => m.id === symptom.id)) {
            results[mapping.category].findings.push(symptom);
            results[mapping.category].score = Math.max(results[mapping.category].score, symptom.severity);
            if (symptom.emergency) {
              results[mapping.category].isEmergency = true;
            }
            results.matchedSymptoms.push({ ...symptom, category: mapping.category });
          }
          break;
        }
      }
    }

    // Match general symptoms
    for (const gs of GENERAL_SYMPTOMS) {
      for (const keyword of gs.keywords) {
        if (lowerText.includes(keyword)) {
          results.generalSymptoms.push({ keyword, severity: gs.severity, priority: gs.priority });
          break;
        }
      }
    }
  }

  // 3. Analyze vital signs
  if (vitalSigns.heartRate) {
    const hr = Number(vitalSigns.heartRate);
    if (hr > 150 || hr < 40) {
      results.circulation.score = Math.max(results.circulation.score, 9);
      results.circulation.isEmergency = true;
      results.circulation.findings.push({ id: 'vital_hr_critical', label: `Critical heart rate: ${hr} bpm`, severity: 9, emergency: true });
    } else if (hr > 120 || hr < 50) {
      results.circulation.score = Math.max(results.circulation.score, 6);
      results.circulation.findings.push({ id: 'vital_hr_abnormal', label: `Abnormal heart rate: ${hr} bpm`, severity: 6, emergency: false });
    }
  }

  if (vitalSigns.spo2) {
    const spo2 = Number(vitalSigns.spo2);
    if (spo2 < 90) {
      results.breathing.score = Math.max(results.breathing.score, 9);
      results.breathing.isEmergency = true;
      results.breathing.findings.push({ id: 'vital_spo2_critical', label: `Critical SpO2: ${spo2}%`, severity: 9, emergency: true });
    } else if (spo2 < 94) {
      results.breathing.score = Math.max(results.breathing.score, 6);
      results.breathing.findings.push({ id: 'vital_spo2_low', label: `Low SpO2: ${spo2}%`, severity: 6, emergency: false });
    }
  }

  if (vitalSigns.systolicBP) {
    const sbp = Number(vitalSigns.systolicBP);
    if (sbp < 80 || sbp > 220) {
      results.circulation.score = Math.max(results.circulation.score, 9);
      results.circulation.isEmergency = true;
      results.circulation.findings.push({ id: 'vital_bp_critical', label: `Critical BP: ${sbp}/${vitalSigns.diastolicBP || '?'} mmHg`, severity: 9, emergency: true });
    } else if (sbp < 90 || sbp > 180) {
      results.circulation.score = Math.max(results.circulation.score, 6);
      results.circulation.findings.push({ id: 'vital_bp_abnormal', label: `Abnormal BP: ${sbp}/${vitalSigns.diastolicBP || '?'} mmHg`, severity: 6, emergency: false });
    }
  }

  if (vitalSigns.temperature) {
    const temp = Number(vitalSigns.temperature);
    if (temp > 40 || temp < 35) {
      results.dehydration.score = Math.max(results.dehydration.score, 7);
      results.dehydration.findings.push({ id: 'vital_temp_critical', label: `Critical temperature: ${temp}°C`, severity: 7, emergency: false });
    } else if (temp > 38.5) {
      results.dehydration.score = Math.max(results.dehydration.score, 4);
      results.dehydration.findings.push({ id: 'vital_temp_elevated', label: `Elevated temperature: ${temp}°C`, severity: 4, emergency: false });
    }
  }

  // 4. Calculate overall triage score (0-100)
  const categoryScores = [
    results.airway.score,
    results.breathing.score,
    results.circulation.score,
    results.dehydration.score
  ];

  const maxCategoryScore = Math.max(...categoryScores);
  const avgCategoryScore = categoryScores.reduce((a, b) => a + b, 0) / 4;
  const generalMaxSeverity = results.generalSymptoms.length > 0
    ? Math.max(...results.generalSymptoms.map(s => s.severity))
    : 0;

  // Weighted score: max category contributes most, average contributes some
  results.triageScore = Math.min(100, Math.round(
    maxCategoryScore * 7 +        // Max: 70 points from worst ABCD category
    avgCategoryScore * 2 +        // Max: 20 points from average severity
    generalMaxSeverity * 1.5      // Max: ~10 points from general symptoms
  ));

  // 5. Determine overall category
  const hasEmergency = results.airway.isEmergency || results.breathing.isEmergency ||
    results.circulation.isEmergency || results.dehydration.isEmergency;

  if (hasEmergency || results.triageScore >= 60) {
    results.overallCategory = 'EMERGENCY';
  } else if (results.triageScore >= 30 || maxCategoryScore >= 5) {
    results.overallCategory = 'PRIORITY';
  } else {
    results.overallCategory = 'NON_URGENT';
  }

  // 6. Generate recommendations
  if (results.overallCategory === 'EMERGENCY') {
    results.recommendations.push('🚨 IMMEDIATE medical attention required');
    results.recommendations.push('Patient should be seen by emergency physician immediately');
    if (results.airway.isEmergency) results.recommendations.push('Airway management needed — prepare emergency equipment');
    if (results.breathing.isEmergency) results.recommendations.push('Respiratory support required — prepare oxygen/ventilation');
    if (results.circulation.isEmergency) results.recommendations.push('Circulatory support needed — prepare IV access and monitoring');
  } else if (results.overallCategory === 'PRIORITY') {
    results.recommendations.push('⚠️ Rapid medical assessment recommended');
    results.recommendations.push('Patient should be seen within 15-30 minutes');
  } else {
    results.recommendations.push('✅ Standard queue — patient is stable');
    results.recommendations.push('Patient can wait in normal queue');
  }

  return results;
}

/**
 * Analyze free-text symptoms and predict priority level
 * @param {string} symptomsText - Free-text symptom description
 * @returns {Object} { predictedPriority, confidence, matchedConditions }
 */
export function predictPriorityFromSymptoms(symptomsText) {
  const assessment = assessABCD([], symptomsText);

  return {
    predictedPriority: assessment.overallCategory === 'EMERGENCY' ? 'HIGH'
      : assessment.overallCategory === 'PRIORITY' ? 'MEDIUM' : 'LOW',
    triageScore: assessment.triageScore,
    category: assessment.overallCategory,
    matchedSymptoms: assessment.matchedSymptoms,
    generalSymptoms: assessment.generalSymptoms,
    recommendations: assessment.recommendations,
    abcdSummary: {
      airway: { score: assessment.airway.score, emergency: assessment.airway.isEmergency },
      breathing: { score: assessment.breathing.score, emergency: assessment.breathing.isEmergency },
      circulation: { score: assessment.circulation.score, emergency: assessment.circulation.isEmergency },
      dehydration: { score: assessment.dehydration.score, emergency: assessment.dehydration.isEmergency },
    }
  };
}

/**
 * Get the symptom database for building UI checklists
 */
export function getSymptomDatabase() {
  return SYMPTOM_DATABASE;
}

/**
 * Get category display info
 */
export function getCategoryInfo(category) {
  const categories = {
    'EMERGENCY': { label: 'Emergency', color: 'danger', badge: 'badge-emergency', icon: '🚨', description: 'Immediate treatment required' },
    'PRIORITY': { label: 'Priority', color: 'warning', badge: 'badge-urgent', icon: '⚠️', description: 'Rapid assessment needed' },
    'NON_URGENT': { label: 'Non-Urgent', color: 'success', badge: 'badge-normal', icon: '✅', description: 'Standard queue' },
  };
  return categories[category] || categories['NON_URGENT'];
}
