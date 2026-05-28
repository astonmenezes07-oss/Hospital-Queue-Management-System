// ===== Max-Heap Priority Queue =====
// Patients with higher priority scores are treated first.
// Ties are broken by arrival time (earlier = higher priority).

export class MaxHeapPriorityQueue {
  constructor() {
    this.heap = [];
  }

  // Insert a patient into the priority queue — O(log n)
  insert(patient) {
    this.heap.push(patient);
    this._bubbleUp(this.heap.length - 1);
  }

  // Extract the patient with highest priority — O(log n)
  extractMax() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();

    const max = this.heap[0];
    this.heap[0] = this.heap.pop();
    this._sinkDown(0);
    return max;
  }

  // Peek at the highest-priority patient without removing — O(1)
  peek() {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  // Update a patient's priority and rebalance — O(n) find + O(log n) fix
  updatePriority(patientId, newScore) {
    const index = this.heap.findIndex(p => p.id === patientId);
    if (index === -1) return false;

    const oldScore = this.heap[index].priorityScore;
    this.heap[index].priorityScore = newScore;

    if (newScore > oldScore) {
      this._bubbleUp(index);
    } else {
      this._sinkDown(index);
    }
    return true;
  }

  // Remove a patient from the queue — O(n) find + O(log n) fix
  remove(patientId) {
    const index = this.heap.findIndex(p => p.id === patientId);
    if (index === -1) return null;

    const removed = this.heap[index];

    if (index === this.heap.length - 1) {
      this.heap.pop();
    } else {
      this.heap[index] = this.heap.pop();
      // Could need to go up or down
      this._bubbleUp(index);
      this._sinkDown(index);
    }

    return removed;
  }

  // Find a patient by ID — O(n)
  find(patientId) {
    return this.heap.find(p => p.id === patientId) || null;
  }

  // Get queue size
  size() {
    return this.heap.length;
  }

  // Check if queue is empty
  isEmpty() {
    return this.heap.length === 0;
  }

  // Return sorted array (highest priority first) for display
  toSortedArray() {
    return [...this.heap].sort((a, b) => {
      if (b.priorityScore !== a.priorityScore) {
        return b.priorityScore - a.priorityScore;
      }
      // Tie-break: earlier arrival time gets higher priority
      return new Date(a.arrivalTime) - new Date(b.arrivalTime);
    });
  }

  // Return raw heap array (for persistence)
  toArray() {
    return [...this.heap];
  }

  // Rebuild heap from an array (for loading from storage)
  buildFrom(patients) {
    this.heap = [...patients];
    // Build heap bottom-up — O(n)
    for (let i = Math.floor(this.heap.length / 2) - 1; i >= 0; i--) {
      this._sinkDown(i);
    }
  }

  // --- Internal heap operations ---

  _compare(a, b) {
    // Returns true if a has higher priority than b
    if (a.priorityScore !== b.priorityScore) {
      return a.priorityScore > b.priorityScore;
    }
    // Tie-break: earlier arrival time wins
    return new Date(a.arrivalTime) < new Date(b.arrivalTime);
  }

  _bubbleUp(index) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this._compare(this.heap[index], this.heap[parentIndex])) {
        this._swap(index, parentIndex);
        index = parentIndex;
      } else {
        break;
      }
    }
  }

  _sinkDown(index) {
    const length = this.heap.length;
    while (true) {
      let largest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;

      if (left < length && this._compare(this.heap[left], this.heap[largest])) {
        largest = left;
      }
      if (right < length && this._compare(this.heap[right], this.heap[largest])) {
        largest = right;
      }
      if (largest !== index) {
        this._swap(index, largest);
        index = largest;
      } else {
        break;
      }
    }
  }

  _swap(i, j) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }
}
