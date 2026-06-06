import React, { useEffect, useState } from "react";

export default function HRProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    deadline: "",
  });

  const fetchProjects = async () => {
    const token = localStorage.getItem("token");
    const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
    const res = await fetch(`${BASE}/api/projects`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setProjects(data);
  };

  const addProject = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
    await fetch(`${BASE}/api/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newProject),
    });
    setNewProject({ title: "", description: "", deadline: "" });
    fetchProjects();
  };

  const updateStatus = async (id, status) => {
    const token = localStorage.getItem("token");
    const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
    await fetch(`${BASE}/api/projects/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    fetchProjects();
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen p-8 pt-20 text-gray-800 font-inter">
      <h1 className="text-3xl font-bold mb-8 tracking-tight text-center">
        Project Management
      </h1>

      {/* 📌 Add Project Form */}
      <form
        onSubmit={addProject}
        className="bg-white rounded-xl shadow p-6 mb-8 max-w-2xl mx-auto"
      >
        <input
          type="text"
          placeholder="Project Title"
          value={newProject.title}
          onChange={(e) =>
            setNewProject({ ...newProject, title: e.target.value })
          }
          className="w-full p-2 mb-3 border rounded"
          required
        />
        <textarea
          placeholder="Project Description"
          value={newProject.description}
          onChange={(e) =>
            setNewProject({ ...newProject, description: e.target.value })
          }
          className="w-full p-2 mb-3 border rounded h-24 resize-none"
          required
        />
        <input
          type="date"
          value={newProject.deadline}
          onChange={(e) =>
            setNewProject({ ...newProject, deadline: e.target.value })
          }
          className="w-full p-2 mb-3 border rounded"
          required
        />
        <button className="bg-[#1E3A8A] hover:bg-[#1E40AF] text-white px-6 py-2 rounded-full transition-all shadow-sm hover:shadow-md w-full">
          Add Project
        </button>
      </form>

      {/* 📊 Projects Table */}
      <div className="overflow-x-auto max-w-6xl mx-auto">
        <table className="w-full text-left border border-gray-300 rounded-xl bg-white shadow">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-3 w-48">Title</th>
              <th className="p-3 w-[500px]">Description</th> {/* Wider column */}
              <th className="p-3 w-40">Deadline</th>
              <th className="p-3 w-32">Status</th>
              <th className="p-3 w-48 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr
                key={p._id}
                className="border-t border-gray-200 hover:bg-gray-50 transition"
              >
                <td className="p-3 font-medium">{p.title}</td>
                <td className="p-3 text-gray-700">{p.description}</td>
                <td className="p-3">
                  {new Date(p.deadline).toLocaleDateString()}
                </td>
                <td className="p-3">{p.status}</td>
                <td className="p-3 text-center">
                  {p.status === "Active" ? (
                    <button
                      onClick={() => updateStatus(p._id, "Completed")}
                      className="bg-[#1E3A8A] hover:bg-[#1E40AF] text-white px-6 py-2 rounded-full transition-all shadow-sm hover:shadow-md"
                    >
                      Mark Completed
                    </button>
                  ) : (
                    <button
                      onClick={() => updateStatus(p._id, "Active")}
                      className="border border-[#1E3A8A] text-[#1E3A8A] hover:bg-[#E0E7FF] px-8 py-2 rounded-full transition-all shadow-sm hover:shadow-md"
                    >
                      Make Active
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
