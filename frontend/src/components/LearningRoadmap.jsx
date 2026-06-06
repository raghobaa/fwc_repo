import React from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function LearningRoadmap({ roadmap }) {
  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed':
        return 'border-l-4 border-green-500 bg-green-50';
      case 'in-progress':
        return 'border-l-4 border-yellow-500 bg-yellow-50';
      default:
        return 'border-l-4 border-gray-300 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">LEARNING ROADMAP</h2>
      <div className="space-y-4">
        {roadmap.map((item, index) => (
          <div
            key={index}
            className={`${getStatusColor(item.status)} p-4 rounded-lg transition-all duration-200`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                {getStatusIcon(item.status)}
                <div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{item.topics}</p>
                </div>
              </div>
              {item.progress && (
                <div className="text-sm font-medium text-gray-600">
                  {item.progress}%
                </div>
              )}
            </div>
            {item.progress && (
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-yellow-500 rounded-full h-1.5 transition-all duration-500"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}