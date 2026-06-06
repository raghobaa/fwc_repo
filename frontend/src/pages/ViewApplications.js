import React, { useEffect, useState } from "react";
import { getAllJobs, getJobApplications } from "../api/api";

export default function ViewApplications() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState({});
  const [expandedJob, setExpandedJob] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      const { data } = await getAllJobs();
      setJobs(data);
    };
    fetchJobs();
  }, []);

  const handleViewApplications = async (jobId) => {
    if (expandedJob === jobId) {
      setExpandedJob(null);
      return;
    }
    const { data } = await getJobApplications(jobId);
    setApplications((prev) => ({ ...prev, [jobId]: data }));
    setExpandedJob(jobId);
  };

  return (
    <div className="bg-gray-100 min-h-screen p-8 pt-20 text-gray-800 font-inter">
      <h1 className="text-3xl font-bold mb-8 tracking-tight text-center">
        View Applications
      </h1>

      {jobs.length === 0 && (
        <p className="text-center text-gray-500">No jobs posted yet.</p>
      )}

      <div className="max-w-[1000px] mx-auto space-y-6">
        {jobs.map((job) => (
          <div
            key={job._id}
            className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 capitalize">
                  {job.title}
                </h2>
                <p className="text-sm text-gray-500 capitalize">
                  {job.location}
                </p>
              </div>
              <button
                onClick={() => handleViewApplications(job._id)}
                className="bg-[#1E3A8A] hover:bg-[#1a3578] text-white px-5 py-2 rounded-lg text-sm font-medium transition shadow-sm"
              >
                {expandedJob === job._id
                  ? "Hide Applications"
                  : "View Applications"}
              </button>
            </div>

            {expandedJob === job._id && (
              <div className="mt-5 bg-gray-50 border rounded-lg p-4">
                {applications[job._id]?.length > 0 ? (
                  <ul className="space-y-3">
                    {applications[job._id].map((app) => (
                      <li
                        key={app._id}
                        className="flex justify-between items-center bg-white border rounded-lg p-3 shadow-sm hover:shadow transition"
                      >
                        <div>
                          <p className="font-semibold text-gray-800">
                            {app.candidateName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {app.candidateEmail}
                          </p>
                        </div>
                        <a
                          href={`http://localhost:5000/${app.resumePath}`}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition shadow-sm"
                        >
                          Download
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-center">
                    No applications received for this job yet.
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
