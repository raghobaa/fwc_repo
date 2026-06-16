import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, CheckCircle, XCircle, Award, BarChart3, Briefcase, Calendar, Fingerprint } from "lucide-react";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5002";

export default function PromotionTrackerPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEligibility = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/"); return; }

        const res = await fetch(`${BASE_URL}/api/employee/promotion-eligibility`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch");
        setData(await res.json());
      } catch {
        setError("Could not load promotion data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchEligibility();
  }, [navigate]);

  const criteriaIcons = {
    "Attendance Rate": <Fingerprint className="h-5 w-5" />,
    "Completed Projects": <Briefcase className="h-5 w-5" />,
    "Approved Leaves Within Limit": <Calendar className="h-5 w-5" />,
    "Active Projects": <BarChart3 className="h-5 w-5" />,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-8 pt-20 pb-10">

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-50 rounded-xl w-10 h-10 flex items-center justify-center">
            <Award className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Promotion Tracker</h1>
            <p className="text-gray-500 text-sm mt-0.5">Track your progress across all promotion criteria in real time</p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <BarChart3 className="h-5 w-5 text-blue-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{data.score}%</p>
            <p className="text-xs text-gray-500 mt-0.5">Overall Score</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <CheckCircle className="h-5 w-5 text-green-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{data.metCount}/{data.totalCriteria}</p>
            <p className="text-xs text-gray-500 mt-0.5">Criteria Met</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            {data.eligible
              ? <Award className="h-5 w-5 text-yellow-500 mb-2" />
              : <TrendingUp className="h-5 w-5 text-purple-500 mb-2" />}
            <p className="text-2xl font-bold text-gray-900">{data.eligible ? "Eligible!" : "In Progress"}</p>
            <p className="text-xs text-gray-500 mt-0.5">{data.eligible ? "You qualify for promotion" : "Keep improving"}</p>
          </div>
        </div>

        {/* Criteria Cards */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-1 w-12 bg-blue-600 rounded-full"></div>
          <h2 className="text-2xl font-bold text-gray-900">Promotion Criteria</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {data.criteria.map((criterion, i) => (
            <div
              key={i}
              className={`bg-white rounded-xl shadow-sm border p-6 flex items-start gap-4 transition-all ${criterion.met ? "border-green-200" : "border-gray-200"}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${criterion.met ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                {criteriaIcons[criterion.label] || <BarChart3 className="h-5 w-5" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-gray-900">{criterion.label}</p>
                  {criterion.met
                    ? <CheckCircle className="h-5 w-5 text-green-500" />
                    : <XCircle className="h-5 w-5 text-red-400" />}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>Current: <span className="font-medium text-gray-700">{criterion.current}</span></span>
                  <span>Target: <span className="font-medium text-gray-700">{criterion.target}</span></span>
                </div>
                {/* Progress bar */}
                <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${criterion.met ? "bg-green-500" : "bg-blue-400"}`}
                    style={{ width: criterion.met ? "100%" : "50%" }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tips */}
        {!data.eligible && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-bold text-blue-800 mb-3">Tips to Improve Your Score</h3>
            <ul className="space-y-2">
              {data.criteria.filter(c => !c.met).map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-blue-700">
                  <TrendingUp className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Improve <strong>{c.label}</strong> — currently {c.current}, target is {c.target}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.eligible && (
          <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <Award className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
            <h3 className="font-bold text-green-800 text-lg mb-1">Congratulations!</h3>
            <p className="text-green-700 text-sm">You meet all promotion criteria. Contact your HR to initiate the promotion process.</p>
          </div>
        )}
      </div>
    </div>
  );
}

