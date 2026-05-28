// ===== localStorage Abstraction Layer =====

export const Store = {
  PREFIX: 'mediqueue_',

  get(collection) {
    try {
      const data = localStorage.getItem(this.PREFIX + collection);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error(`Store.get(${collection}) error:`, e);
      return null;
    }
  },

  set(collection, data) {
    try {
      localStorage.setItem(this.PREFIX + collection, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error(`Store.set(${collection}) error:`, e);
      return false;
    }
  },

  // Get all items in a collection (array-based)
  getAll(collection) {
    return this.get(collection) || [];
  },

  // Find by ID in an array collection
  findById(collection, id) {
    const items = this.getAll(collection);
    return items.find(item => item.id === id) || null;
  },

  // Add an item to an array collection
  add(collection, item) {
    const items = this.getAll(collection);
    items.push(item);
    this.set(collection, items);
    return item;
  },

  // Update an item by ID in an array collection
  update(collection, id, updates) {
    const items = this.getAll(collection);
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...updates };
    this.set(collection, items);
    return items[index];
  },

  // Remove an item by ID from an array collection
  remove(collection, id) {
    const items = this.getAll(collection);
    const filtered = items.filter(item => item.id !== id);
    this.set(collection, filtered);
    return filtered.length < items.length;
  },

  // Check if seed data has been initialized
  isInitialized() {
    return this.get('initialized') === true;
  },

  // Mark as initialized
  markInitialized() {
    this.set('initialized', true);
  },

  // Clear all data
  clearAll() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(this.PREFIX));
    keys.forEach(k => localStorage.removeItem(k));
  }
};
