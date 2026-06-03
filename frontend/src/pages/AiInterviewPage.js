import React from 'react';
import AiInterview from '../components/AiInterview';
import ErrorBoundary from '../components/ErrorBoundary';
import DashboardLayout from '../components/DashboardLayout';

const AiInterviewPage = () => {
  return (
    <DashboardLayout>
      <div className="p-6">
        <ErrorBoundary>
          <AiInterview />
        </ErrorBoundary>
      </div>
    </DashboardLayout>
  );
};

export default AiInterviewPage;
