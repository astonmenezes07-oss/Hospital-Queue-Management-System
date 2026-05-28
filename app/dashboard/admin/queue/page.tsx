'use client';

import { useEffect, useState, useCallback } from 'react';
import { initStore, loadQueue, saveQueue, getAppointment, updateAppointment, getDepartment, getDoctor, getDepartments } from '@/lib/store';
import type { QueueEntry, Department } from '@/types';

export default function QueueManagement() {
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [deptFilter, setDeptFilter] = useState('');
  const [search, setSearch] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editScore, setEditScore] = useState(50);
  const [editLevel, setEditLevel] = useState<'high' | 'medium' | 'low'>('medium');

  const load = useCallback(() => {
    initStore();
    const pq = loadQueue();
    setEntries(pq.getAll());
    setDepartments(getDepartments());
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [load]);

  const filtered = entries.filter((e) => {
    if (e.status !== 'waiting') return false;
    if (filter !== 'all' && e.priority.level !== filter) return false;
    if (deptFilter && e.departmentId !== deptFilter) return false;
    if (search && !e.patientName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handlePriorityChange = (appointmentId: string) => {
    const pq = loadQueue();
    pq.updatePriority(appointmentId, editScore, editLevel);
    saveQueue(pq.serialise());
    const apt = getAppointment(appointmentId);
    if (apt) updateAppointment(appointmentId, { priority: { ...apt.priority, total: editScore, level: editLevel } });
    setEditingId(null);
    load();
  };

  const markInProgress = (appointmentId: string) => {
    updateAppointment(appointmentId, { status: 'in_progress' });
    const pq = loadQueue();
    const all = pq.serialise();
    const idx = all.findIndex((e) => e.appointmentId === appointmentId);
    if (idx !== -1) { all[idx].status = 'in_progress'; }
    const newPq = loadQueue();
    newPq.load(all);
    saveQueue(newPq.serialise());
    load();
  };

  const markComplete = (appointmentId: string) => {
    updateAppointment(appointmentId, { status: 'completed' });
    const pq = loadQueue();
    pq.remove(appointmentId);
    saveQueue(pq.serialise());
    load();
  };

  const removeEntry = (appointmentId: string) => {
    const pq = loadQueue();
    pq.remove(appointmentId);
    saveQueue(pq.serialise());
    load();
  };

  const rebalance = () => {
    const pq = loadQueue();
    pq.rebalance();
    saveQueue(pq.serialise());
    load();
  };

  const priorityBadge = (level: string) => {
    const cls = level === 'high' ? 'bg-priority-high-bg text-priority-high' : level === 'medium' ? 'bg-priority-medium-bg text-priority-medium' : 'bg-priority-low-bg text-priority-low';
    return <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${cls}`}>{level}</span>;
  };

  const waiting = entries.filter((e) => e.status === 'waiting');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-text-primary">Queue Management</h1>
        <button onClick={rebalance} className="px-4 py-2 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand-dark transition-all shadow-sm">
          Rebalance Queue
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Waiting', value: waiting.length, color: 'text-brand' },
          { label: 'High Priority', value: waiting.filter((e) => e.priority.level === 'high').length, color: 'text-priority-high' },
          { label: 'Medium Priority', value: waiting.filter((e) => e.priority.level === 'medium').length, color: 'text-priority-medium' },
          { label: 'Low Priority', value: waiting.filter((e) => e.priority.level === 'low').length, color: 'text-priority-low' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-border/50 p-4">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search patient..."
          className="px-3 py-2 rounded-xl border border-border bg-white text-sm w-56 focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all" />
        <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="px-3 py-2 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all">
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all">
          <option value="">All Departments</option>
          {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      {/* Queue list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border/50 p-12 text-center text-sm text-text-muted">No patients matching filters.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((entry) => {
            const apt = getAppointment(entry.appointmentId);
            const doc = getDoctor(entry.doctorId);
            const dept = getDepartment(entry.departmentId);
            const isEditing = editingId === entry.appointmentId;

            return (
              <div key={entry.appointmentId} className="bg-white rounded-2xl border border-border/50 p-5 hover:shadow-sm transition-all">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-secondary flex items-center justify-center text-sm font-bold text-text-muted">
                      #{entry.position}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{entry.patientName}</p>
                      <p className="text-xs text-text-muted mt-0.5">{dept?.icon} {dept?.name} • {doc?.name}</p>
                      {apt && <p className="text-xs text-text-secondary mt-1">{apt.symptoms.slice(0, 60)}{apt.symptoms.length > 60 ? '...' : ''}</p>}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="flex items-center gap-2">
                      {priorityBadge(entry.priority.level)}
                      <span className="text-xs text-text-muted">Score: {entry.priority.total}</span>
                      <span className="text-xs text-text-muted">• {entry.estimatedWaitTime}m wait</span>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => { setEditingId(isEditing ? null : entry.appointmentId); setEditScore(entry.priority.total); setEditLevel(entry.priority.level); }}
                        className="px-2.5 py-1.5 rounded-lg bg-surface-secondary text-xs font-medium text-text-secondary hover:bg-surface-hover transition-all">
                        {isEditing ? 'Cancel' : 'Edit Priority'}
                      </button>
                      <button onClick={() => markInProgress(entry.appointmentId)}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-50 text-xs font-medium text-amber-700 hover:bg-amber-100 transition-all">
                        In Progress
                      </button>
                      <button onClick={() => markComplete(entry.appointmentId)}
                        className="px-2.5 py-1.5 rounded-lg bg-green-50 text-xs font-medium text-green-700 hover:bg-green-100 transition-all">
                        Complete
                      </button>
                      <button onClick={() => removeEntry(entry.appointmentId)}
                        className="px-2.5 py-1.5 rounded-lg bg-red-50 text-xs font-medium text-red-600 hover:bg-red-100 transition-all">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                {/* Edit Priority Panel */}
                {isEditing && (
                  <div className="mt-4 pt-4 border-t border-border/30 animate-fade-in">
                    <div className="flex flex-wrap items-center gap-4">
                      <div>
                        <label className="text-xs text-text-muted block mb-1">Level</label>
                        <select value={editLevel} onChange={(e) => setEditLevel(e.target.value as typeof editLevel)}
                          className="px-3 py-1.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand/30">
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                      <div className="flex-1 min-w-[200px]">
                        <label className="text-xs text-text-muted block mb-1">Score: {editScore}</label>
                        <input type="range" min="0" max="100" value={editScore} onChange={(e) => setEditScore(Number(e.target.value))}
                          className="w-full accent-brand" />
                      </div>
                      <button onClick={() => handlePriorityChange(entry.appointmentId)}
                        className="px-4 py-2 rounded-xl bg-brand text-white text-xs font-semibold hover:bg-brand-dark transition-all shadow-sm">
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-text-muted text-center">Auto-refreshes every 15 seconds</p>
    </div>
  );
}
