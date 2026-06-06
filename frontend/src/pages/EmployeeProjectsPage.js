import React, { useEffect, useState } from "react";
import { Calendar, X, Send, Download, Upload, MessageSquare, FileText, BarChart2 } from "lucide-react";

export default function EmployeeProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [newMessage, setNewMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [weekEnding, setWeekEnding] = useState("");
  const [selectedDocFile, setSelectedDocFile] = useState(null);
  const [selectedReportFile, setSelectedReportFile] = useState(null);

  const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/projects/employee`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      } else {
        console.error("Failed to fetch projects");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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
    if (!selectedDocFile) {
      alert("Please select a file first");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("projectId", selectedProject._id);
    formData.append("document", selectedDocFile);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/projects/employee/document`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedProject({ ...selectedProject, documents: data.documents });
        fetchProjects();
        setSelectedDocFile(null);
        alert("Document uploaded successfully");
      } else {
        alert("Upload failed");
      }
    } catch (err) { console.error(err); alert("Error uploading"); }
    setUploading(false);
  };

  const handleReportUpload = async () => {
    if (!selectedReportFile || !reportTitle) {
      alert("Please enter a report title and select a file");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("projectId", selectedProject._id);
    formData.append("workReport", selectedReportFile);
    formData.append("title", reportTitle);
    if (weekEnding) formData.append("weekEnding", weekEnding);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/projects/employee/work-report`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedProject({ ...selectedProject, workReports: data.workReports });
        fetchProjects();
        setReportTitle("");
        setWeekEnding("");
        setSelectedReportFile(null);
        alert("Work report uploaded successfully");
      } else {
        alert("Upload failed");
      }
    } catch (err) { console.error(err); alert("Error uploading"); }
    setUploading(false);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending_acceptance: { text: "Pending", color: "bg-yellow-100 text-yellow-700" },
      active: { text: "Active", color: "bg-green-100 text-green-700" },
      ongoing: { text: "Ongoing", color: "bg-blue-100 text-blue-700" },
      completed: { text: "Completed", color: "bg-gray-100 text-gray-700" },
      rejected: { text: "Rejected", color: "bg-red-100 text-red-700" }
    };
    const s = statusMap[status] || { text: status, color: "bg-gray-100" };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.color}`}>{s.text}</span>;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">My Projects</h1>

        {projects.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <p className="text-gray-500 text-lg">No projects assigned yet.</p>
            <p className="text-sm text-gray-400 mt-2">HR will assign projects to you soon.</p>
          </div>
        ) : (
          <>
            {/* Project Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project._id}
                  onClick={() => setSelectedProject(project)}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition cursor-pointer border border-gray-200 overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-gray-800 truncate">{project.title}</h3>
                      {getStatusBadge(project.status)}
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.description}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <Calendar className="h-4 w-4" />
                      <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{project.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${project.progress || 0}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Project Detail Modal */}
            {selectedProject && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold">{selectedProject.title}</h2>
                      <p className="text-sm text-gray-500">Deadline: {new Date(selectedProject.deadline).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => setSelectedProject(null)} className="p-1 hover:bg-gray-100 rounded">
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Tabs */}
                  <div className="border-b px-6">
                    <div className="flex gap-6">
                      {[
                        { id: "overview", label: "Overview", icon: <BarChart2 className="h-4 w-4" /> },
                        { id: "collaboration", label: "Collaboration", icon: <MessageSquare className="h-4 w-4" /> },
                        { id: "documents", label: "Documents", icon: <FileText className="h-4 w-4" /> },
                        { id: "reports", label: "Work Reports", icon: <Upload className="h-4 w-4" /> }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`py-3 text-sm font-medium border-b-2 transition flex items-center gap-1 ${
                            activeTab === tab.id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          {tab.icon}
                          <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Overview Tab */}
                    {activeTab === "overview" && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
                          <p className="text-gray-600">{selectedProject.description || "No description provided."}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 mb-2">Status</h3>
                          <div className="flex gap-3 flex-wrap">
                            {["active", "ongoing", "completed", "rejected"].map((status) => (
                              <button
                                key={status}
                                onClick={() => updateStatus(selectedProject._id, status)}
                                className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                                  selectedProject.status === status
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                              >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 mb-2">Progress</h3>
                          <div className="flex items-center gap-4">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={selectedProject.progress || 0}
                              onChange={(e) => updateProgress(selectedProject._id, parseInt(e.target.value))}
                              className="flex-1"
                            />
                            <span className="text-sm font-medium">{selectedProject.progress || 0}%</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Collaboration Tab */}
                    {activeTab === "collaboration" && (
                      <div>
                        <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                          {selectedProject.collaboration?.length > 0 ? (
                            selectedProject.collaboration.map((msg, idx) => (
                              <div key={idx} className="bg-gray-50 rounded-lg p-3">
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                  <span className="font-medium">{msg.sender}</span>
                                  <span>{new Date(msg.timestamp).toLocaleString()}</span>
                                </div>
                                <p className="text-gray-700 text-sm">{msg.message}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500 text-sm text-center py-8">No messages yet. Start the conversation.</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500"
                          />
                          <button onClick={sendMessage} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
                            <Send className="h-4 w-4" /> Send
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Documents Tab */}
                    {activeTab === "documents" && (
                      <div>
                        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <label className="block text-sm font-medium text-blue-800 mb-2">Upload Document (PDF/DOCX)</label>
                          <div className="flex gap-2">
                            <input
                              type="file"
                              accept=".pdf,.docx,.doc"
                              onChange={(e) => setSelectedDocFile(e.target.files[0])}
                              className="flex-1 text-sm text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-blue-100 file:text-blue-700"
                            />
                            <button
                              onClick={handleDocumentUpload}
                              disabled={uploading}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                            >
                              <Upload className="h-4 w-4" /> {uploading ? "Uploading..." : "Submit"}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gray-700 mb-2">Uploaded Documents</h4>
                          {selectedProject.documents?.length > 0 ? (
                            selectedProject.documents.map((doc, idx) => (
                              <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <div>
                                  <p className="font-medium text-sm">{doc.originalName}</p>
                                  <p className="text-xs text-gray-500">Uploaded by {doc.uploadedBy} on {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                                </div>
                                <a href={`${BASE_URL}${doc.filePath}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                  <Download className="h-4 w-4" />
                                </a>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500 text-sm text-center py-4">No documents uploaded.</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Work Reports Tab */}
                    {activeTab === "reports" && (
                      <div>
                        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <h4 className="font-semibold text-blue-800 mb-3">Submit Work Report</h4>
                          <div className="space-y-3">
                            <input
                              type="text"
                              placeholder="Report Title"
                              value={reportTitle}
                              onChange={(e) => setReportTitle(e.target.value)}
                              className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                            />
                            <input
                              type="date"
                              value={weekEnding}
                              onChange={(e) => setWeekEnding(e.target.value)}
                              className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                            />
                            <div className="flex gap-2">
                              <input
                                type="file"
                                accept=".pdf,.docx,.doc"
                                onChange={(e) => setSelectedReportFile(e.target.files[0])}
                                className="flex-1 text-sm text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-blue-100 file:text-blue-700"
                              />
                              <button
                                onClick={handleReportUpload}
                                disabled={uploading}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                              >
                                <Upload className="h-4 w-4" /> {uploading ? "Uploading..." : "Submit Report"}
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gray-700 mb-2">Submitted Reports</h4>
                          {selectedProject.workReports?.length > 0 ? (
                            selectedProject.workReports.map((report, idx) => (
                              <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <div>
                                  <p className="font-medium text-sm">{report.title}</p>
                                  <p className="text-xs text-gray-500">Week ending {new Date(report.weekEnding).toLocaleDateString()} • Uploaded by {report.uploadedBy}</p>
                                </div>
                                <a href={`${BASE_URL}${report.filePath}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                  <Download className="h-4 w-4" />
                                </a>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500 text-sm text-center py-4">No work reports submitted.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}