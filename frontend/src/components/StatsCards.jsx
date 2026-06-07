import React from 'react';
import { Code, Calendar, TrendingUp, Award } from 'lucide-react';

export default function StatsCards({ stats }) {
  const cards = [
    {
      title: "Languages",
      value: stats.languagesAssessed,
      subtitle: "Assessed",
      icon: Code,
      color: "bg-blue-500"
    },
    {
      title: "Mock Interviews",
      value: stats.mockInterviewsCompleted,
      subtitle: "Completed",
      icon: Calendar,
      color: "bg-green-500"
    },
    {
      title: "Avg Score",
      value: `${stats.avgScore}/100`,
      subtitle: `+${stats.scoreChange} this month`,
      icon: TrendingUp,
      color: "bg-purple-500"
    },
    {
      title: "Badges",
      value: stats.badges.length,
      subtitle: stats.badges.join(", "),
      icon: Award,
      color: "bg-yellow-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`${card.color} p-3 rounded-lg`}>
              <card.icon className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{card.value}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
          <p className="text-gray-600 text-sm mt-1">{card.subtitle}</p>
        </div>
      ))}
    </div>
  );
}