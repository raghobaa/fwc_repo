import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, Trash2, Edit, Save, Plus } from 'lucide-react';

export default function AiWorkAssistantPage() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', dueDate: '' });
  const [editingTask, setEditingTask] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002';

  const fetchTasks = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/work-assistant/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  }, [BASE_URL]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async () => {
    if (!newTask.title) return alert('Title is required');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/work-assistant/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newTask)
      });
      if (res.ok) {
        setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' });
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateTask = async (id, updates) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/work-assistant/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        fetchTasks();
        setEditingTask(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (id) => {
    setTaskToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${BASE_URL}/api/work-assistant/tasks/${taskToDelete}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks();
    } catch (err) {
      console.error(err);
    } finally {
      setShowDeleteConfirm(false);
      setTaskToDelete(null);
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">AI Work Assistant</h1>

        {/* Only one tab – no selector needed */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">📋 Smart Task Prioritization</h2>

          {/* Add Task Form */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">Add New Task</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Title"
                value={newTask.title}
                onChange={e => setNewTask({...newTask, title: e.target.value})}
                className="border rounded p-2"
              />
              <input
                type="text"
                placeholder="Description"
                value={newTask.description}
                onChange={e => setNewTask({...newTask, description: e.target.value})}
                className="border rounded p-2"
              />
              <select
                value={newTask.priority}
                onChange={e => setNewTask({...newTask, priority: e.target.value})}
                className="border rounded p-2"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
              <input
                type="date"
                value={newTask.dueDate}
                onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                className="border rounded p-2"
              />
              <button
                onClick={addTask}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" /> Add Task
              </button>
            </div>
          </div>

          {/* Task List */}
          <div className="space-y-3">
            {tasks.map(task => (
              <div key={task._id} className="border rounded-lg p-4 hover:shadow transition">
                {editingTask === task._id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={task.title}
                      onChange={e => setTasks(tasks.map(t => t._id === task._id ? {...t, title: e.target.value} : t))}
                      className="border rounded p-2 w-full"
                    />
                    <textarea
                      value={task.description}
                      onChange={e => setTasks(tasks.map(t => t._id === task._id ? {...t, description: e.target.value} : t))}
                      className="border rounded p-2 w-full"
                    />
                    <select
                      value={task.priority}
                      onChange={e => setTasks(tasks.map(t => t._id === task._id ? {...t, priority: e.target.value} : t))}
                      className="border rounded p-2"
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateTask(task._id, { title: task.title, description: task.description, priority: task.priority })}
                        className="bg-green-600 text-white px-3 py-1 rounded"
                      >
                        Save
                      </button>
                      <button onClick={() => setEditingTask(null)} className="bg-gray-300 px-3 py-1 rounded">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{task.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        {task.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-600" />}
                      </div>
                      <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {task.status !== 'completed' && (
                        <button onClick={() => updateTask(task._id, { status: 'completed' })} className="text-green-600">
                          <CheckCircle className="h-5 w-5" />
                        </button>
                      )}
                      <button onClick={() => setEditingTask(task._id)} className="text-blue-600">
                        <Edit className="h-5 w-5" />
                      </button>
                      <button onClick={() => deleteTask(task._id)} className="text-red-600">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {tasks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No tasks yet. Use the form above to create your first task.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Delete Task</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this task? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400">
                Cancel
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}