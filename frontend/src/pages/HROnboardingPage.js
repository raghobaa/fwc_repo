import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import ErrorBoundary from '../components/ErrorBoundary';
import onboardingService from '../api/onboardingService';

const StatusPill = ({ status }) => {
  const color = {
    'Pending': 'bg-gray-100 text-gray-800',
    'In Progress': 'bg-yellow-100 text-yellow-800',
    'Completed': 'bg-green-100 text-green-800',
  }[status] || 'bg-gray-100 text-gray-800';
  return <span className={`px-2 py-1 rounded text-xs font-medium ${color}`}>{status}</span>;
};

const HROnboardingPageInner = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await onboardingService.list();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const start = async (id) => {
    setError('');
    try {
      await onboardingService.trigger(id);
      await load();
    } catch (e) {
      setError('Failed to start onboarding');
    }
  };

  const withdraw = async (id) => {
    setError('');
    try {
      await onboardingService.withdraw(id);
      await load();
    } catch (e) {
      setError('Failed to withdraw onboarding');
    }
  };

  const sorted = useMemo(() => (items || []).slice().sort((a,b) => (a.onboardingStatus || '').localeCompare(b.onboardingStatus || '')), [items]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Onboarding</h2>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-3 text-sm">{error}</div>}

      <div className="overflow-x-auto border rounded-lg bg-white">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border border-gray-200">Name</th>
              <th className="p-3 border border-gray-200">Email</th>
              <th className="p-3 border border-gray-200">Status</th>
              <th className="p-3 border border-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c) => (
              <tr key={c._id} className="border-t">
                <td className="p-3 border border-gray-200">{c.name}</td>
                <td className="p-3 border border-gray-200">{c.email}</td>
                <td className="p-3 border border-gray-200"><StatusPill status={c.onboardingStatus || 'Pending'} /></td>
                <td className="p-3 border border-gray-200 space-x-3">
                  {(c.onboardingStatus === 'Pending' || !c.onboardingStatus) && (
                    <button onClick={() => start(c._id)} className="text-indigo-600 hover:underline">Start</button>
                  )}
                  {(c.onboardingStatus === 'In Progress') && (
                    <button onClick={() => withdraw(c._id)} className="text-red-600 hover:underline">Withdraw</button>
                  )}
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">No candidates found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const HROnboardingPage = () => (
  <DashboardLayout>
    <ErrorBoundary>
      <HROnboardingPageInner />
    </ErrorBoundary>
  </DashboardLayout>
);

export default HROnboardingPage;
