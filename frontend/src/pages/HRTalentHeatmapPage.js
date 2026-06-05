import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, BrainCircuit, GraduationCap, RefreshCw, Users } from "lucide-react";
import { getTalentHeatmap } from "../api/api";

const fallbackHeatmap = {
  departments: [
    {
      name: "Engineering",
      score: 85,
      employeeCount: 8,
      missingSkills: ["AWS", "React"],
      skills: [
        { name: "JavaScript", score: 90 },
        { name: "React", score: 58 },
        { name: "Node.js", score: 88 },
        { name: "AWS", score: 42 },
        { name: "MongoDB", score: 86 },
      ],
    },
    {
      name: "HR",
      score: 70,
      employeeCount: 5,
      missingSkills: ["Leadership"],
      skills: [
        { name: "Recruitment", score: 78 },
        { name: "Leadership", score: 54 },
        { name: "Payroll", score: 74 },
        { name: "Communication", score: 82 },
      ],
    },
    {
      name: "Marketing",
      score: 60,
      employeeCount: 4,
      missingSkills: ["Analytics", "Leadership"],
      skills: [
        { name: "SEO", score: 70 },
        { name: "Content Strategy", score: 68 },
        { name: "Analytics", score: 55 },
        { name: "Leadership", score: 47 },
      ],
    },
  ],
  criticalSkillGaps: ["AWS", "React", "Leadership"],
  trainingRecommendations: [
    {
      skill: "AWS",
      department: "Engineering",
      recommendation: "Run a 3-week AWS fundamentals sprint with cloud deployment labs.",
    },
    {
      skill: "React",
      department: "Engineering",
      recommendation: "Pair frontend engineers on reusable React patterns and state management.",
    },
    {
      skill: "Leadership",
      department: "HR",
      recommendation: "Nominate team leads for people management and conflict resolution coaching.",
    },
  ],
};

const scoreTone = (score) => {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 65) return "bg-blue-500";
  if (score >= 50) return "bg-amber-500";
  return "bg-rose-500";
};

export default function HRTalentHeatmapPage() {
  const [heatmap, setHeatmap] = useState(fallbackHeatmap);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHeatmap = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await getTalentHeatmap();
      setHeatmap(response.data || fallbackHeatmap);
    } catch (err) {
      console.error("Failed to load talent heatmap:", err);
      setHeatmap(fallbackHeatmap);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHeatmap();
  }, []);

  const averageScore = useMemo(() => {
    const departments = heatmap.departments || [];
    if (!departments.length) return 0;
    const total = departments.reduce((sum, department) => sum + department.score, 0);
    return Math.round(total / departments.length);
  }, [heatmap.departments]);

  const strongestDepartment = useMemo(() => {
    return [...(heatmap.departments || [])].sort((a, b) => b.score - a.score)[0];
  }, [heatmap.departments]);

  return (
    <div className="bg-gray-100 min-h-screen p-6 md:p-8 pt-20 text-gray-800 font-inter">
      <div className="max-w-[1300px] mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700 mb-2">
              <BrainCircuit size={18} />
              <span>AI Workforce Intelligence</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">AI Talent Heatmap</h1>
          </div>
          <button
            onClick={loadHeatmap}
            className="inline-flex items-center justify-center gap-2 bg-[#1E3A8A] hover:bg-[#1a3578] text-white px-4 py-2 rounded-lg font-medium transition shadow-sm"
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg p-5 shadow border border-gray-200">
            <p className="text-sm text-gray-500">Overall Skill Strength</p>
            <p className="text-4xl font-bold text-gray-900 mt-2">{averageScore}%</p>
          </div>
          <div className="bg-white rounded-lg p-5 shadow border border-gray-200">
            <p className="text-sm text-gray-500">Strongest Department</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {strongestDepartment?.name || "No data"}
            </p>
          </div>
          <div className="bg-white rounded-lg p-5 shadow border border-gray-200">
            <p className="text-sm text-gray-500">Critical Skill Gaps</p>
            <p className="text-4xl font-bold text-rose-600 mt-2">
              {(heatmap.criticalSkillGaps || []).length}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.75fr] gap-6">
          <section className="bg-white rounded-lg p-5 md:p-6 shadow border border-gray-200">
            <div className="flex items-center gap-2 mb-6">
              <Users size={20} className="text-indigo-700" />
              <h2 className="text-xl font-semibold">Department Skill Score</h2>
            </div>

            <div className="space-y-6">
              {(heatmap.departments || []).map((department) => (
                <div key={department.name} className="border-b border-gray-100 pb-5 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{department.name}</h3>
                      <p className="text-xs text-gray-500">{department.employeeCount} employees analyzed</p>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{department.score}%</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${scoreTone(department.score)}`}
                      style={{ width: `${department.score}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    {(department.skills || []).map((skill) => (
                      <div key={`${department.name}-${skill.name}`}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium text-gray-700">{skill.name}</span>
                          <span className="text-gray-500">{skill.score}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div className={`h-full ${scoreTone(skill.score)}`} style={{ width: `${skill.score}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="bg-white rounded-lg p-5 shadow border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={20} className="text-rose-600" />
                <h2 className="text-xl font-semibold">Critical Skill Gaps</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {(heatmap.criticalSkillGaps || []).map((skill) => (
                  <span
                    key={skill}
                    className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 border border-rose-100"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-lg p-5 shadow border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap size={20} className="text-indigo-700" />
                <h2 className="text-xl font-semibold">Training Recommendations</h2>
              </div>
              <div className="space-y-4">
                {(heatmap.trainingRecommendations || []).map((item) => (
                  <div key={`${item.department}-${item.skill}`} className="rounded-lg bg-gray-50 p-4 border border-gray-200">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <p className="font-semibold text-gray-900">{item.skill}</p>
                      <span className="text-xs font-medium text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
                        {item.department}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-gray-600">{item.recommendation}</p>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
