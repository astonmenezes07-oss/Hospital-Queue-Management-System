// ===== Client-Side Hash Router =====

import { Auth } from './auth.js';

class RouterClass {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    this.appContainer = null;
  }

  init(containerId = 'app') {
    this.appContainer = document.getElementById(containerId);
    window.addEventListener('hashchange', () => this._handleRoute());
    // Handle initial load
    this._handleRoute();
  }

  // Register a route
  register(path, handler, options = {}) {
    this.routes[path] = { handler, ...options };
  }

  // Navigate to a route
  navigate(path) {
    window.location.hash = path;
  }

  // Get current path
  getPath() {
    return window.location.hash.slice(1) || '/';
  }

  // --- Internal route handler ---
  _handleRoute() {
    const path = this.getPath();
    const route = this.routes[path];

    if (!route) {
      // 404 - redirect to landing
      this.navigate('/');
      return;
    }

    // Route guards
    if (route.requireAuth && !Auth.isAuthenticated()) {
      this.navigate('/login');
      return;
    }

    if (route.requireRole) {
      const currentRole = Auth.getRole();
      if (currentRole !== route.requireRole) {
        this.navigate(currentRole === 'admin' ? '/admin' : '/patient');
        return;
      }
    }

    // Redirect if already authenticated
    if (route.guestOnly && Auth.isAuthenticated()) {
      const role = Auth.getRole();
      this.navigate(role === 'admin' ? '/admin' : '/patient');
      return;
    }

    this.currentRoute = path;

    // Scroll to top
    window.scrollTo(0, 0);

    // Render the route
    if (this.appContainer) {
      route.handler(this.appContainer);
    }
  }
}

export const Router = new RouterClass();
