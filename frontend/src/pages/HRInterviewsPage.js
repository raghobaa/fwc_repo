import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import ErrorBoundary from '../components/ErrorBoundary';
import interviewsService from '../api/interviewsService';
import { getJobApplicationsList, getInterviewers } from '../api/api';
import Select from 'react-select';

const StatusPill = ({ status }) => {
  const color = {
    scheduled: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-200 text-gray-700',
  }[status] || 'bg-gray-100 text-gray-800';
  return <span className={`px-2 py-1 rounded text-xs font-medium ${color}`}>{status}</span>;
};

const canJoinInterview = (interview) => (
  interview.roomId
  && ['scheduled', 'in_progress'].includes(interview.status)
  && new Date(interview.scheduledAt) >= new Date()
);

const initialForm = {
  title: '',
  candidateId: '',
  jobApplicationId: '',
  candidateName: '',
  candidateEmail: '',
  jobId: '',
  interviewerIds: '',
  scheduledAt: '',
  duration: 60,
  notes: ''
};

const HRInterviewsPageInner = () => {
  const [items, setItems] = useState([]);
  const [jobApps, setJobApps] = useState([]);
  const [interviewers, setInterviewers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const minDateTime = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  // load dropdown options when modal opens
  useEffect(() => {
    if (showForm) {
      getJobApplicationsList()
        .then(res => setJobApps(res.data))
        .catch(err => console.error('Failed to load job applications', err));
      getInterviewers()
        .then(res => setInterviewers(res.data))
        .catch(err => console.error('Failed to load interviewers', err));
    }
  }, [showForm]);

  // Transform options for react-select
  const jobAppOptions = jobApps
    .map(app => ({
      value: app._id,                // application _id as the option value
      label: `${app.candidateName} - ${app.jobTitle || 'Untitled job'}`,
      candidateId: app.candidateId,
      jobApplicationId: app._id,
      jobId: app.jobId,
      candidateName: app.candidateName,
      candidateEmail: app.candidateEmail,
      jobTitle: app.jobTitle,
    }));

  const interviewerOptions = interviewers.map(u => ({
    value: u._id,
    label: `${u.name} (${u.email})`,
  }));

  // When HR picks a job application, auto-fill title, candidateId, and jobId
  const onSelectApplication = (opt) => {
    if (!opt) {
      setForm(prev => ({
        ...prev,
        title: '',
        candidateId: '',
        jobApplicationId: '',
        candidateName: '',
        candidateEmail: '',
        jobId: ''
      }));
      return;
    }
    setForm(prev => ({
      ...prev,
      title: `Interview: ${opt.candidateName} for ${opt.jobTitle}`,
      candidateId: opt.candidateId || '',
      jobApplicationId: opt.jobApplicationId,
      candidateName: opt.candidateName,
      candidateEmail: opt.candidateEmail,
      jobId: opt.jobId,
    }));
  };

  const onSelectInterviewers = (opts) => {
    const ids = opts ? opts.map(o => o.value).join(', ') : '';
    setForm(prev => ({ ...prev, interviewerIds: ids }));
  };

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
  const params = new URLSearchParams(window.location.search);
  const cid = params.get('candidateId');
  if (cid) {
    setForm(prev => ({ ...prev, candidateId: cid }));
    setShowForm(true);
  }
}, []);

  const resetForm = () => { setForm(initialForm); setEditing(null); };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (new Date(form.scheduledAt) <= new Date()) {
        setError('Please choose a future interview date and time');
        return;
      }
      const payload = {
        title: form.title.trim(),
        candidateId: form.candidateId?.trim() || '',
        jobApplicationId: form.jobApplicationId,
        candidateName: form.candidateName,
        candidateEmail: form.candidateEmail,
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
      else setError(e?.response?.data?.message || e?.response?.data?.error || 'Failed to save interview');
    } finally {
      setLoading(false);
    }
  };

  const onEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title,
      candidateId: item.candidateId?._id || item.candidateId,
      jobApplicationId: item.jobApplicationId?._id || item.jobApplicationId || '',
      candidateName: item.candidateName || item.candidateId?.name || item.jobApplicationId?.candidateName || '',
      candidateEmail: item.candidateEmail || item.candidateId?.email || item.jobApplicationId?.candidateEmail || '',
      jobId: item.jobApplicationId?.jobId || '',
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
            {sorted.map((iv) => {
              const joinable = canJoinInterview(iv);
              return (
                <tr key={iv._id} className="border-t">
                  <td className="p-3 border border-gray-200">{iv.title}</td>
                  <td className="p-3 border border-gray-200">{iv.candidateId?.name || iv.candidateName || iv.jobApplicationId?.candidateName || iv.candidateId}</td>
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
                    {joinable && (
                      <a
                        href={`/interview/room/${iv.roomId}`}
                        className="text-green-700 hover:underline"
                      >
                        Join Room
                      </a>
                    )}
                  </td>
                </tr>
              );
            })}
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
                <label className="block mb-1 text-sm font-medium">Job Application</label>
                <Select
                  options={jobAppOptions}
                  value={jobAppOptions.find(o => o.candidateId === form.candidateId && o.jobId === form.jobId) || null}
                  onChange={onSelectApplication}
                  placeholder="Select candidate & job…"
                  isClearable
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Title (auto-filled)</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full p-2 border rounded bg-gray-50"
                  placeholder="Auto-filled on selection"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Job ID</label>
                <input
                  value={form.jobId}
                  readOnly
                  className="w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                  placeholder="Auto-filled on selection"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Interviewers</label>
                <Select
                  isMulti
                  options={interviewerOptions}
                  value={interviewerOptions.filter(o => form.interviewerIds.split(',').includes(o.value))}
                  onChange={onSelectInterviewers}
                  placeholder="Select Interviewer(s)"
                  isClearable
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-sm font-medium">Scheduled At</label>
                  <input type="datetime-local" min={minDateTime} value={form.scheduledAt} onChange={(e)=>setForm({...form, scheduledAt:e.target.value})} className="w-full p-2 border rounded" required />
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
                <button type="submit" disabled={loading} className={loading ? 'px-4 py-2 rounded-lg text-white bg-gray-400' : 'px-4 py-2 rounded-lg text-white bg-[#1E3A8A] hover:bg-[#1a3578]'}>{editing ? 'Save' : 'Create'}</button>
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
