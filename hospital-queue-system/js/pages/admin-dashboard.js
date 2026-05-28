// ===== Admin Dashboard =====

import { Icons, getInitials, formatDate, formatDateTime, timeAgo, getPriorityDisplay, escapeHtml } from '../utils/helpers.js';
import { Auth } from '../auth.js';
import { Router } from '../router.js';
import { QueueManager } from '../core/queue-manager.js';
import { Store } from '../data/store.js';
import { showToast } from '../utils/notifications.js';

export function renderAdminDashboard(container) {
  const user = Auth.getCurrentUser();
  if (!user || user.role !== 'admin') { Router.navigate('/login'); return; }

  let activeView = 'overview';

  function render() {
    const stats = QueueManager.getStats();
    const queueSnapshot = QueueManager.getQueueSnapshot();
    const emergencyPatients = QueueManager.getEmergencyPatients();
    const doctors = Store.getAll('doctors');
    const appointments = Store.getAll('appointments');

    container.innerHTML = `
      <div class="dashboard-layout">
        <!-- Sidebar -->
        <aside class="sidebar" id="admin-sidebar">
          <div class="sidebar-header">
            <a href="#/admin" class="sidebar-logo">
              ${Icons.heartPulse}
              <span>Medi<span class="logo-highlight">Queue</span></span>
            </a>
          </div>
          <nav class="sidebar-nav">
            <div class="sidebar-section-label">Dashboard</div>
            <a class="sidebar-link ${activeView === 'overview' ? 'active' : ''}" data-view="overview">
              ${Icons.home} <span>Overview</span>
            </a>
            <a class="sidebar-link ${activeView === 'queue' ? 'active' : ''}" data-view="queue">
              ${Icons.list} <span>Live Queue</span>
              ${stats.totalInQueue > 0 ? `<span class="sidebar-badge">${stats.totalInQueue}</span>` : ''}
            </a>
            <a class="sidebar-link ${activeView === 'emergency' ? 'active' : ''}" data-view="emergency">
              ${Icons.alertTriangle} <span>Emergency Alerts</span>
              ${stats.emergencyCount > 0 ? `<span class="sidebar-badge">${stats.emergencyCount}</span>` : ''}
            </a>
            <div class="sidebar-section-label">Management</div>
            <a class="sidebar-link ${activeView === 'appointments' ? 'active' : ''}" data-view="appointments">
              ${Icons.calendar} <span>Appointments</span>
            </a>
            <a class="sidebar-link ${activeView === 'doctors' ? 'active' : ''}" data-view="doctors">
              ${Icons.stethoscope} <span>Doctors</span>
            </a>
            <a class="sidebar-link ${activeView === 'analytics' ? 'active' : ''}" data-view="analytics">
              ${Icons.barChart} <span>Analytics</span>
            </a>
          </nav>
          <div class="sidebar-footer">
            <div class="sidebar-user" id="admin-logout-btn">
              <div class="avatar" style="background:var(--color-secondary-800);">${getInitials(user.fullName)}</div>
              <div class="sidebar-user-info">
                <div class="sidebar-user-name">${escapeHtml(user.fullName)}</div>
                <div class="sidebar-user-role">Administrator</div>
              </div>
              ${Icons.logOut}
            </div>
          </div>
        </aside>

        <div class="sidebar-overlay" id="sidebar-overlay"></div>

        <!-- Main Content -->
        <main class="main-content">
          <header class="main-topbar">
            <div class="main-topbar-left">
              <button class="menu-toggle" id="menu-toggle">${Icons.menu}</button>
              <h1 class="main-topbar-title">${getViewTitle(activeView)}</h1>
            </div>
            <div class="main-topbar-right">
              <button class="btn btn-ghost btn-sm" id="rebalance-btn" title="Rebalance Queue">
                ${Icons.refreshCw} Rebalance
              </button>
              <button class="btn btn-primary btn-sm" id="call-next-btn" ${queueSnapshot.length === 0 ? 'disabled' : ''}>
                ${Icons.phone} Call Next Patient
              </button>
            </div>
          </header>

          <div class="content-area-wide">
            ${emergencyPatients.length > 0 ? renderEmergencyAlert(emergencyPatients) : ''}
            ${renderView(activeView, { stats, queueSnapshot, emergencyPatients, doctors, appointments })}
          </div>
        </main>
      </div>
    `;

    attachEvents(queueSnapshot, doctors);
  }

  function getViewTitle(view) {
    const titles = {
      overview: 'Dashboard Overview',
      queue: 'Live Patient Queue',
      emergency: 'Emergency Alerts',
      appointments: 'Appointment Management',
      doctors: 'Doctor Availability',
      analytics: 'Reports & Analytics'
    };
    return titles[view] || 'Dashboard';
  }

  function renderEmergencyAlert(emergencyPatients) {
    return `
      <div class="emergency-panel animate-fade-in">
        <div class="emergency-panel-header">
          ${Icons.alertTriangle}
          <div class="pulse-dot"></div>
          <span>EMERGENCY — ${emergencyPatients.length} Critical Patient${emergencyPatients.length > 1 ? 's' : ''} in Queue</span>
        </div>
        <div style="display:flex;gap:var(--space-3);flex-wrap:wrap;">
          ${emergencyPatients.slice(0, 3).map(p => `
            <div class="queue-item emergency" style="flex:1;min-width:260px;">
              <div class="queue-item-position">${Icons.alertTriangle}</div>
              <div class="queue-item-info">
                <div class="queue-item-name">${escapeHtml(p.fullName)}</div>
                <div class="queue-item-symptoms">${escapeHtml(p.symptomText || 'Emergency')}</div>
              </div>
              <div class="queue-item-meta">
                <div class="queue-item-score" style="color:var(--color-danger-600);">${p.priorityScore}</div>
                <div class="queue-item-time">${timeAgo(p.arrivalTime)}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderView(view, data) {
    switch (view) {
      case 'overview': return renderOverview(data);
      case 'queue': return renderQueueView(data);
      case 'emergency': return renderEmergencyView(data);
      case 'appointments': return renderAppointmentsView(data);
      case 'doctors': return renderDoctorsView(data);
      case 'analytics': return renderAnalyticsView(data);
      default: return renderOverview(data);
    }
  }

  function renderOverview({ stats, queueSnapshot, doctors, appointments }) {
    return `
      <!-- Stats Row -->
      <div class="stats-row animate-fade-in">
        <div class="stat-card">
          <div class="stat-card-icon teal">${Icons.users}</div>
          <div class="stat-card-content">
            <div class="stat-card-label">In Queue</div>
            <div class="stat-card-value">${stats.totalInQueue}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-card-icon red">${Icons.alertTriangle}</div>
          <div class="stat-card-content">
            <div class="stat-card-label">Emergency</div>
            <div class="stat-card-value">${stats.emergencyCount}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-card-icon green">${Icons.check}</div>
          <div class="stat-card-content">
            <div class="stat-card-label">Treated Today</div>
            <div class="stat-card-value">${stats.treatedToday}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-card-icon amber">${Icons.clock}</div>
          <div class="stat-card-content">
            <div class="stat-card-label">Avg Wait</div>
            <div class="stat-card-value">${stats.avgWaitTime} min</div>
          </div>
        </div>
      </div>

      <div class="grid grid-2">
        <!-- Queue Preview -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">${Icons.list} Current Queue</h3>
            <a class="btn btn-ghost btn-sm" data-view="queue" style="cursor:pointer;">View All</a>
          </div>
          <div class="card-body">
            ${queueSnapshot.length > 0 ? queueSnapshot.slice(0, 5).map((p, i) => renderQueueItem(p, i + 1)).join('') : `
              <div class="empty-state" style="padding:var(--space-6);">
                ${Icons.list}
                <div class="empty-state-title">Queue Empty</div>
                <div class="empty-state-text">No patients are currently waiting.</div>
              </div>
            `}
          </div>
        </div>

        <!-- Doctor Availability -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">${Icons.stethoscope} Doctor Availability</h3>
          </div>
          <div class="card-body" style="display:flex;flex-direction:column;gap:var(--space-3);">
            ${doctors.slice(0, 6).map(doc => `
              <div class="doctor-card">
                <div class="avatar ${doc.status === 'available' ? '' : 'style="background:var(--color-gray-400)"'}">${doc.avatar}</div>
                <div class="doctor-card-info">
                  <div class="doctor-card-name">${escapeHtml(doc.name)}</div>
                  <div class="doctor-card-dept">${escapeHtml(doc.department)}</div>
                </div>
                <div class="doctor-status-indicator ${doc.status === 'available' ? 'available' : doc.status === 'busy' ? 'busy' : 'off'}">${doc.status === 'available' ? 'Available' : doc.status === 'busy' ? 'Busy' : 'Off Duty'}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Today's Appointments -->
      <div class="card" style="margin-top:var(--space-6);">
        <div class="card-header">
          <h3 class="card-title">${Icons.calendar} Today's Appointments</h3>
        </div>
        <div class="card-body">
          ${appointments.length > 0 ? `
            <div class="table-container">
              <table class="table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Department</th>
                    <th>Doctor</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${appointments.map(apt => `
                    <tr>
                      <td><strong>${escapeHtml(apt.patientName)}</strong></td>
                      <td>${escapeHtml(apt.department)}</td>
                      <td>${escapeHtml(apt.doctor)}</td>
                      <td>${apt.date} ${apt.time}</td>
                      <td><span class="badge badge-teal">${apt.status}</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : '<div class="empty-state" style="padding:var(--space-6);"><div class="empty-state-title">No appointments scheduled</div></div>'}
        </div>
      </div>
    `;
  }

  function renderQueueView({ queueSnapshot }) {
    return `
      <div class="card animate-fade-in">
        <div class="card-header">
          <h3 class="card-title">Patient Queue — Sorted by Priority</h3>
          <span class="badge badge-teal">${queueSnapshot.length} patients</span>
        </div>
        <div class="card-body">
          ${queueSnapshot.length > 0 ? `
            <div class="table-container">
              <table class="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Patient</th>
                    <th>Age</th>
                    <th>Department</th>
                    <th>Symptoms</th>
                    <th>Score</th>
                    <th>Priority</th>
                    <th>Wait Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${queueSnapshot.map((p, i) => {
                    const pd = getPriorityDisplay(p.category);
                    const waitMin = Math.round((Date.now() - new Date(p.arrivalTime).getTime()) / 60000);
                    return `
                      <tr class="${p.category === 'EMERGENCY' ? 'emergency-row' : ''}">
                        <td><strong>${i + 1}</strong></td>
                        <td><strong>${escapeHtml(p.fullName)}</strong></td>
                        <td>${p.age || '—'}</td>
                        <td>${escapeHtml(p.department)}</td>
                        <td style="max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(p.symptomText || '—')}</td>
                        <td><strong style="color:${pd.color}">${p.priorityScore}</strong></td>
                        <td><span class="badge ${pd.badge} badge-dot">${pd.label}</span></td>
                        <td>${waitMin} min</td>
                        <td>
                          <div class="queue-item-actions">
                            <button class="btn btn-ghost btn-sm call-patient-btn" data-id="${p.id}" data-name="${escapeHtml(p.fullName)}" title="Call Patient">
                              ${Icons.phone}
                            </button>
                            <button class="btn btn-ghost btn-sm remove-patient-btn" data-id="${p.id}" title="Remove">
                              ${Icons.x}
                            </button>
                          </div>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          ` : '<div class="empty-state" style="padding:var(--space-10);"><div class="empty-state-title">Queue is empty</div></div>'}
        </div>
      </div>
    `;
  }

  function renderEmergencyView({ emergencyPatients }) {
    return `
      <div class="animate-fade-in">
        ${emergencyPatients.length > 0 ? emergencyPatients.map((p, i) => {
          const waitMin = Math.round((Date.now() - new Date(p.arrivalTime).getTime()) / 60000);
          return `
            <div class="queue-item emergency" style="margin-bottom:var(--space-4);">
              <div class="queue-item-position">${i + 1}</div>
              <div class="queue-item-info">
                <div class="queue-item-name">${escapeHtml(p.fullName)} (Age: ${p.age || '?'})</div>
                <div class="queue-item-symptoms">${escapeHtml(p.symptomText || 'Emergency')}</div>
                <div style="margin-top:var(--space-2);display:flex;gap:var(--space-2);flex-wrap:wrap;">
                  ${(p.symptoms || []).map(s => `<span class="chip">${s.replace(/_/g, ' ')}</span>`).join('')}
                </div>
              </div>
              <div class="queue-item-meta" style="flex-direction:column;align-items:flex-end;gap:var(--space-2);">
                <span class="badge badge-emergency badge-dot">Score: ${p.priorityScore}</span>
                <span style="font-size:var(--font-size-xs);color:var(--text-muted);">Waiting: ${waitMin} min</span>
                <button class="btn btn-danger btn-sm call-patient-btn" data-id="${p.id}" data-name="${escapeHtml(p.fullName)}">
                  ${Icons.phone} Call Now
                </button>
              </div>
            </div>
          `;
        }).join('') : `
          <div class="card">
            <div class="empty-state" style="padding:var(--space-12);">
              ${Icons.check}
              <div class="empty-state-title">No Emergency Cases</div>
              <div class="empty-state-text">There are currently no emergency-level patients in the queue.</div>
            </div>
          </div>
        `}
      </div>
    `;
  }

  function renderAppointmentsView({ appointments }) {
    return `
      <div class="card animate-fade-in">
        <div class="card-header">
          <h3 class="card-title">All Appointments</h3>
        </div>
        <div class="card-body">
          ${appointments.length > 0 ? `
            <div class="table-container">
              <table class="table">
                <thead><tr><th>Patient</th><th>Department</th><th>Doctor</th><th>Date</th><th>Time</th><th>Symptoms</th><th>Status</th></tr></thead>
                <tbody>
                  ${appointments.map(apt => `
                    <tr>
                      <td><strong>${escapeHtml(apt.patientName)}</strong></td>
                      <td>${escapeHtml(apt.department)}</td>
                      <td>${escapeHtml(apt.doctor)}</td>
                      <td>${apt.date}</td>
                      <td>${apt.time}</td>
                      <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(apt.symptoms || '—')}</td>
                      <td><span class="badge badge-teal">${apt.status}</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : '<div class="empty-state" style="padding:var(--space-8);"><div class="empty-state-title">No appointments</div></div>'}
        </div>
      </div>
    `;
  }

  function renderDoctorsView({ doctors }) {
    return `
      <div class="grid grid-3 animate-fade-in">
        ${doctors.map(doc => `
          <div class="card" style="text-align:center;">
            <div class="avatar avatar-lg" style="margin:0 auto var(--space-3);${doc.status !== 'available' ? 'background:var(--color-gray-400);' : ''}">${doc.avatar}</div>
            <h4 style="font-size:var(--font-size-md);">${escapeHtml(doc.name)}</h4>
            <p style="font-size:var(--font-size-sm);color:var(--text-muted);margin-bottom:var(--space-2);">${escapeHtml(doc.specialization)}</p>
            <p style="font-size:var(--font-size-xs);color:var(--text-light);margin-bottom:var(--space-4);">${escapeHtml(doc.department)}</p>
            <div class="doctor-status-indicator ${doc.status === 'available' ? 'available' : doc.status === 'busy' ? 'busy' : 'off'}" style="display:inline-block;">${doc.status === 'available' ? '● Available' : doc.status === 'busy' ? '● Busy' : '● Off Duty'}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderAnalyticsView({ stats, queueSnapshot }) {
    const byDept = {};
    queueSnapshot.forEach(p => {
      byDept[p.department] = (byDept[p.department] || 0) + 1;
    });
    const deptEntries = Object.entries(byDept);
    const maxDeptCount = Math.max(...deptEntries.map(e => e[1]), 1);
    const colors = ['teal', 'blue', 'red', 'amber', 'green'];

    return `
      <div class="grid grid-2 animate-fade-in">
        <!-- Priority Distribution -->
        <div class="card">
          <div class="card-header"><h3 class="card-title">Priority Distribution</h3></div>
          <div class="card-body">
            <div class="chart-bar-container">
              <div class="chart-bar-item">
                <div class="chart-bar-value">${stats.emergencyCount}</div>
                <div class="chart-bar red" style="height:${Math.max(10, (stats.emergencyCount / Math.max(stats.totalInQueue, 1)) * 100)}%;"></div>
                <div class="chart-bar-label">Emergency</div>
              </div>
              <div class="chart-bar-item">
                <div class="chart-bar-value">${stats.priorityCount}</div>
                <div class="chart-bar amber" style="height:${Math.max(10, (stats.priorityCount / Math.max(stats.totalInQueue, 1)) * 100)}%;"></div>
                <div class="chart-bar-label">Priority</div>
              </div>
              <div class="chart-bar-item">
                <div class="chart-bar-value">${stats.nonUrgentCount}</div>
                <div class="chart-bar green" style="height:${Math.max(10, (stats.nonUrgentCount / Math.max(stats.totalInQueue, 1)) * 100)}%;"></div>
                <div class="chart-bar-label">Normal</div>
              </div>
              <div class="chart-bar-item">
                <div class="chart-bar-value">${stats.treatedToday}</div>
                <div class="chart-bar teal" style="height:${Math.max(10, (stats.treatedToday / Math.max(stats.totalInQueue + stats.treatedToday, 1)) * 100)}%;"></div>
                <div class="chart-bar-label">Treated</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Department Distribution -->
        <div class="card">
          <div class="card-header"><h3 class="card-title">Patients by Department</h3></div>
          <div class="card-body">
            <div class="chart-bar-container">
              ${deptEntries.length > 0 ? deptEntries.map(([ dept, count ], i) => `
                <div class="chart-bar-item">
                  <div class="chart-bar-value">${count}</div>
                  <div class="chart-bar ${colors[i % colors.length]}" style="height:${Math.max(10, (count / maxDeptCount) * 100)}%;"></div>
                  <div class="chart-bar-label">${dept.split(' ')[0]}</div>
                </div>
              `).join('') : '<div class="empty-state-text" style="width:100%;text-align:center;padding:var(--space-8);">No data</div>'}
            </div>
          </div>
        </div>

        <!-- Key Metrics -->
        <div class="card" style="grid-column: span 2;">
          <div class="card-header"><h3 class="card-title">Key Metrics Summary</h3></div>
          <div class="card-body">
            <div class="stats-row" style="margin-bottom:0;">
              <div class="stat-card">
                <div class="stat-card-icon teal">${Icons.activity}</div>
                <div class="stat-card-content">
                  <div class="stat-card-label">Queue Efficiency</div>
                  <div class="stat-card-value">${stats.totalInQueue > 0 ? Math.round((stats.treatedToday / (stats.totalInQueue + stats.treatedToday)) * 100) : 0}%</div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-card-icon amber">${Icons.clock}</div>
                <div class="stat-card-content">
                  <div class="stat-card-label">Avg Wait Time</div>
                  <div class="stat-card-value">${stats.avgWaitTime} min</div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-card-icon red">${Icons.alertTriangle}</div>
                <div class="stat-card-content">
                  <div class="stat-card-label">Emergency Rate</div>
                  <div class="stat-card-value">${stats.totalInQueue > 0 ? Math.round((stats.emergencyCount / stats.totalInQueue) * 100) : 0}%</div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-card-icon green">${Icons.users}</div>
                <div class="stat-card-content">
                  <div class="stat-card-label">Total Patients</div>
                  <div class="stat-card-value">${stats.totalInQueue + stats.treatedToday}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderQueueItem(p, position) {
    const pd = getPriorityDisplay(p.category);
    const waitMin = Math.round((Date.now() - new Date(p.arrivalTime).getTime()) / 60000);
    return `
      <div class="queue-item ${p.category === 'EMERGENCY' ? 'emergency' : ''}">
        <div class="queue-item-position">${position}</div>
        <div class="queue-item-info">
          <div class="queue-item-name">${escapeHtml(p.fullName)}</div>
          <div class="queue-item-symptoms">${escapeHtml(p.symptomText || p.department)}</div>
        </div>
        <div class="queue-item-meta">
          <span class="badge ${pd.badge} badge-dot">${pd.label}</span>
          <div class="queue-item-score">${p.priorityScore}</div>
          <div class="queue-item-time">${waitMin}m</div>
        </div>
      </div>
    `;
  }

  function attachEvents(queueSnapshot, doctors) {
    // Logout
    document.getElementById('admin-logout-btn')?.addEventListener('click', () => {
      Auth.logout();
      showToast('info', 'Signed Out', 'Admin session ended.');
      Router.navigate('/');
    });

    // Mobile menu
    document.getElementById('menu-toggle')?.addEventListener('click', () => {
      document.getElementById('admin-sidebar').classList.toggle('open');
      document.getElementById('sidebar-overlay').classList.toggle('active');
    });
    document.getElementById('sidebar-overlay')?.addEventListener('click', () => {
      document.getElementById('admin-sidebar').classList.remove('open');
      document.getElementById('sidebar-overlay').classList.remove('active');
    });

    // Sidebar navigation
    document.querySelectorAll('.sidebar-link[data-view]').forEach(link => {
      link.addEventListener('click', () => {
        activeView = link.dataset.view;
        render();
      });
    });

    // View all links (inside cards)
    document.querySelectorAll('[data-view]').forEach(el => {
      if (!el.classList.contains('sidebar-link')) {
        el.addEventListener('click', () => {
          activeView = el.dataset.view;
          render();
        });
      }
    });

    // Call next patient
    document.getElementById('call-next-btn')?.addEventListener('click', () => {
      const availableDoctor = doctors.find(d => d.status === 'available');
      const doctorName = availableDoctor ? availableDoctor.name : 'Dr. On-Call';
      const patient = QueueManager.callNextPatient(doctorName);
      if (patient) {
        showToast('success', 'Patient Called', `${patient.fullName} has been called. Assigned to ${doctorName}.`);
        render();
      } else {
        showToast('info', 'Queue Empty', 'No patients in the queue.');
      }
    });

    // Call specific patient
    document.querySelectorAll('.call-patient-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const name = btn.dataset.name;
        const availableDoctor = doctors.find(d => d.status === 'available');
        const doctorName = availableDoctor ? availableDoctor.name : 'Dr. On-Call';

        QueueManager.removePatient(id);
        showToast('success', 'Patient Called', `${name} has been called and assigned to ${doctorName}.`);
        render();
      });
    });

    // Remove patient
    document.querySelectorAll('.remove-patient-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        QueueManager.removePatient(id);
        showToast('info', 'Patient Removed', 'Patient has been removed from the queue.');
        render();
      });
    });

    // Rebalance
    document.getElementById('rebalance-btn')?.addEventListener('click', () => {
      QueueManager.rebalanceQueue();
      showToast('success', 'Queue Rebalanced', 'All priorities have been recalculated.');
      render();
    });
  }

  render();
}
