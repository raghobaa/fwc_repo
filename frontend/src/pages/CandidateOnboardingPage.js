import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import ErrorBoundary from '../components/ErrorBoundary';

const Step = ({ title, active, done }) => {
  const base = 'flex items-center gap-3 p-3 rounded border';
  const cls = done
    ? `${base} bg-green-50 border-green-200 text-green-800`
    : active
    ? `${base} bg-yellow-50 border-yellow-200 text-yellow-800`
    : `${base} bg-gray-50 border-gray-200 text-gray-700`;
  return (
    <div className={cls}>
      <span className={`w-2.5 h-2.5 rounded-full ${done ? 'bg-green-500' : active ? 'bg-yellow-500' : 'bg-gray-400'}`} />
      <span className="text-sm font-medium">{title}</span>
    </div>
  );
};

const CandidateOnboardingPageInner = () => {
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        const BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const res = await fetch(`${BASE}/api/auth/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Unauthorized');
        const me = await res.json();
        setStatus(me?.onboardingStatus || 'Pending');
      } catch (e) {
        setError('Unable to fetch your onboarding status');
      }
    };
    load();
  }, []);

  const steps = [
    { title: 'Offer Accepted' },
    { title: 'Document Collection' },
    { title: 'Background Verification' },
    { title: 'Account Setup' },
    { title: 'Orientation' },
  ];

  const idx = status === 'Completed' ? steps.length - 1 : status === 'In Progress' ? 2 : 0;

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800">My Onboarding</h2>
        <p className="text-sm text-gray-600 mt-1">Current status: <strong>{status || 'Pending'}</strong></p>
      </div>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-3 text-sm">{error}</div>}

      <div className="space-y-3">
        {steps.map((s, i) => (
          <Step key={s.title} title={s.title} active={i === idx} done={i < idx} />
        ))}
      </div>
    </div>
  );
};

const CandidateOnboardingPage = () => (
  <DashboardLayout>
    <ErrorBoundary>
      <CandidateOnboardingPageInner />
    </ErrorBoundary>
  </DashboardLayout>
);

export default CandidateOnboardingPage;
