import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatsCards from './StatsCards';
import SkillProficiency from './SkillProficiency';
import LearningRoadmap from './LearningRoadmap';
import AIMockInterview from './AIMockInterview';

export default function Dashboard() {
  const [userData, setUserData] = useState({
    name: "Aryan Reddy",
    title: "Software Engineer - Applied for Backend Developer",
    stats: {
      languagesAssessed: 5,
      mockInterviewsCompleted: 12,
      avgScore: 74,
      scoreChange: 8,
      badges: ["Python", "SQL", "Git"]
    },
    skills: [
      { name: "Python", percentage: 82 },
      { name: "JavaScript", percentage: 68 },
      { name: "SQL", percentage: 76 },
      { name: "Java", percentage: 51 },
      { name: "Go", percentage: 38 }
    ],
    roadmap: [
      { title: "Python fundamentals", status: "completed", topics: "12 topics", progress: null },
      { title: "SQL & databases", status: "completed", topics: "8 topics", progress: null },
      { title: "Python advanced — OOP & async", status: "in-progress", topics: "4 of 9 topics done", progress: 44 },
      { title: "JavaScript ES6+ & Node.js", status: "upcoming", topics: "11 topics", progress: null },
      { title: "System design fundamentals", status: "upcoming", topics: "6 topics", progress: null }
    ]
  });

  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Skill Tracker</h1>
          <p className="text-gray-600 mt-2">
            Track your skill development journey, set goals, and measure your progress over time.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">{userData.name}</h2>
          <p className="text-gray-600">{userData.title}</p>
        </div>

        {/* Stats Cards */}
        <StatsCards stats={userData.stats} />

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <SkillProficiency skills={userData.skills} />
          <LearningRoadmap roadmap={userData.roadmap} />
        </div>

        {/* AI Mock Interview Section */}
        <div className="mt-8">
          <AIMockInterview />
        </div>
      </div>
    </div>
  );
}