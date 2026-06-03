import axios from "axios";

const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
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

export const getAllJobs = () => API.get("/jobs");

export default API;
