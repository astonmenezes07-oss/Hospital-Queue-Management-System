// ===== Signup Page =====

import { Icons } from '../utils/helpers.js';
import { Auth } from '../auth.js';
import { Router } from '../router.js';
import { showToast } from '../utils/notifications.js';
import { validateEmail, validatePassword, getPasswordStrength, validateRequired, validateUsername, validateMatch } from '../utils/validators.js';

export function renderSignup(container) {
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
            <div class="auth-branding-icon">${Icons.heartPulse}</div>
            <h2>Join MediQueue</h2>
            <p>Create your account to access intelligent priority-based healthcare scheduling and never wait unnecessarily again.</p>
            <div class="auth-features-list">
              <div class="auth-feature-item">${Icons.check} <span>Book appointments online</span></div>
              <div class="auth-feature-item">${Icons.check} <span>Automatic triage assessment</span></div>
              <div class="auth-feature-item">${Icons.check} <span>Real-time queue position tracking</span></div>
              <div class="auth-feature-item">${Icons.check} <span>Medical history access</span></div>
            </div>
          </div>
        </div>

        <div class="auth-form-panel">
          <div class="auth-form-container animate-fade-in">
            <div class="auth-form-header">
              <h2>Create Account</h2>
              <p>Enter your details to get started</p>
            </div>

            <form class="auth-form" id="signup-form">
              <div class="form-group">
                <label class="form-label">Full Name <span class="required">*</span></label>
                <input type="text" class="form-input" id="signup-fullname" placeholder="Enter your full name" required>
                <div class="form-error" id="error-fullname" style="display:none;"></div>
              </div>

              <div class="auth-form-row">
                <div class="form-group">
                  <label class="form-label">Username <span class="required">*</span></label>
                  <input type="text" class="form-input" id="signup-username" placeholder="Choose a username" required autocomplete="username">
                  <div class="form-error" id="error-username" style="display:none;"></div>
                </div>
                <div class="form-group">
                  <label class="form-label">Email <span class="required">*</span></label>
                  <input type="email" class="form-input" id="signup-email" placeholder="your@email.com" required autocomplete="email">
                  <div class="form-error" id="error-email" style="display:none;"></div>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Password <span class="required">*</span></label>
                <input type="password" class="form-input" id="signup-password" placeholder="Create a strong password" required autocomplete="new-password">
                <div class="password-strength" id="password-strength">
                  <div class="password-strength-bar" id="pw-bar-1"></div>
                  <div class="password-strength-bar" id="pw-bar-2"></div>
                  <div class="password-strength-bar" id="pw-bar-3"></div>
                  <div class="password-strength-bar" id="pw-bar-4"></div>
                  <div class="password-strength-bar" id="pw-bar-5"></div>
                </div>
                <div class="form-hint" id="pw-hint">Min 6 chars, 1 uppercase, 1 number</div>
                <div class="form-error" id="error-password" style="display:none;"></div>
              </div>

              <div class="form-group">
                <label class="form-label">Confirm Password <span class="required">*</span></label>
                <input type="password" class="form-input" id="signup-confirm" placeholder="Confirm your password" required autocomplete="new-password">
                <div class="form-error" id="error-confirm" style="display:none;"></div>
              </div>

              <button type="submit" class="btn btn-primary btn-lg w-full" id="signup-btn">
                Create Account
              </button>

              <div class="form-divider">or</div>

              <button type="button" class="btn btn-google btn-lg w-full" id="google-signup-btn">
                ${Icons.google}
                Sign up with Google
              </button>

              <div class="auth-form-footer">
                Already have an account? <a href="#/login">Sign In</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;

  attachEvents();
}

function attachEvents() {
  // Password strength indicator
  const pwInput = document.getElementById('signup-password');
  pwInput.addEventListener('input', () => {
    const strength = getPasswordStrength(pwInput.value);
    const bars = [1, 2, 3, 4, 5].map(i => document.getElementById(`pw-bar-${i}`));
    bars.forEach(bar => bar.className = 'password-strength-bar');

    const strengthMap = { weak: 2, medium: 3, strong: 5 };
    const count = strengthMap[strength] || 0;
    for (let i = 0; i < count; i++) {
      bars[i].classList.add(`filled-${strength}`);
    }
  });

  // Form submission
  const form = document.getElementById('signup-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Reset errors
    document.querySelectorAll('.form-error').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.form-input.error').forEach(el => el.classList.remove('error'));

    const fullName = document.getElementById('signup-fullname').value.trim();
    const username = document.getElementById('signup-username').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;

    // Validate
    let hasError = false;

    const nameErr = validateRequired(fullName, 'Full name');
    if (nameErr) { showError('fullname', nameErr); hasError = true; }

    const userErr = validateUsername(username);
    if (userErr) { showError('username', userErr); hasError = true; }

    if (!validateEmail(email)) { showError('email', 'Invalid email address'); hasError = true; }

    const pwValid = validatePassword(password);
    if (!pwValid.valid) { showError('password', pwValid.errors[0]); hasError = true; }

    const matchErr = validateMatch(password, confirm, 'Passwords');
    if (matchErr) { showError('confirm', matchErr); hasError = true; }

    if (hasError) return;

    const btn = document.getElementById('signup-btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner spinner-sm"></span> Creating account...';

    try {
      await Auth.signup({ fullName, username, email, password });
      showToast('success', 'Account Created!', 'Welcome to MediQueue. Redirecting to your dashboard...');
      setTimeout(() => Router.navigate('/patient'), 500);
    } catch (err) {
      showToast('error', 'Signup Failed', err.message);
      btn.disabled = false;
      btn.innerHTML = 'Create Account';
    }
  });

  // Google signup
  const googleBtn = document.getElementById('google-signup-btn');
  googleBtn.addEventListener('click', async () => {
    googleBtn.disabled = true;
    googleBtn.innerHTML = '<span class="spinner spinner-sm"></span> Connecting...';
    try {
      await Auth.googleSignIn();
      showToast('success', 'Google Sign-Up', 'Account created with demo Google account.');
      Router.navigate('/patient');
    } catch (err) {
      showToast('error', 'Sign-Up Failed', err.message);
      googleBtn.disabled = false;
      googleBtn.innerHTML = `${Icons.google} Sign up with Google`;
    }
  });
}

function showError(field, message) {
  const errorEl = document.getElementById(`error-${field}`);
  const inputEl = document.getElementById(`signup-${field}`);
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = 'flex';
  }
  if (inputEl) inputEl.classList.add('error');
}
