import React, { useState, useEffect } from 'react';
import { Calendar, Flag, CheckCircle, Clock, AlertCircle, TrendingUp, ChevronRight } from 'lucide-react';

export default function EmployeeTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, inProgress: 0 });
  const [selectedTask, setSelectedTask] = useState(null);
  const [updating, setUpdating] = useState(false);

  const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Dummy task (frontend-only, for demonstration)
  const dummyTask = {
    _id: 'dummy-task-001',
    title: '📄 Complete Project Documentation',
    description: 'Prepare and finalize the technical documentation for the HRMS project.',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    status: 'pending',
    progress: 0,
    assignedByName: 'HR Manager (Demo)'
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/tasks/my-tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.length === 0) {
          // No real tasks → use dummy task for UI demonstration
          setTasks([dummyTask]);
        } else {
          setTasks(data);
        }
        calculateStats(data.length === 0 ? [dummyTask] : data);
      } else {
        // On error, still show dummy task
        setTasks([dummyTask]);
        calculateStats([dummyTask]);
      }
    } catch (err) {
      console.error(err);
      setTasks([dummyTask]);
      calculateStats([dummyTask]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (taskList) => {
    const total = taskList.length;
    const pending = taskList.filter(t => t.status === 'pending').length;
    const inProgress = taskList.filter(t => t.status === 'in-progress').length;
    const completed = taskList.filter(t => t.status === 'completed').length;
    setStats({ total, pending, inProgress, completed });
  };

  const updateTask = async (taskId, updates) => {
    setUpdating(true);
    // If it's the dummy task, update locally only
    if (taskId === 'dummy-task-001') {
      setTasks(prevTasks =>
        prevTasks.map(t =>
          t._id === taskId ? { ...t, ...updates } : t
        )
      );
      if (selectedTask?._id === taskId) {
        setSelectedTask(prev => ({ ...prev, ...updates }));
      }
      calculateStats(tasks.map(t => t._id === taskId ? { ...t, ...updates } : t));
      setUpdating(false);
      return;
    }

    // Real task: send to backend
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/tasks/my-tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        await fetchTasks();
        if (selectedTask?._id === taskId) {
          const updated = await res.json();
          setSelectedTask(updated);
        }
      } else {
        alert('Update failed');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      high: 'bg-red-100 text-red-700 border-red-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      low: 'bg-green-100 text-green-700 border-green-200'
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[priority]}`}>{priority.toUpperCase()}</span>;
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-gray-100 text-gray-700',
      'in-progress': 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700'
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>{status.replace('-', ' ').toUpperCase()}</span>;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* === New Heading: Task Management (White/Blue) === */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-6 text-white shadow-lg">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <CheckCircle className="h-8 w-8" />
            Task Management
          </h1>
          <p className="text-blue-100 mt-1">Track, prioritize, and complete your daily tasks</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-500">
            <p className="text-sm text-gray-500">Total Tasks</p>
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-yellow-500">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-400">
            <p className="text-sm text-gray-500">In Progress</p>
            <p className="text-2xl font-bold text-blue-400">{stats.inProgress}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-green-500">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-3 text-left text-sm font-semibold text-gray-600">Title</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-600">Due Date</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-600">Priority</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-600">Progress</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 ? (
                  <tr><td colSpan="6" className="p-8 text-center text-gray-500">No tasks assigned yet. (Add dummy task not shown?)</td></tr>
                ) : (
                  tasks.map(task => (
                    <tr key={task._id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedTask(task)}>
                      <td className="p-3 text-sm font-medium">{task.title}</td>
                      <td className="p-3 text-sm">{new Date(task.dueDate).toLocaleDateString()}</td>
                      <td className="p-3 text-sm">{getPriorityBadge(task.priority)}</td>
                      <td className="p-3 text-sm">{getStatusBadge(task.status)}</td>
                      <td className="p-3 text-sm">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${task.progress}%` }}></div>
                        </div>
                        <span className="text-xs ml-2">{task.progress}%</span>
                      </td>
                      <td className="p-3 text-sm">
                        <button className="text-blue-600 hover:text-blue-800" onClick={(e) => { e.stopPropagation(); setSelectedTask(task); }}>View Details</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Task Details Modal */}
        {selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{selectedTask.title}</h2>
                <button onClick={() => setSelectedTask(null)} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
              <div className="space-y-3">
                <p className="text-gray-600 text-sm">{selectedTask.description || 'No description'}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Due Date:</span>
                  <span>{new Date(selectedTask.dueDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Priority:</span>
                  <span>{getPriorityBadge(selectedTask.priority)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Assigned by:</span>
                  <span>{selectedTask.assignedByName}</span>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={selectedTask.status}
                    onChange={(e) => updateTask(selectedTask._id, { status: e.target.value })}
                    className="w-full border rounded p-2"
                    disabled={updating}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Progress: {selectedTask.progress}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={selectedTask.progress}
                    onChange={(e) => updateTask(selectedTask._id, { progress: parseInt(e.target.value) })}
                    className="w-full"
                    disabled={updating}
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <button onClick={() => setSelectedTask(null)} className="flex-1 bg-gray-200 py-2 rounded-lg">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}