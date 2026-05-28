// ===== Login Page =====

import { Icons } from '../utils/helpers.js';
import { Auth } from '../auth.js';
import { Router } from '../router.js';
import { showToast } from '../utils/notifications.js';

export function renderLogin(container) {
  let activeRole = 'patient'; // 'patient' or 'admin'

  function render() {
    container.innerHTML = `
      <nav class="public-topbar">
        <a href="#/" class="public-topbar-logo">
          ${Icons.heartPulse}
          <span>Medi<span class="logo-highlight">Queue</span></span>
        </a>
        <div class="public-topbar-actions">
          <a href="#/" class="btn btn-ghost">Back to Home</a>
        </div>
      </nav>

      <div class="auth-page">
        <div class="auth-split">
          <div class="auth-branding">
            <div class="auth-branding-content">
              <div class="auth-branding-icon">${Icons.shield}</div>
              <h2>Welcome Back</h2>
              <p>Sign in to access your healthcare dashboard and manage your appointments with intelligent priority scheduling.</p>
              <div class="auth-features-list">
                <div class="auth-feature-item">${Icons.check} <span>Real-time queue tracking</span></div>
                <div class="auth-feature-item">${Icons.check} <span>ABCD triage assessment</span></div>
                <div class="auth-feature-item">${Icons.check} <span>Smart appointment booking</span></div>
                <div class="auth-feature-item">${Icons.check} <span>Priority-based scheduling</span></div>
              </div>
            </div>
          </div>

          <div class="auth-form-panel">
            <div class="auth-form-container animate-fade-in">
              <div class="auth-form-header">
                <h2>Sign In</h2>
                <p>Choose your role and enter your credentials</p>
              </div>

              <!-- Role Tabs -->
              <div class="role-tabs" id="role-tabs">
                <div class="role-tab ${activeRole === 'patient' ? 'active' : ''}" data-role="patient">
                  ${Icons.user} Patient
                </div>
                <div class="role-tab ${activeRole === 'admin' ? 'active' : ''}" data-role="admin">
                  ${Icons.shield} Administrator
                </div>
              </div>

              ${activeRole === 'patient' ? renderPatientLogin() : renderAdminLogin()}
            </div>
          </div>
        </div>
      </div>
    `;

    attachEvents();
  }

  function renderPatientLogin() {
    return `
      <form class="auth-form" id="login-form">
        <div class="form-group">
          <label class="form-label">Username</label>
          <input type="text" class="form-input" id="login-username" placeholder="Enter your username" required autocomplete="username">
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input type="password" class="form-input" id="login-password" placeholder="Enter your password" required autocomplete="current-password">
        </div>
        <button type="submit" class="btn btn-primary btn-lg w-full" id="login-btn">
          Sign In
        </button>

        <div class="form-divider">or</div>

        <button type="button" class="btn btn-google btn-lg w-full" id="google-btn">
          ${Icons.google}
          Sign in with Google
        </button>

        <div class="auth-form-footer">
          Don't have an account? <a href="#/signup">Create Account</a>
        </div>
      </form>
    `;
  }

  function renderAdminLogin() {
    return `
      <form class="auth-form" id="login-form">
        <div class="alert alert-info mb-4">
          ${Icons.shield}
          <div>
            <strong>Admin Access</strong><br>
            <span style="font-size:var(--font-size-xs);">Credentials are pre-assigned by hospital management. Use Admin ID: ADMIN001, Password: admin123</span>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Admin ID</label>
          <input type="text" class="form-input" id="login-adminid" placeholder="Enter Admin ID (e.g., ADMIN001)" required>
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input type="password" class="form-input" id="login-password" placeholder="Enter admin password" required>
        </div>
        <button type="submit" class="btn btn-secondary btn-lg w-full" id="login-btn">
          ${Icons.shield}
          Sign In as Admin
        </button>
        <div class="auth-form-footer">
          <a href="#/">← Back to Home</a>
        </div>
      </form>
    `;
  }

  function attachEvents() {
    // Role tabs
    document.querySelectorAll('.role-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        activeRole = tab.dataset.role;
        render();
      });
    });

    // Login form
    const form = document.getElementById('login-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('login-btn');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner spinner-sm"></span> Signing in...';

      try {
        if (activeRole === 'patient') {
          const username = document.getElementById('login-username').value.trim();
          const password = document.getElementById('login-password').value;
          await Auth.login(username, password);
          showToast('success', 'Welcome Back!', 'You have been signed in successfully.');
          Router.navigate('/patient');
        } else {
          const adminId = document.getElementById('login-adminid').value.trim();
          const password = document.getElementById('login-password').value;
          await Auth.adminLogin(adminId, password);
          showToast('success', 'Admin Access Granted', 'Welcome to the admin dashboard.');
          Router.navigate('/admin');
        }
      } catch (err) {
        showToast('error', 'Login Failed', err.message);
        btn.disabled = false;
        btn.innerHTML = activeRole === 'patient' ? 'Sign In' : `${Icons.shield} Sign In as Admin`;
      }
    });

    // Google sign-in
    const googleBtn = document.getElementById('google-btn');
    if (googleBtn) {
      googleBtn.addEventListener('click', async () => {
        googleBtn.disabled = true;
        googleBtn.innerHTML = '<span class="spinner spinner-sm"></span> Connecting...';
        try {
          await Auth.googleSignIn();
          showToast('success', 'Google Sign-In', 'Signed in with demo Google account.');
          Router.navigate('/patient');
        } catch (err) {
          showToast('error', 'Sign-In Failed', err.message);
          googleBtn.disabled = false;
          googleBtn.innerHTML = `${Icons.google} Sign in with Google`;
        }
      });
    }
  }

  render();
}
