import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertCircle, Calendar, X, ChevronRight, ListChecks } from 'lucide-react';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002';

const PRIORITY = {
  high:   { label: 'HIGH',   cls: 'bg-red-100 text-red-700'     },
  medium: { label: 'MED',    cls: 'bg-yellow-100 text-yellow-700' },
  low:    { label: 'LOW',    cls: 'bg-green-100 text-green-700'  },
};

const STATUS = {
  'pending':     { label: 'Pending',     cls: 'bg-gray-100 text-gray-600',   icon: <Clock className="h-3.5 w-3.5" />        },
  'in-progress': { label: 'In Progress', cls: 'bg-blue-100 text-blue-700',   icon: <AlertCircle className="h-3.5 w-3.5" />  },
  'completed':   { label: 'Completed',   cls: 'bg-green-100 text-green-700', icon: <CheckCircle className="h-3.5 w-3.5" /> },
};

const dummyTask = {
  _id: 'dummy-task-001',
  title: 'Complete Project Documentation',
  description: 'Prepare and finalize the technical documentation for the HRMS project.',
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  priority: 'high',
  status: 'pending',
  progress: 0,
  assignedByName: 'HR Manager (Demo)',
};

export default function EmployeeTasksPage() {
  const [tasks, setTasks]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [updating, setUpdating]         = useState(false);

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/tasks/my-tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data.length === 0 ? [dummyTask] : data);
      } else {
        setTasks([dummyTask]);
      }
    } catch {
      setTasks([dummyTask]);
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (taskId, updates) => {
    setUpdating(true);
    if (taskId === 'dummy-task-001') {
      const updated = tasks.map(t => t._id === taskId ? { ...t, ...updates } : t);
      setTasks(updated);
      if (selectedTask?._id === taskId) setSelectedTask(prev => ({ ...prev, ...updates }));
      setUpdating(false);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/tasks/my-tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        await fetchTasks();
        if (selectedTask?._id === taskId) setSelectedTask(prev => ({ ...prev, ...updates }));
      }
    } catch (err) { console.error(err); }
    finally { setUpdating(false); }
  };

  const total      = tasks.length;
  const pending    = tasks.filter(t => t.status === 'pending').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const completed  = tasks.filter(t => t.status === 'completed').length;

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-8 pt-20 pb-10">

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
        <p className="text-gray-500 text-sm mt-1">Track, prioritize, and complete your daily tasks</p>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <ListChecks className="h-5 w-5 text-blue-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{total}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total Tasks</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <Clock className="h-5 w-5 text-yellow-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{pending}</p>
            <p className="text-xs text-gray-500 mt-0.5">Pending</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <AlertCircle className="h-5 w-5 text-blue-400 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{inProgress}</p>
            <p className="text-xs text-gray-500 mt-0.5">In Progress</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <CheckCircle className="h-5 w-5 text-green-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{completed}</p>
            <p className="text-xs text-gray-500 mt-0.5">Completed</p>
          </div>
        </div>

        {/* Task list */}
        {tasks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <ListChecks className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No tasks assigned yet</p>
            <p className="text-sm text-gray-400 mt-1">Your manager will assign tasks to you soon.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map(task => {
              const prio = PRIORITY[task.priority] || PRIORITY.medium;
              const stat = STATUS[task.status]     || STATUS.pending;
              const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
              const pct = task.progress || 0;
              return (
                <div
                  key={task._id}
                  onClick={() => setSelectedTask(task)}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4 cursor-pointer hover:shadow-md hover:border-gray-200 transition group"
                >
                  {/* Status icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.cls}`}>
                    {stat.icon}
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition">{task.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`inline-flex items-center gap-1 text-xs ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
                        <Calendar className="h-3 w-3" />
                        {new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {isOverdue && ' · Overdue'}
                      </span>
                      {task.assignedByName && (
                        <span className="text-xs text-gray-400">by {task.assignedByName}</span>
                      )}
                    </div>
                    {/* Progress bar */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${pct >= 80 ? 'bg-green-500' : pct >= 40 ? 'bg-blue-500' : 'bg-yellow-400'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${prio.cls}`}>{prio.label}</span>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${stat.cls}`}>
                      {stat.label}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300 flex-shrink-0" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selectedTask.title}</h2>
                <p className="text-xs text-gray-400 mt-0.5">Assigned by {selectedTask.assignedByName || '—'}</p>
              </div>
              <button onClick={() => setSelectedTask(null)} className="p-1.5 hover:bg-gray-100 rounded-xl transition">
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-5 leading-relaxed">{selectedTask.description || 'No description provided.'}</p>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">Due Date</p>
                <p className="text-sm font-semibold text-gray-800">{new Date(selectedTask.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">Priority</p>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${PRIORITY[selectedTask.priority]?.cls}`}>
                  {PRIORITY[selectedTask.priority]?.label}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Status</label>
                <select
                  value={selectedTask.status}
                  onChange={e => updateTask(selectedTask._id, { status: e.target.value })}
                  disabled={updating}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Progress</label>
                  <span className="text-xs font-bold text-blue-600">{selectedTask.progress}%</span>
                </div>
                <input
                  type="range" min="0" max="100"
                  value={selectedTask.progress}
                  onChange={e => updateTask(selectedTask._id, { progress: parseInt(e.target.value) })}
                  disabled={updating}
                  className="w-full accent-blue-600"
                />
                <div className="h-2 bg-gray-100 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${selectedTask.progress}%` }} />
                </div>
              </div>
            </div>

            <button onClick={() => setSelectedTask(null)} className="mt-5 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium transition">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
