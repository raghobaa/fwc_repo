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

const CandidateInterviewsPageInner = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await interviewsService.list();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError('Failed to load your interviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const upcoming = useMemo(() => (items || []).filter(iv => iv.status === 'scheduled' || iv.status === 'in_progress'), [items]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">My Interviews</h2>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-3 text-sm">{error}</div>}

      <div className="overflow-x-auto border rounded-lg bg-white">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border border-gray-200">Title</th>
              <th className="p-3 border border-gray-200">Interviewer(s)</th>
              <th className="p-3 border border-gray-200">Scheduled</th>
              <th className="p-3 border border-gray-200">Duration</th>
              <th className="p-3 border border-gray-200">Status</th>
              <th className="p-3 border border-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            {upcoming.map((iv) => (
              <tr key={iv._id} className="border-t">
                <td className="p-3 border border-gray-200">{iv.title}</td>
                <td className="p-3 border border-gray-200 text-sm">{(iv.interviewerIds || []).map(p => p?.name || p).join(', ')}</td>
                <td className="p-3 border border-gray-200">{new Date(iv.scheduledAt).toLocaleString()}</td>
                <td className="p-3 border border-gray-200">{iv.duration}m</td>
                <td className="p-3 border border-gray-200"><StatusPill status={iv.status} /></td>
                <td className="p-3 border border-gray-200">
                  {iv.roomId && (
                    <a href={`/interview/room/${iv.roomId}`} className="text-green-700 hover:underline">Join Room</a>
                  )}
                </td>
              </tr>
            ))}
            {upcoming.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">No upcoming interviews.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const CandidateInterviewsPage = () => (
  <DashboardLayout>
    <ErrorBoundary>
      <CandidateInterviewsPageInner />
    </ErrorBoundary>
  </DashboardLayout>
);

export default CandidateInterviewsPage;
