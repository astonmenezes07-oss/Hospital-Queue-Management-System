// ===== Patient Dashboard =====

import { Icons, getInitials, formatDate, formatDateTime, timeAgo, getPriorityDisplay, escapeHtml } from '../utils/helpers.js';
import { Auth } from '../auth.js';
import { Router } from '../router.js';
import { QueueManager } from '../core/queue-manager.js';
import { Store } from '../data/store.js';
import { showToast } from '../utils/notifications.js';

export function renderPatientDashboard(container) {
  const user = Auth.getCurrentUser();
  if (!user) { Router.navigate('/login'); return; }

  const activeTab = 'overview';

  function render() {
    const queueEntry = QueueManager.getPatientQueueEntry(user.id);
    const position = QueueManager.getPatientPosition(user.id);
    const waitTime = QueueManager.getEstimatedWaitTime(user.id);
    const notifications = (Store.get('notifications') || {})[user.id] || [];
    const appointments = (Store.get('appointments') || []).filter(a => a.patientId === user.id);
    const history = ((Store.get('medicalHistory') || {})[user.id]) || [];

    container.innerHTML = `
      <div class="dashboard-layout">
        <!-- Sidebar -->
        <aside class="sidebar" id="patient-sidebar">
          <div class="sidebar-header">
            <a href="#/patient" class="sidebar-logo">
              ${Icons.heartPulse}
              <span>Medi<span class="logo-highlight">Queue</span></span>
            </a>
          </div>
          <nav class="sidebar-nav">
            <div class="sidebar-section-label">Menu</div>
            <a class="sidebar-link active" data-view="overview" id="nav-overview">
              ${Icons.home} <span>Overview</span>
            </a>
            <a class="sidebar-link" data-view="appointments" id="nav-appointments">
              ${Icons.calendar} <span>Appointments</span>
            </a>
            <a class="sidebar-link" data-view="queue" id="nav-queue">
              ${Icons.list} <span>Queue Status</span>
              ${queueEntry ? `<span class="sidebar-badge">${position || '—'}</span>` : ''}
            </a>
            <a class="sidebar-link" data-view="triage" id="nav-triage">
              ${Icons.clipboardList} <span>ABCD Triage</span>
            </a>
            <div class="sidebar-section-label">Account</div>
            <a class="sidebar-link" data-view="history" id="nav-history">
              ${Icons.fileText} <span>Medical History</span>
            </a>
            <a class="sidebar-link" data-view="notifications" id="nav-notifications">
              ${Icons.bell} <span>Notifications</span>
              ${notifications.filter(n => !n.read).length > 0 ? `<span class="sidebar-badge">${notifications.filter(n => !n.read).length}</span>` : ''}
            </a>
          </nav>
          <div class="sidebar-footer">
            <div class="sidebar-user" id="sidebar-user-btn">
              <div class="avatar">${getInitials(user.fullName)}</div>
              <div class="sidebar-user-info">
                <div class="sidebar-user-name">${escapeHtml(user.fullName)}</div>
                <div class="sidebar-user-role">Patient</div>
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
              <h1 class="main-topbar-title">Patient Dashboard</h1>
            </div>
            <div class="main-topbar-right">
              <a href="#/appointment" class="btn btn-primary btn-sm">
                ${Icons.plus} Book Appointment
              </a>
            </div>
          </header>

          <div class="content-area">
            <!-- Welcome Banner -->
            <div class="welcome-banner animate-fade-in">
              <div class="welcome-content">
                <h2>Welcome back, ${escapeHtml(user.fullName.split(' ')[0])} 👋</h2>
                <p>${queueEntry ? `You are currently #${position} in the queue. Estimated wait: ${waitTime} min.` : 'You are not currently in any queue. Book an appointment or walk in for triage assessment.'}</p>
              </div>
              <div class="welcome-actions">
                <a href="#/appointment" class="btn btn-primary">
                  ${Icons.calendar} Book Appointment
                </a>
                <a href="#/triage" class="btn btn-outline">
                  ${Icons.clipboardList} Quick Triage
                </a>
              </div>
            </div>

            ${queueEntry ? renderQueueStatus(queueEntry, position, waitTime) : ''}

            <!-- Dashboard Grid -->
            <div class="grid grid-2" style="margin-top: var(--space-6);">
              <!-- Upcoming Appointments -->
              <div class="card">
                <div class="card-header">
                  <h3 class="card-title">${Icons.calendar} Upcoming Appointments</h3>
                  <a href="#/appointment" class="btn btn-ghost btn-sm">${Icons.plus} New</a>
                </div>
                <div class="card-body">
                  ${appointments.length > 0 ? appointments.slice(0, 3).map(apt => `
                    <div class="appointment-card" style="margin-bottom:var(--space-3);">
                      <div class="appointment-date">
                        <div class="appointment-date-day">${new Date(apt.date).getDate()}</div>
                        <div class="appointment-date-month">${new Date(apt.date).toLocaleDateString('en-US', { month: 'short' })}</div>
                      </div>
                      <div class="appointment-info">
                        <h5>${escapeHtml(apt.department)}</h5>
                        <p>${escapeHtml(apt.doctor)} — ${apt.time}</p>
                        <p>${escapeHtml(apt.symptoms || '')}</p>
                      </div>
                      <span class="badge badge-teal badge-dot">${apt.status}</span>
                    </div>
                  `).join('') : `
                    <div class="empty-state" style="padding:var(--space-8) var(--space-4);">
                      ${Icons.calendar}
                      <div class="empty-state-title">No Appointments</div>
                      <div class="empty-state-text">Book your first appointment to get started.</div>
                    </div>
                  `}
                </div>
              </div>

              <!-- Notifications -->
              <div class="card">
                <div class="card-header">
                  <h3 class="card-title">${Icons.bell} Recent Notifications</h3>
                </div>
                <div class="card-body">
                  ${notifications.length > 0 ? notifications.slice(0, 5).map(n => `
                    <div class="notification-item ${n.read ? '' : 'unread'}">
                      ${!n.read ? '<div class="notification-dot"></div>' : '<div style="width:8px;"></div>'}
                      <div class="notification-content">
                        <div class="notification-text"><strong>${escapeHtml(n.title)}</strong> — ${escapeHtml(n.message)}</div>
                        <div class="notification-time">${timeAgo(n.timestamp)}</div>
                      </div>
                    </div>
                  `).join('') : `
                    <div class="empty-state" style="padding:var(--space-8) var(--space-4);">
                      ${Icons.bell}
                      <div class="empty-state-title">No Notifications</div>
                      <div class="empty-state-text">You'll see updates about your queue status here.</div>
                    </div>
                  `}
                </div>
              </div>
            </div>

            <!-- Medical History -->
            <div class="card" style="margin-top: var(--space-6);">
              <div class="card-header">
                <h3 class="card-title">${Icons.fileText} Medical History</h3>
              </div>
              <div class="card-body">
                ${history.length > 0 ? `
                  <div class="timeline">
                    ${history.slice(0, 5).map(h => `
                      <div class="timeline-item">
                        <div class="timeline-dot"></div>
                        <div class="timeline-item-date">${formatDate(h.date)}</div>
                        <div class="timeline-item-title">${escapeHtml(h.department)} — ${escapeHtml(h.doctor || 'Doctor')}</div>
                        <div class="timeline-item-desc">Symptoms: ${escapeHtml(h.symptoms || 'N/A')} | Priority: ${h.priority} (Score: ${h.score})</div>
                      </div>
                    `).join('')}
                  </div>
                ` : `
                  <div class="empty-state" style="padding:var(--space-6) var(--space-4);">
                    ${Icons.fileText}
                    <div class="empty-state-title">No Medical History</div>
                    <div class="empty-state-text">Your visit history will appear here after your first consultation.</div>
                  </div>
                `}
              </div>
            </div>
          </div>
        </main>
      </div>
    `;

    attachEvents();
  }

  function renderQueueStatus(entry, position, waitTime) {
    const pd = getPriorityDisplay(entry.category);
    return `
      <div class="patient-status animate-fade-in" style="margin-top: var(--space-6);">
        <div class="patient-status-position">
          <div class="position-number">#${position}</div>
          <div class="position-label">In Queue</div>
        </div>
        <div class="patient-status-main">
          <div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-4);">
            <span class="badge ${pd.badge} badge-dot">${pd.label}</span>
            <span style="font-size:var(--font-size-sm);color:var(--text-muted);">Priority Score: <strong style="color:var(--text-primary)">${entry.priorityScore}</strong>/100</span>
          </div>
          <div class="status-details">
            <div class="status-detail-item">
              <div class="status-detail-value">${waitTime} min</div>
              <div class="status-detail-label">Est. Wait Time</div>
            </div>
            <div class="status-detail-item">
              <div class="status-detail-value">${escapeHtml(entry.department)}</div>
              <div class="status-detail-label">Department</div>
            </div>
            <div class="status-detail-item">
              <div class="status-detail-value">${entry.assignedDoctor ? escapeHtml(entry.assignedDoctor) : 'Pending'}</div>
              <div class="status-detail-label">Doctor</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function attachEvents() {
    // Logout
    document.getElementById('sidebar-user-btn')?.addEventListener('click', () => {
      Auth.logout();
      showToast('info', 'Signed Out', 'You have been signed out.');
      Router.navigate('/');
    });

    // Mobile menu toggle
    document.getElementById('menu-toggle')?.addEventListener('click', () => {
      document.getElementById('patient-sidebar').classList.toggle('open');
      document.getElementById('sidebar-overlay').classList.toggle('active');
    });
    document.getElementById('sidebar-overlay')?.addEventListener('click', () => {
      document.getElementById('patient-sidebar').classList.remove('open');
      document.getElementById('sidebar-overlay').classList.remove('active');
    });

    // Sidebar navigation (for views within dashboard)
    document.querySelectorAll('.sidebar-link[data-view]').forEach(link => {
      link.addEventListener('click', (e) => {
        const view = link.dataset.view;
        if (view === 'triage') { Router.navigate('/triage'); return; }
        if (view === 'appointments') { Router.navigate('/appointment'); return; }
        // Otherwise just re-render overview
        render();
      });
    });
  }

  render();
}
