import axios from "axios";

const BASE = process.env.REACT_APP_API_URL || "http://localhost:5002";
const API = axios.create({
  baseURL: `${BASE}/api`,
  withCredentials: true,
});

// Jobs
export const createJob = (jobData) => {
  const token = localStorage.getItem("token");
  return API.post("/jobs", jobData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getJobApplications = (jobId) => {
  const token = localStorage.getItem("token");
  return API.get(`/jobs/${jobId}/applications`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getJobApplicationsList = () => {
  const token = localStorage.getItem("token");
  return API.get("/jobs/applications", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getInterviewers = () => {
  const token = localStorage.getItem("token");
  return API.get("/jobs/interviewers", {
    headers: { Authorization: `Bearer ${token}` },
  });
};
export const getAllJobs = () => API.get('/jobs');
export const getTalentHeatmap = () => {
  const token = localStorage.getItem("token");
  return API.get('/hr/talent-heatmap', { headers: { Authorization: `Bearer ${token}` } });
};


export default API;
