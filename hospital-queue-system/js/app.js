// ===== App Initialization =====

import { Router } from './router.js';
import { seedData } from './data/seed.js';
import { QueueManager } from './core/queue-manager.js';

// Import page renderers
import { renderLanding } from './pages/landing.js';
import { renderLogin } from './pages/login.js';
import { renderSignup } from './pages/signup.js';
import { renderPatientDashboard } from './pages/patient-dashboard.js';
import { renderAdminDashboard } from './pages/admin-dashboard.js';
import { renderAppointment } from './pages/appointment.js';
import { renderTriageForm } from './pages/triage-form.js';

async function initApp() {
  // 1. Seed data on first load
  await seedData();

  // 2. Initialize queue manager
  QueueManager.init();

  // 3. Register routes
  Router.register('/', renderLanding, { guestOnly: false });
  Router.register('/login', renderLogin, { guestOnly: true });
  Router.register('/signup', renderSignup, { guestOnly: true });
  Router.register('/patient', renderPatientDashboard, { requireAuth: true, requireRole: 'patient' });
  Router.register('/admin', renderAdminDashboard, { requireAuth: true, requireRole: 'admin' });
  Router.register('/appointment', renderAppointment, { requireAuth: true });
  Router.register('/triage', renderTriageForm, { requireAuth: true });

  // 4. Start router
  Router.init('app');

  console.log('✅ MediQueue initialized');
}

// Boot
document.addEventListener('DOMContentLoaded', initApp);
