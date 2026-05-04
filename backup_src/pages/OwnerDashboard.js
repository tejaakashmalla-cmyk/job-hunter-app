// src/pages/OwnerDashboard.js
// Owner dashboard — post new jobs and view existing ones

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createJob, getMyJobs } from "../services/api";
import { useJsApiLoader, Autocomplete } from "@react-google-maps/api";

// Load Google Maps with Places library
const LIBRARIES = ["places"];

const OwnerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingJobs, setFetchingJobs] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    education: "",
    salary: "",
    address: "",
    latitude: "",
    longitude: "",
  });

  // Ref for Google Autocomplete instance
  const autocompleteRef = useRef(null);

  // Load Google Maps JS API
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
    libraries: LIBRARIES,
  });

  // Fetch owner's existing jobs on mount
  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      const res = await getMyJobs();
      setJobs(res.data.jobs);
    } catch (err) {
      console.error("Failed to fetch jobs:", err.message);
    } finally {
      setFetchingJobs(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  // Called when user selects a place from autocomplete dropdown
  const onPlaceChanged = useCallback(() => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();

      if (place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setFormData((prev) => ({
          ...prev,
          address: place.formatted_address || place.name,
          latitude: lat,
          longitude: lng,
        }));
      }
    }
  }, []);

  // Use browser geolocation to auto-fill coordinates
  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setFormData((prev) => ({ ...prev, latitude, longitude }));

        // Reverse geocode to get address
        if (isLoaded && window.google) {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode(
            { location: { lat: latitude, lng: longitude } },
            (results, status) => {
              if (status === "OK" && results[0]) {
                setFormData((prev) => ({
                  ...prev,
                  address: results[0].formatted_address,
                }));
              }
            }
          );
        }
      },
      (err) => {
        setError("Could not detect location: " + err.message);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!formData.latitude || !formData.longitude) {
      setError("Please select an address from the autocomplete or detect your location.");
      setLoading(false);
      return;
    }

    try {
      await createJob(formData);
      setSuccess("✅ Job posted successfully!");
      setFormData({ title: "", education: "", salary: "", address: "", latitude: "", longitude: "" });
      setShowForm(false);
      fetchMyJobs(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post job.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="dashboard">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="brand-icon" style={{ width: 32, height: 32, fontSize: 16 }}>🎯</div>
          Job Hunter
          <span className="role-badge owner">Owner</span>
        </div>
        <div className="navbar-right">
          <span className="user-name">👋 {user?.name}</span>
          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Header Row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <h2 className="section-title">My Job Listings</h2>
            <p className="section-subtitle">Post openings and manage your listings</p>
          </div>
          <button
            className="btn btn-primary"
            style={{ width: "auto" }}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "✕ Cancel" : "+ Post a Job"}
          </button>
        </div>

        {/* Alerts */}
        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        {/* Job Creation Form */}
        {showForm && (
          <div className="card">
            <h3 style={{ fontFamily: "var(--font-display)", marginBottom: 20 }}>
              📋 New Job Posting
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Job Title *</label>
                  <input
                    name="title"
                    placeholder="e.g. Frontend Developer"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Salary (₹/month) *</label>
                  <input
                    name="salary"
                    type="number"
                    placeholder="e.g. 50000"
                    value={formData.salary}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Education Required</label>
                <input
                  name="education"
                  placeholder="e.g. B.Tech, Any Graduate"
                  value={formData.education}
                  onChange={handleChange}
                />
              </div>

              {/* Address with Google Autocomplete */}
              <div className="form-group">
                <label>Job Location Address *</label>
                {isLoaded ? (
                  <Autocomplete
                    onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
                    onPlaceChanged={onPlaceChanged}
                  >
                    <input
                      name="address"
                      placeholder="Search address..."
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    />
                  </Autocomplete>
                ) : (
                  <input
                    name="address"
                    placeholder="Loading Maps..."
                    value={formData.address}
                    onChange={handleChange}
                    disabled
                  />
                )}
              </div>

              {/* Detect Location Button */}
              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: "auto", marginBottom: 16, fontSize: 13 }}
                onClick={detectLocation}
              >
                📍 Use My Current Location
              </button>

              {/* Show picked coords */}
              {formData.latitude && formData.longitude && (
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                    marginBottom: 16,
                    padding: "8px 12px",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: 6,
                  }}
                >
                  📌 Coordinates: {parseFloat(formData.latitude).toFixed(5)}, {parseFloat(formData.longitude).toFixed(5)}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? <><span className="spinner" /> Posting...</> : "Post Job"}
              </button>
            </form>
          </div>
        )}

        {/* Jobs List */}
        {fetchingJobs ? (
          <div className="empty-state">
            <div className="icon">⏳</div>
            <p>Loading your listings...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📭</div>
            <p>You haven't posted any jobs yet.</p>
            <p style={{ marginTop: 8, fontSize: 13 }}>
              Click "Post a Job" to get started.
            </p>
          </div>
        ) : (
          <div>
            {jobs.map((job) => (
              <div key={job._id} className="job-card">
                <div className="job-title">{job.title}</div>
                <div className="job-meta">
                  <span>📍 {job.address}</span>
                  <span className="job-salary">
                    ₹{job.salary.toLocaleString()}/mo
                  </span>
                  {job.education && <span>🎓 {job.education}</span>}
                  <span style={{ color: "var(--text-muted)" }}>
                    🗓 {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;
