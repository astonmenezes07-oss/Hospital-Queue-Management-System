// ===== Landing Page =====

import { Icons } from '../utils/helpers.js';
import { Router } from '../router.js';

export function renderLanding(container) {
  container.innerHTML = `
    <!-- Public Topbar -->
    <nav class="public-topbar" id="landing-topbar">
      <a href="#/" class="public-topbar-logo">
        ${Icons.heartPulse}
        <span>Medi<span class="logo-highlight">Queue</span></span>
      </a>
      <div class="public-topbar-nav">
        <a href="#features">Features</a>
        <a href="#how-it-works">How It Works</a>
        <a href="#about">About</a>
      </div>
      <div class="public-topbar-actions">
        <a href="#/login" class="btn btn-ghost">Sign In</a>
        <a href="#/signup" class="btn btn-primary">Get Started</a>
      </div>
    </nav>

    <div class="landing-page">
      <!-- Hero Section -->
      <section class="hero">
        <div class="container">
          <div class="hero-content animate-fade-in-up">
            <div class="hero-badge">
              ${Icons.zap}
              <span>WHO ETAT-Based Triage System</span>
            </div>
            <h1>
              Intelligent Hospital<br>
              <span class="text-gradient">Priority Queue</span><br>
              Management
            </h1>
            <p class="hero-subtitle">
              Replace traditional waiting lines with AI-powered triage. 
              Critically ill patients receive immediate care through dynamic 
              ABCD emergency assessment and real-time priority scheduling.
            </p>
            <div class="hero-actions">
              <a href="#/signup" class="btn btn-primary btn-lg" id="hero-cta-book">
                ${Icons.calendar}
                Book Appointment
              </a>
              <a href="#/login" class="btn btn-outline btn-lg" id="hero-cta-login">
                Admin Login
                ${Icons.arrowRight}
              </a>
            </div>
          </div>
          <div class="hero-visual animate-fade-in">
            <div class="hero-illustration-placeholder" style="
              width: 100%;
              max-width: 460px;
              aspect-ratio: 4/3;
              background: linear-gradient(135deg, var(--color-primary-100), var(--color-secondary-100));
              border-radius: var(--radius-2xl);
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              gap: var(--space-4);
              padding: var(--space-8);
              box-shadow: var(--shadow-xl);
              position: relative;
              overflow: hidden;
            ">
              <!-- Simulated dashboard preview -->
              <div style="width:100%;background:white;border-radius:var(--radius-lg);padding:var(--space-4);box-shadow:var(--shadow-sm);">
                <div style="display:flex;gap:var(--space-3);margin-bottom:var(--space-3);">
                  <div style="flex:1;height:48px;background:var(--color-danger-50);border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;font-size:var(--font-size-xs);color:var(--color-danger-600);font-weight:600;">🚨 Emergency: 2</div>
                  <div style="flex:1;height:48px;background:var(--color-warning-50);border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;font-size:var(--font-size-xs);color:var(--color-warning-600);font-weight:600;">⚠️ Priority: 3</div>
                  <div style="flex:1;height:48px;background:var(--color-success-50);border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;font-size:var(--font-size-xs);color:var(--color-success-600);font-weight:600;">✅ Normal: 2</div>
                </div>
                <div style="space-y:8px;">
                  <div style="display:flex;align-items:center;gap:var(--space-2);padding:8px;background:var(--color-danger-50);border-radius:var(--radius-sm);margin-bottom:6px;">
                    <div style="width:24px;height:24px;border-radius:50%;background:var(--color-danger-500);color:white;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;">1</div>
                    <span style="font-size:12px;font-weight:500;">J. Harrison — Score: 82</span>
                    <span class="badge badge-emergency" style="margin-left:auto;font-size:10px;">Emergency</span>
                  </div>
                  <div style="display:flex;align-items:center;gap:var(--space-2);padding:8px;background:var(--color-danger-50);border-radius:var(--radius-sm);margin-bottom:6px;">
                    <div style="width:24px;height:24px;border-radius:50%;background:var(--color-danger-400);color:white;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;">2</div>
                    <span style="font-size:12px;font-weight:500;">M. Santos — Score: 65</span>
                    <span class="badge badge-emergency" style="margin-left:auto;font-size:10px;">Emergency</span>
                  </div>
                  <div style="display:flex;align-items:center;gap:var(--space-2);padding:8px;background:var(--color-warning-50);border-radius:var(--radius-sm);">
                    <div style="width:24px;height:24px;border-radius:50%;background:var(--color-warning-500);color:white;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;">3</div>
                    <span style="font-size:12px;font-weight:500;">D. Chen — Score: 52</span>
                    <span class="badge badge-urgent" style="margin-left:auto;font-size:10px;">Priority</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Trust Bar -->
      <section class="trust-bar">
        <div class="container">
          <div class="trust-stat">
            <div class="trust-stat-value">50%</div>
            <div class="trust-stat-label">Reduction in Wait Time</div>
          </div>
          <div class="trust-stat">
            <div class="trust-stat-value">ABCD</div>
            <div class="trust-stat-label">WHO ETAT Assessment</div>
          </div>
          <div class="trust-stat">
            <div class="trust-stat-value">Real-Time</div>
            <div class="trust-stat-label">Queue Rebalancing</div>
          </div>
          <div class="trust-stat">
            <div class="trust-stat-value">6+</div>
            <div class="trust-stat-label">Departments Covered</div>
          </div>
        </div>
      </section>

      <!-- How It Works -->
      <section class="how-it-works section" id="how-it-works">
        <div class="container">
          <div class="section-header">
            <h2>How It Works</h2>
            <p>A streamlined four-step process from registration to treatment, powered by intelligent triage algorithms.</p>
          </div>
          <div class="steps-grid">
            <div class="step-card">
              <div class="step-number">${Icons.user}</div>
              <h4>Register</h4>
              <p>Create your account and enter basic health information</p>
            </div>
            <div class="step-card">
              <div class="step-number">${Icons.clipboardList}</div>
              <h4>ABCD Triage</h4>
              <p>Automated emergency assessment evaluates your condition</p>
            </div>
            <div class="step-card">
              <div class="step-number">${Icons.list}</div>
              <h4>Priority Queue</h4>
              <p>Dynamic max-heap scheduling places you in the optimal position</p>
            </div>
            <div class="step-card">
              <div class="step-number">${Icons.stethoscope}</div>
              <h4>Treatment</h4>
              <p>See the right doctor at the right time, no unnecessary delays</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Features -->
      <section class="features section" id="features">
        <div class="container">
          <div class="section-header">
            <h2>Built for Modern Healthcare</h2>
            <p>Enterprise-grade features designed to optimize hospital workflow and improve patient outcomes.</p>
          </div>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon red">${Icons.alertTriangle}</div>
              <h4>ABCD Emergency Assessment</h4>
              <p>Evaluates Airway, Breathing, Circulation, and Dehydration using WHO ETAT guidelines to classify patient urgency.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon teal">${Icons.activity}</div>
              <h4>Max-Heap Priority Queue</h4>
              <p>Uses computer science priority scheduling to ensure the most critical patients are always treated first.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon amber">${Icons.zap}</div>
              <h4>Symptom-Based Prediction</h4>
              <p>Analyzes patient symptoms in real-time to predict emergency severity before hospital arrival.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon blue">${Icons.calendar}</div>
              <h4>Smart Appointment Booking</h4>
              <p>Online booking with department selection, symptom entry, and automatic priority estimation.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon green">${Icons.refreshCw}</div>
              <h4>Real-Time Rebalancing</h4>
              <p>Queue automatically adjusts priorities based on wait time, condition changes, and new arrivals.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon navy">${Icons.shield}</div>
              <h4>Secure Access Control</h4>
              <p>Role-based authentication with encrypted credentials, separate patient and admin dashboards.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="cta-section" id="about">
        <div class="container">
          <div class="cta-card">
            <h2>Ready to Transform Patient Care?</h2>
            <p>Join MediQueue and experience how intelligent priority scheduling can reduce waiting times and save lives.</p>
            <div class="cta-actions">
              <a href="#/signup" class="btn btn-primary btn-lg">Create Account</a>
              <a href="#/login" class="btn btn-outline btn-lg">Sign In</a>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="footer">
        <div class="container">
          <div class="footer-content">
            <div class="footer-logo">
              ${Icons.heartPulse}
              <span>MediQueue</span>
            </div>
            <div class="footer-links">
              <a href="#/">Home</a>
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#/login">Sign In</a>
            </div>
          </div>
          <div class="footer-copy">
            &copy; ${new Date().getFullYear()} MediQueue — Hospital Priority Queue Management System. 
            Built with Priority Queue Data Structures &amp; WHO ETAT Guidelines.
          </div>
        </div>
      </footer>
    </div>
  `;
}
