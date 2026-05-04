import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Attach token
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

// AUTH
export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);

// JOBS
export const getNearbyJobs = (lat, lng) =>
  API.get(`/jobs/nearby?lat=${lat}&lng=${lng}`);

export const getMyJobs = () => API.get("/jobs/my");

export const createJob = (data) => API.post("/jobs", data);

export default API;