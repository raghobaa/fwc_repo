import React, { useEffect, useState } from "react";

export default function EmployeeProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const res = await fetch(`${BASE}/api/projects/employee`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      } else {
        console.error("Failed to fetch projects");
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const activeProject = projects.find((p) => p.status === "Active");
  const history = projects.filter((p) => p.status !== "Active");

  return (
    <div className="bg-gray-100 min-h-screen p-8 pt-20 text-gray-800 font-inter">
      <h1 className="text-3xl font-bold mb-8 tracking-tight text-center">
        My Projects
      </h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading projects...</p>
      ) : (
        <div className="max-w-4xl mx-auto space-y-8">
          {/*  Active Project */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
               Active Project
            </h2>
            {activeProject ? (
              <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
                <p className="text-lg font-semibold text-indigo-700 mb-2">
                  {activeProject.title}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  {activeProject.description}
                </p>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="font-semibold">Deadline:</span>{" "}
                    {new Date(activeProject.deadline).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-semibold">Status:</span>{" "}
                    <span className="text-green-600 font-medium">
                      {activeProject.status}
                    </span>
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">
                No active project assigned yet.
              </p>
            )}
          </div>

          {/*  Project History */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
               Project History
            </h2>
            {history.length === 0 ? (
              <p className="text-gray-500 italic">No past projects found.</p>
            ) : (
              <ul className="space-y-4">
                {history.map((p) => (
                  <li
                    key={p._id}
                    className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition border border-gray-200"
                  >
                    <p className="font-semibold text-gray-800 mb-1">{p.title}</p>
                    <p className="text-sm text-gray-600 mb-2">{p.description}</p>
                    <div className="text-sm space-y-1">
                      <p>
                        <span className="font-semibold">Deadline:</span>{" "}
                        <span className="text-yellow-600 font-medium">
                          {new Date(p.deadline).toLocaleDateString()}
                        </span>
                      </p>
                      <p>
                        <span className="font-semibold">Status:</span>{" "}
                        <span className="text-gray-700 font-medium">
                          {p.status}
                        </span>
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
