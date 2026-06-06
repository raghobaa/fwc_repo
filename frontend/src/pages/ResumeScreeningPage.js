import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ResumeScreening from '../components/ResumeScreening';
import ResumeUploader from '../components/ResumeUploader';
import HRChatbot from '../components/HRChatbot';
import ErrorBoundary from '../components/ErrorBoundary';
import DashboardLayout from '../components/DashboardLayout';

const ResumeScreeningPage = () => {
  const [searchParams] = useSearchParams();
  const initialTab = ['screen', 'upload', 'chat'].includes(searchParams.get('tab'))
    ? searchParams.get('tab')
    : 'screen';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [uploadCount, setUploadCount] = useState(0);

  const tabs = [
    { id: 'screen', label: 'Screen Resumes' },
    { id: 'upload', label: 'Upload Library' },
    { id: 'chat', label: 'Ask Assistant' },
  ];

  const handleUploadComplete = (data) => {
    const successCount = data?.summary?.success || 0;
    setUploadCount((prev) => prev + successCount);
    if (successCount > 0) {
      setActiveTab('chat');
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Resume Intelligence</h1>
            <p className="text-sm text-gray-500">
              Screen resumes against a JD, upload the searchable resume library, or ask the HR assistant.
            </p>
          </div>

          {uploadCount > 0 && (
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
              {uploadCount} resume{uploadCount === 1 ? '' : 's'} indexed
            </span>
          )}
        </div>

        <div className="mb-6 inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-md px-4 py-2 text-sm font-medium ${
                activeTab === tab.id
                  ? 'bg-[#1E3A8A] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <ErrorBoundary>
          {activeTab === 'screen' && <ResumeScreening />}
          {activeTab === 'upload' && (
            <div className="rounded-lg bg-white shadow">
              <ResumeUploader onUploadComplete={handleUploadComplete} />
            </div>
          )}
          {activeTab === 'chat' && (
            <div className="h-[680px] overflow-hidden rounded-lg bg-white shadow">
              <HRChatbot />
            </div>
          )}
        </ErrorBoundary>
      </div>
    </DashboardLayout>
  );
};

export default ResumeScreeningPage;
