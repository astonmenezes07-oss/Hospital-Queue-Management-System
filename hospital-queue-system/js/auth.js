// ===== Authentication System =====

import { Store } from './data/store.js';
import { hashPassword, verifyPassword } from './utils/crypto.js';
import { generateId } from './utils/helpers.js';

export const Auth = {
  SESSION_KEY: 'mediqueue_session',

  // --- Patient Signup ---
  async signup({ fullName, username, email, password }) {
    // Check if username exists
    const users = Store.getAll('users');
    if (users.find(u => u.username === username)) {
      throw new Error('Username already exists');
    }
    if (users.find(u => u.email === email)) {
      throw new Error('Email already registered');
    }

    const hashedPw = await hashPassword(password);
    const user = {
      id: generateId('P_'),
      fullName,
      username,
      email,
      password: hashedPw,
      role: 'patient',
      age: null,
      preExistingConditions: [],
      createdAt: new Date().toISOString()
    };

    Store.add('users', user);
    this._setSession(user);
    return user;
  },

  // --- Patient Login ---
  async login(username, password) {
    const users = Store.getAll('users');
    const user = users.find(u => u.username === username);
    if (!user) throw new Error('Invalid username or password');

    const valid = await verifyPassword(password, user.password);
    if (!valid) throw new Error('Invalid username or password');

    this._setSession(user);
    return user;
  },

  // --- Admin Login ---
  async adminLogin(adminId, password) {
    const admins = Store.getAll('admins');
    const admin = admins.find(a => a.adminId === adminId);
    if (!admin) throw new Error('Invalid Admin ID or password');

    const valid = await verifyPassword(password, admin.password);
    if (!valid) throw new Error('Invalid Admin ID or password');

    this._setSession({ ...admin, role: 'admin' });
    return admin;
  },

  // --- Google OAuth Simulation ---
  async googleSignIn() {
    // Simulated Google OAuth — creates a demo account
    const demoUser = {
      id: generateId('P_'),
      fullName: 'Demo Patient',
      username: 'demo_' + Math.random().toString(36).slice(2, 6),
      email: 'demo@example.com',
      password: await hashPassword('demo123'),
      role: 'patient',
      age: 30,
      preExistingConditions: [],
      createdAt: new Date().toISOString(),
      isGoogleUser: true
    };

    // Check if demo user exists
    const users = Store.getAll('users');
    const existing = users.find(u => u.isGoogleUser);
    if (existing) {
      this._setSession(existing);
      return existing;
    }

    Store.add('users', demoUser);
    this._setSession(demoUser);
    return demoUser;
  },

  // --- Logout ---
  logout() {
    sessionStorage.removeItem(this.SESSION_KEY);
  },

  // --- Get current user ---
  getCurrentUser() {
    try {
      const session = sessionStorage.getItem(this.SESSION_KEY);
      return session ? JSON.parse(session) : null;
    } catch {
      return null;
    }
  },

  // --- Check authentication ---
  isAuthenticated() {
    return this.getCurrentUser() !== null;
  },

  // --- Get current role ---
  getRole() {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  },

  // --- Update user profile ---
  updateProfile(updates) {
    const user = this.getCurrentUser();
    if (!user) return null;

    if (user.role === 'patient') {
      Store.update('users', user.id, updates);
    }

    // Update session
    const updatedUser = { ...user, ...updates };
    this._setSession(updatedUser);
    return updatedUser;
  },

  // --- Internal ---
  _setSession(user) {
    const sessionData = {
      id: user.id,
      fullName: user.fullName,
      username: user.username || user.adminId,
      email: user.email,
      role: user.role,
      department: user.department,
      age: user.age,
      preExistingConditions: user.preExistingConditions,
    };
    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
  }
};
