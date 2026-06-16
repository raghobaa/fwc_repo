import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle, Trash2, Edit, Plus, X, Clock,
  AlertCircle, ListChecks, Calendar, Brain, Save
} from 'lucide-react';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002';

const PRIORITY = {
  high:   { label: 'High',   cls: 'bg-red-100 text-red-700',     dot: 'bg-red-500'    },
  medium: { label: 'Medium', cls: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400' },
  low:    { label: 'Low',    cls: 'bg-green-100 text-green-700',  dot: 'bg-green-500'  },
};

export default function AiWorkAssistantPage() {
  const [tasks, setTasks]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [newTask, setNewTask]           = useState({ title: '', description: '', priority: 'medium', dueDate: '' });
  const [editingId, setEditingId]       = useState(null);
  const [editData, setEditData]         = useState({});
  const [deleteId, setDeleteId]         = useState(null);
  const [filter, setFilter]             = useState('all');
  const [adding, setAdding]             = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/work-assistant/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      } else {
        const errText = await res.text();
        console.error('Work assistant tasks API error:', res.status, errText);
      }
    } catch (err) { console.error('Work assistant fetch failed:', err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const addTask = async () => {
    if (!newTask.title.trim()) return;
    setAdding(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/work-assistant/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newTask),
      });
      if (res.ok) { setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' }); fetchTasks(); }
    } catch (err) { console.error(err); }
    finally { setAdding(false); }
  };

  const saveEdit = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${BASE_URL}/api/work-assistant/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editData),
      });
      setEditingId(null); fetchTasks();
    } catch (err) { console.error(err); }
  };

  const markDone = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${BASE_URL}/api/work-assistant/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'completed' }),
      });
      fetchTasks();
    } catch (err) { console.error(err); }
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${BASE_URL}/api/work-assistant/tasks/${deleteId}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      });
      setDeleteId(null); fetchTasks();
    } catch (err) { console.error(err); }
  };

  const total     = tasks.length;
  const pending   = tasks.filter(t => t.status === 'pending').length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const highPrio  = tasks.filter(t => t.priority === 'high' && t.status === 'pending').length;

  const displayed = tasks.filter(t => {
    if (filter === 'pending')   return t.status === 'pending';
    if (filter === 'completed') return t.status === 'completed';
    if (filter === 'high')      return t.priority === 'high' && t.status === 'pending';
    return true;
  });

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-8 pt-20 pb-10">

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-50 rounded-xl w-10 h-10 flex items-center justify-center">
            <Brain className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Work Assistant</h1>
            <p className="text-gray-500 text-sm mt-0.5">Smart task prioritization and daily planner</p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
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
            <CheckCircle className="h-5 w-5 text-green-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{completed}</p>
            <p className="text-xs text-gray-500 mt-0.5">Completed</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <AlertCircle className="h-5 w-5 text-red-400 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{highPrio}</p>
            <p className="text-xs text-gray-500 mt-0.5">High Priority</p>
          </div>
        </div>

        {/* Add task form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">Add New Task</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              placeholder="Task title *"
              value={newTask.title}
              onChange={e => setNewTask({ ...newTask, title: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && addTask()}
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newTask.description}
              onChange={e => setNewTask({ ...newTask, description: e.target.value })}
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={newTask.priority}
              onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
            <input
              type="date"
              value={newTask.dueDate}
              onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={addTask}
            disabled={adding || !newTask.title.trim()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition"
          >
            <Plus className="h-4 w-4" />{adding ? 'Adding...' : 'Add Task'}
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {[
            { key: 'all',       label: `All (${total})`         },
            { key: 'pending',   label: `Pending (${pending})`   },
            { key: 'high',      label: `High Priority (${highPrio})` },
            { key: 'completed', label: `Completed (${completed})` },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-1.5 rounded-xl text-sm font-medium border transition ${
                filter === f.key
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Task list */}
        {displayed.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <ListChecks className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No tasks here</p>
            <p className="text-sm text-gray-400 mt-1">Use the form above to add your first task.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayed.map(task => {
              const prio = PRIORITY[task.priority] || PRIORITY.medium;
              const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
              const isEditing = editingId === task._id;

              return (
                <div
                  key={task._id}
                  className={`bg-white rounded-2xl border shadow-sm transition ${
                    task.status === 'completed' ? 'border-gray-100 opacity-60' : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  {isEditing ? (
                    <div className="p-5 space-y-3">
                      <input
                        value={editData.title}
                        onChange={e => setEditData({ ...editData, title: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        value={editData.description}
                        onChange={e => setEditData({ ...editData, description: e.target.value })}
                        placeholder="Description"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex gap-2">
                        <select
                          value={editData.priority}
                          onChange={e => setEditData({ ...editData, priority: e.target.value })}
                          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                        <button onClick={() => saveEdit(task._id)} className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium">
                          <Save className="h-3.5 w-3.5" />Save
                        </button>
                        <button onClick={() => setEditingId(null)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 px-5 py-4">
                      {/* Priority dot */}
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${prio.dot}`} />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-gray-900 truncate ${task.status === 'completed' ? 'line-through text-gray-400' : ''}`}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs text-gray-400 mt-0.5 truncate">{task.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1">
                          {task.dueDate && (
                            <span className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
                              <Calendar className="h-3 w-3" />
                              {new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              {isOverdue && ' · Overdue'}
                            </span>
                          )}
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${prio.cls}`}>{prio.label}</span>
                          {task.status === 'completed' && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />Done
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {task.status !== 'completed' && (
                          <button
                            onClick={() => markDone(task._id)}
                            title="Mark complete"
                            className="p-2 rounded-xl hover:bg-green-50 text-gray-400 hover:text-green-600 transition"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => { setEditingId(task._id); setEditData({ title: task.title, description: task.description || '', priority: task.priority }); }}
                          className="p-2 rounded-xl hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(task._id)}
                          className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Task</h3>
            <p className="text-gray-500 text-sm mb-5">Are you sure? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition">
                Cancel
              </button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
