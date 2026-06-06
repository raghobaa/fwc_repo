import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import ErrorBoundary from '../components/ErrorBoundary';
import interviewsService from '../api/interviewsService';

const StatusPill = ({ status }) => {
  const color = {
    scheduled: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-200 text-gray-700',
  }[status] || 'bg-gray-100 text-gray-800';
  return <span className={`px-2 py-1 rounded text-xs font-medium ${color}`}>{status}</span>;
};

const initialForm = { title: '', candidateId: '', interviewerIds: '', scheduledAt: '', duration: 60, notes: '' };

const HRInterviewsPageInner = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await interviewsService.list();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError('Failed to load interviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => { setForm(initialForm); setEditing(null); };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        title: form.title.trim(),
        candidateId: form.candidateId.trim(),
        interviewerIds: form.interviewerIds.split(',').map(s => s.trim()).filter(Boolean),
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        duration: Number(form.duration || 60),
        notes: form.notes || '',
      };
      if (editing) {
        await interviewsService.update(editing._id, payload);
      } else {
        await interviewsService.create(payload);
      }
      await load();
      setShowForm(false);
      resetForm();
    } catch (e) {
      if (e?.response?.status === 409) setError('Time slot overlaps for a participant');
      else setError(e?.response?.data?.message || 'Failed to save interview');
    } finally {
      setLoading(false);
    }
  };

  const onEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title,
      candidateId: item.candidateId?._id || item.candidateId,
      interviewerIds: (item.interviewerIds || []).map(x => x?._id || x).join(', '),
      scheduledAt: (item.scheduledAt && !Number.isNaN(new Date(item.scheduledAt).getTime()))
        ? new Date(item.scheduledAt).toISOString().slice(0,16)
        : '',
      duration: item.duration || 60,
      notes: item.notes || '',
    });
    setShowForm(true);
  };

  const onCancel = async (id) => {
    if (!window.confirm('Cancel this interview?')) return;
    setLoading(true);
    setError('');
    try {
      await interviewsService.cancel(id);
      await load();
    } catch (e) {
      setError('Failed to cancel interview');
    } finally {
      setLoading(false);
    }
  };

  const sorted = useMemo(() => (items || []).slice().sort((a,b) => new Date(a.scheduledAt) - new Date(b.scheduledAt)), [items]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Interviews</h2>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-[#1E3A8A] hover:bg-[#1a3578] text-white py-2 px-4 rounded-lg font-medium transition shadow-sm"
        >
          Schedule Interview
        </button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-3 text-sm">{error}</div>}

      <div className="overflow-x-auto border rounded-lg bg-white">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border border-gray-200">Title</th>
              <th className="p-3 border border-gray-200">Candidate</th>
              <th className="p-3 border border-gray-200">Interviewers</th>
              <th className="p-3 border border-gray-200">Scheduled</th>
              <th className="p-3 border border-gray-200">Duration</th>
              <th className="p-3 border border-gray-200">Status</th>
              <th className="p-3 border border-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((iv) => (
              <tr key={iv._id} className="border-t">
                <td className="p-3 border border-gray-200">{iv.title}</td>
                <td className="p-3 border border-gray-200">{iv.candidateId?.name || iv.candidateId}</td>
                <td className="p-3 border border-gray-200 text-sm">
                  {(iv.interviewerIds || []).map(p => p?.name || p).join(', ')}
                </td>
                <td className="p-3 border border-gray-200">{new Date(iv.scheduledAt).toLocaleString()}</td>
                <td className="p-3 border border-gray-200">{iv.duration}m</td>
                <td className="p-3 border border-gray-200"><StatusPill status={iv.status} /></td>
                <td className="p-3 border border-gray-200 space-x-3">
                  <button onClick={() => onEdit(iv)} className="text-indigo-600 hover:underline">Edit</button>
                  {iv.status !== 'cancelled' && (
                    <button onClick={() => onCancel(iv._id)} className="text-red-600 hover:underline">Cancel</button>
                  )}
                  {iv.roomId && (
                    <a
                      href={`/interview/room/${iv.roomId}`}
                      className="text-green-700 hover:underline"
                    >
                      Join Room
                    </a>
                  )}
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">No interviews yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white text-gray-800 p-6 rounded-lg w-full max-w-xl">
            <h3 className="text-lg font-bold mb-4">{editing ? 'Edit Interview' : 'Schedule Interview'}</h3>
            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="block mb-1 text-sm font-medium">Title</label>
                <input value={form.title} onChange={(e)=>setForm({...form, title:e.target.value})} className="w-full p-2 border rounded" required />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Candidate ID</label>
                <input value={form.candidateId} onChange={(e)=>setForm({...form, candidateId:e.target.value})} className="w-full p-2 border rounded" required />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Interviewer IDs (comma-separated)</label>
                <input value={form.interviewerIds} onChange={(e)=>setForm({...form, interviewerIds:e.target.value})} className="w-full p-2 border rounded" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-sm font-medium">Scheduled At</label>
                  <input type="datetime-local" value={form.scheduledAt} onChange={(e)=>setForm({...form, scheduledAt:e.target.value})} className="w-full p-2 border rounded" required />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">Duration (minutes)</label>
                  <input type="number" min={15} value={form.duration} onChange={(e)=>setForm({...form, duration:e.target.value})} className="w-full p-2 border rounded" required />
                </div>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Notes</label>
                <textarea value={form.notes} onChange={(e)=>setForm({...form, notes:e.target.value})} className="w-full p-2 border rounded" rows={3} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={()=>{setShowForm(false); resetForm();}} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg">Cancel</button>
                <button type="submit" disabled={loading} className={`px-4 py-2 rounded-lg text-white ${loading ? 'bg-gray-400' : 'bg-[#1E3A8A] hover:bg-[#1a3578]'}`}>{editing ? 'Save' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const HRInterviewsPage = () => (
  <DashboardLayout>
    <ErrorBoundary>
      <HRInterviewsPageInner />
    </ErrorBoundary>
  </DashboardLayout>
);

export default HRInterviewsPage;
