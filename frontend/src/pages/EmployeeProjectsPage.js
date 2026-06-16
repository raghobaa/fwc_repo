import React, { useEffect, useState } from "react";
import {
  Calendar, X, Send, Download, Upload, MessageSquare, FileText,
  BarChart2, FolderGit2, CheckCircle, Clock, AlertCircle,
  TrendingUp, Zap, ChevronRight, Search, Filter
} from "lucide-react";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5002";

const STATUS_CONFIG = {
  pending_acceptance: { label: "Pending",   bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-400" },
  active:             { label: "Active",     bg: "bg-green-100",  text: "text-green-700",  dot: "bg-green-500" },
  ongoing:            { label: "Ongoing",    bg: "bg-blue-100",   text: "text-blue-700",   dot: "bg-blue-500"  },
  completed:          { label: "Completed",  bg: "bg-gray-100",   text: "text-gray-600",   dot: "bg-gray-400"  },
  rejected:           { label: "Rejected",   bg: "bg-red-100",    text: "text-red-600",    dot: "bg-red-400"   },
};

const PRIORITY_CONFIG = {
  high:   { label: "High",   color: "text-red-600 bg-red-50 border-red-200"     },
  medium: { label: "Medium", color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
  low:    { label: "Low",    color: "text-green-600 bg-green-50 border-green-200" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function ProgressBar({ value, size = "md" }) {
  const pct = value || 0;
  const color = pct >= 80 ? "bg-green-500" : pct >= 40 ? "bg-blue-500" : "bg-yellow-400";
  const h = size === "sm" ? "h-1.5" : "h-2";
  return (
    <div className={`w-full bg-gray-100 rounded-full ${h} overflow-hidden`}>
      <div className={`${h} rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function EmployeeProjectsPage() {
  const [projects, setProjects]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeTab, setActiveTab]           = useState("overview");
  const [newMessage, setNewMessage]         = useState("");
  const [uploading, setUploading]           = useState(false);
  const [reportTitle, setReportTitle]       = useState("");
  const [weekEnding, setWeekEnding]         = useState("");
  const [selectedDocFile, setSelectedDocFile]     = useState(null);
  const [selectedReportFile, setSelectedReportFile] = useState(null);
  const [filter, setFilter]                 = useState("all");
  const [search, setSearch]                 = useState("");

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/projects/employee`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setProjects(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const updateStatus = async (projectId, status) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/projects/employee/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ projectId, status }),
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedProject(data.project);
        fetchProjects();
      }
    } catch (err) { console.error(err); }
  };

  const updateProgress = async (projectId, progress) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/projects/employee/progress`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ projectId, progress }),
      });
      if (res.ok) fetchProjects();
    } catch (err) { console.error(err); }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/projects/employee/collaboration`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ projectId: selectedProject._id, message: newMessage }),
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedProject({ ...selectedProject, collaboration: data.collaboration });
        setNewMessage("");
      }
    } catch (err) { console.error(err); }
  };

  const handleDocumentUpload = async () => {
    if (!selectedDocFile) { alert("Please select a file first"); return; }
    setUploading(true);
    const formData = new FormData();
    formData.append("projectId", selectedProject._id);
    formData.append("document", selectedDocFile);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/projects/employee/document`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedProject({ ...selectedProject, documents: data.documents });
        fetchProjects(); setSelectedDocFile(null);
        alert("Document uploaded successfully");
      } else { alert("Upload failed"); }
    } catch { alert("Error uploading"); }
    setUploading(false);
  };

  const handleReportUpload = async () => {
    if (!selectedReportFile || !reportTitle) { alert("Please enter a report title and select a file"); return; }
    setUploading(true);
    const formData = new FormData();
    formData.append("projectId", selectedProject._id);
    formData.append("workReport", selectedReportFile);
    formData.append("title", reportTitle);
    if (weekEnding) formData.append("weekEnding", weekEnding);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/projects/employee/work-report`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedProject({ ...selectedProject, workReports: data.workReports });
        fetchProjects(); setReportTitle(""); setWeekEnding(""); setSelectedReportFile(null);
        alert("Work report uploaded successfully");
      } else { alert("Upload failed"); }
    } catch { alert("Error uploading"); }
    setUploading(false);
  };

  // Computed
  const counts = {
    all:       projects.length,
    active:    projects.filter(p => p.status === "active" || p.status === "ongoing").length,
    completed: projects.filter(p => p.status === "completed").length,
    pending:   projects.filter(p => p.status === "pending_acceptance").length,
  };

  const filtered = projects.filter(p => {
    const matchFilter =
      filter === "all" ? true :
      filter === "active" ? (p.status === "active" || p.status === "ongoing") :
      p.status === filter;
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const overallProgress = projects.length
    ? Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / projects.length)
    : 0;

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-8 pt-20 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Project Workspace</h1>
        <p className="text-gray-500 text-sm mt-1">Track, manage, and collaborate on your assigned projects</p>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 mb-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <FolderGit2 className="h-5 w-5 text-blue-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{counts.all}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total Projects</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <Zap className="h-5 w-5 text-green-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{counts.active}</p>
            <p className="text-xs text-gray-500 mt-0.5">Active / Ongoing</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <CheckCircle className="h-5 w-5 text-yellow-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{counts.completed}</p>
            <p className="text-xs text-gray-500 mt-0.5">Completed</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <TrendingUp className="h-5 w-5 text-purple-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{overallProgress}%</p>
            <p className="text-xs text-gray-500 mt-0.5">Avg Progress</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-6">

        {/* Search + Filter bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              { key: "all",       label: `All (${counts.all})`             },
              { key: "active",    label: `Active (${counts.active})`        },
              { key: "completed", label: `Completed (${counts.completed})`  },
              { key: "pending_acceptance", label: `Pending (${counts.pending})` },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition border ${
                  filter === f.key
                    ? "bg-blue-600 text-white border-blue-600 shadow"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
            <FolderGit2 className="h-14 w-14 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">
              {projects.length === 0 ? "No projects assigned yet" : "No projects match your filter"}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {projects.length === 0 ? "HR will assign projects to you soon." : "Try a different filter or search term."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((project) => {
              const isOverdue = project.deadline && new Date(project.deadline) < new Date() && project.status !== "completed";
              const pct = project.progress || 0;
              return (
                <div
                  key={project._id}
                  onClick={() => { setSelectedProject(project); setActiveTab("overview"); }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer group overflow-hidden"
                >
                  {/* Color accent top bar */}
                  <div className={`h-1 w-full ${
                    project.status === "active" || project.status === "ongoing" ? "bg-gradient-to-r from-blue-500 to-blue-600" :
                    project.status === "completed" ? "bg-gradient-to-r from-green-400 to-green-500" :
                    project.status === "rejected" ? "bg-gradient-to-r from-red-400 to-red-500" :
                    "bg-gradient-to-r from-yellow-400 to-yellow-500"
                  }`} />

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0 pr-2">
                        <h3 className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition text-base">{project.title}</h3>
                        {project.priority && (
                          <span className={`text-xs font-medium px-2 py-0.5 rounded border mt-1 inline-block ${PRIORITY_CONFIG[project.priority]?.color || ""}`}>
                            {PRIORITY_CONFIG[project.priority]?.label || project.priority}
                          </span>
                        )}
                      </div>
                      <StatusBadge status={project.status} />
                    </div>

                    <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {project.description || "No description provided."}
                    </p>

                    <div className={`flex items-center gap-2 text-xs mb-4 ${isOverdue ? "text-red-500" : "text-gray-400"}`}>
                      {isOverdue ? <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" /> : <Calendar className="h-3.5 w-3.5 flex-shrink-0" />}
                      <span>{isOverdue ? "Overdue · " : "Due · "}{new Date(project.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                        <span className="font-medium">Progress</span>
                        <span className={`font-bold ${pct >= 80 ? "text-green-600" : pct >= 40 ? "text-blue-600" : "text-yellow-600"}`}>{pct}%</span>
                      </div>
                      <ProgressBar value={pct} />
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                      <div className="flex gap-3 text-xs text-gray-400">
                        {project.documents?.length > 0 && (
                          <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{project.documents.length}</span>
                        )}
                        {project.collaboration?.length > 0 && (
                          <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{project.collaboration.length}</span>
                        )}
                      </div>
                      <span className="text-xs text-blue-500 font-medium group-hover:underline flex items-center gap-1">
                        View details <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-start rounded-t-2xl">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-bold text-gray-900">{selectedProject.title}</h2>
                  <StatusBadge status={selectedProject.status} />
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />Due {new Date(selectedProject.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  <span className="flex items-center gap-1"><TrendingUp className="h-4 w-4" />{selectedProject.progress || 0}% complete</span>
                </div>
              </div>
              <button onClick={() => setSelectedProject(null)} className="p-2 hover:bg-gray-100 rounded-xl transition">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-100 px-6">
              <div className="flex gap-1">
                {[
                  { id: "overview",       label: "Overview",      icon: <BarChart2 className="h-4 w-4" /> },
                  { id: "collaboration",  label: "Collaboration", icon: <MessageSquare className="h-4 w-4" /> },
                  { id: "documents",      label: "Documents",     icon: <FileText className="h-4 w-4" /> },
                  { id: "reports",        label: "Work Reports",  icon: <Upload className="h-4 w-4" /> },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition ${
                      activeTab === tab.id
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              {/* Overview */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{selectedProject.description || "No description provided."}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Update Status</h3>
                    <div className="flex gap-2 flex-wrap">
                      {["active", "ongoing", "completed", "rejected"].map((status) => (
                        <button
                          key={status}
                          onClick={() => updateStatus(selectedProject._id, status)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition border ${
                            selectedProject.status === status
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                          }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Update Progress</h3>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-4 mb-3">
                        <input
                          type="range"
                          min="0" max="100"
                          value={selectedProject.progress || 0}
                          onChange={(e) => updateProgress(selectedProject._id, parseInt(e.target.value))}
                          className="flex-1 accent-blue-600"
                        />
                        <span className={`text-lg font-bold min-w-[3rem] text-right ${
                          (selectedProject.progress || 0) >= 80 ? "text-green-600" :
                          (selectedProject.progress || 0) >= 40 ? "text-blue-600" : "text-yellow-600"
                        }`}>{selectedProject.progress || 0}%</span>
                      </div>
                      <ProgressBar value={selectedProject.progress} />
                    </div>
                  </div>
                </div>
              )}

              {/* Collaboration */}
              {activeTab === "collaboration" && (
                <div>
                  <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
                    {selectedProject.collaboration?.length > 0 ? (
                      selectedProject.collaboration.map((msg, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-xl p-3">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span className="font-semibold text-gray-700">{msg.sender}</span>
                            <span>{new Date(msg.timestamp).toLocaleString()}</span>
                          </div>
                          <p className="text-gray-700 text-sm">{msg.message}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10">
                        <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">No messages yet. Start the conversation.</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={sendMessage} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition text-sm font-medium">
                      <Send className="h-4 w-4" />Send
                    </button>
                  </div>
                </div>
              )}

              {/* Documents */}
              {activeTab === "documents" && (
                <div>
                  <div className="mb-5 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-sm font-semibold text-blue-800 mb-2">Upload Document (PDF / DOCX)</p>
                    <div className="flex gap-2">
                      <input
                        type="file" accept=".pdf,.docx,.doc"
                        onChange={(e) => setSelectedDocFile(e.target.files[0])}
                        className="flex-1 text-sm text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-blue-100 file:text-blue-700"
                      />
                      <button onClick={handleDocumentUpload} disabled={uploading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700 disabled:opacity-60 text-sm font-medium">
                        <Upload className="h-4 w-4" />{uploading ? "Uploading..." : "Upload"}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Uploaded Documents</p>
                    {selectedProject.documents?.length > 0 ? (
                      selectedProject.documents.map((doc, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                          <div>
                            <p className="font-medium text-sm text-gray-800">{doc.originalName}</p>
                            <p className="text-xs text-gray-400">By {doc.uploadedBy} · {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                          </div>
                          <a href={`${BASE_URL}${doc.filePath}`} target="_blank" rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-white border border-gray-200 hover:border-blue-400 text-blue-600 transition">
                            <Download className="h-4 w-4" />
                          </a>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">No documents uploaded yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Work Reports */}
              {activeTab === "reports" && (
                <div>
                  <div className="mb-5 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-sm font-semibold text-blue-800 mb-3">Submit Work Report</p>
                    <div className="space-y-3">
                      <input type="text" placeholder="Report Title *" value={reportTitle}
                        onChange={(e) => setReportTitle(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <input type="date" value={weekEnding} onChange={(e) => setWeekEnding(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <div className="flex gap-2">
                        <input type="file" accept=".pdf,.docx,.doc"
                          onChange={(e) => setSelectedReportFile(e.target.files[0])}
                          className="flex-1 text-sm text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-blue-100 file:text-blue-700" />
                        <button onClick={handleReportUpload} disabled={uploading}
                          className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700 disabled:opacity-60 text-sm font-medium">
                          <Upload className="h-4 w-4" />{uploading ? "Uploading..." : "Submit"}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Submitted Reports</p>
                    {selectedProject.workReports?.length > 0 ? (
                      selectedProject.workReports.map((report, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                          <div>
                            <p className="font-medium text-sm text-gray-800">{report.title}</p>
                            <p className="text-xs text-gray-400">Week ending {new Date(report.weekEnding).toLocaleDateString()} · {report.uploadedBy}</p>
                          </div>
                          <a href={`${BASE_URL}${report.filePath}`} target="_blank" rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-white border border-gray-200 hover:border-blue-400 text-blue-600 transition">
                            <Download className="h-4 w-4" />
                          </a>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Upload className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">No reports submitted yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
