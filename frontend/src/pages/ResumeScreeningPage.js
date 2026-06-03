import React from 'react';
import ResumeScreening from '../components/ResumeScreening';
import ErrorBoundary from '../components/ErrorBoundary';
import DashboardLayout from '../components/DashboardLayout';

const ResumeScreeningPage = () => {
  return (
    <DashboardLayout>
      <div className="p-6">
        <ErrorBoundary>
          <ResumeScreening />
        </ErrorBoundary>
      </div>
    </DashboardLayout>
  );
};

export default ResumeScreeningPage;