import React from 'react';

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-inter">
      <div className="p-8 pt-16 min-h-screen">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
