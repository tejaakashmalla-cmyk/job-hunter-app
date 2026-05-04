// src/pages/HunterDashboard.js
// Hunter dashboard — detect location and find nearby jobs within 5km

import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getNearbyJobs } from "../services/api";
import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";

const LIBRARIES = ["places"];

const MAP_CONTAINER_STYLE = { width: "100%", height: "420px" };
const DEFAULT_ZOOM = 13;

const HunterDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [showMap, setShowMap] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
    libraries: LIBRARIES,
  });

  // 📍 Detect location and fetch nearby jobs
  const findNearbyJobs = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        try {
          const res = await getNearbyJobs(latitude, longitude);
          setJobs(res.data.jobs);
          setSearched(true);

          if (res.data.jobs.length > 0) {
            setShowMap(true);
          }
        } catch (err) {
          setError(err.response?.data?.message || "Failed to fetch nearby jobs.");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError(
          err.code === 1
            ? "Location access denied. Please allow location in your browser."
            : "Could not detect your location: " + err.message
        );
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const onMapLoad = useCallback((map) => {
    // Map loaded callback — could add extra logic here
  }, []);

  return (
    <div className="dashboard">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="brand-icon" style={{ width: 32, height: 32, fontSize: 16 }}>🎯</div>
          Job Hunter
          <span className="role-badge hunter">Hunter</span>
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
        <h2 className="section-title">Find Jobs Near You</h2>
        <p className="section-subtitle">
          Discover job opportunities within 5km of your current location
        </p>

        {/* Location Search Card */}
        <div className="card" style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontFamily: "var(--font-display)", marginBottom: 4 }}>
                📡 Location Detection
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                {userLocation
                  ? `📌 ${userLocation.lat.toFixed(5)}, ${userLocation.lng.toFixed(5)}`
                  : "Click the button to detect your location"}
              </p>
            </div>
            <button
              className="btn btn-primary"
              style={{ width: "auto" }}
              onClick={findNearbyJobs}
              disabled={loading}
            >
              {loading ? (
                <><span className="spinner" /> Searching...</>
              ) : (
                "🔍 Find Jobs Nearby"
              )}
            </button>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginTop: 16, marginBottom: 0 }}>
              {error}
            </div>
          )}
        </div>

        {/* Results Header */}
        {searched && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16 }}>
              {jobs.length > 0
                ? `✅ Found ${jobs.length} job${jobs.length > 1 ? "s" : ""} within 5km`
                : "😔 No jobs found within 5km"}
            </h3>
            {jobs.length > 0 && isLoaded && (
              <button
                className="btn btn-outline"
                style={{ width: "auto", fontSize: 13, padding: "7px 14px" }}
                onClick={() => setShowMap(!showMap)}
              >
                {showMap ? "🗒 List View" : "🗺 Map View"}
              </button>
            )}
          </div>
        )}

        {/* Google Map */}
        {showMap && isLoaded && userLocation && (
          <div className="map-container" style={{ marginBottom: 24 }}>
            <GoogleMap
              mapContainerStyle={MAP_CONTAINER_STYLE}
              center={userLocation}
              zoom={DEFAULT_ZOOM}
              onLoad={onMapLoad}
              options={{
                styles: [
                  { elementType: "geometry", stylers: [{ color: "#1d2336" }] },
                  { elementType: "labels.text.stroke", stylers: [{ color: "#1d2336" }] },
                  { elementType: "labels.text.fill", stylers: [{ color: "#8a9bbd" }] },
                  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2d3748" }] },
                  { featureType: "water", elementType: "geometry", stylers: [{ color: "#172032" }] },
                ],
              }}
            >
              {/* User location marker */}
              <Marker
                position={userLocation}
                icon={{
                  url:
                    "data:image/svg+xml;charset=UTF-8," +
                    encodeURIComponent(
                      `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <circle cx="16" cy="16" r="12" fill="#38bdf8" opacity="0.3"/>
                        <circle cx="16" cy="16" r="7" fill="#38bdf8"/>
                        <circle cx="16" cy="16" r="3" fill="white"/>
                       </svg>`
                    ),
                  scaledSize: { width: 32, height: 32 },
                }}
                title="Your Location"
              />

              {/* Job markers */}
              {jobs.map((job) => (
                <Marker
                  key={job._id}
                  position={{
                    lat: job.location.coordinates[1], // GeoJSON: [lng, lat]
                    lng: job.location.coordinates[0],
                  }}
                  onClick={() => setSelectedJob(job)}
                  icon={{
                    url:
                      "data:image/svg+xml;charset=UTF-8," +
                      encodeURIComponent(
                        `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
                          <path d="M16 0 C7.16 0 0 7.16 0 16 C0 28 16 42 16 42 C16 42 32 28 32 16 C32 7.16 24.84 0 16 0Z" fill="#f97316"/>
                          <circle cx="16" cy="16" r="8" fill="white"/>
                          <text x="16" y="21" text-anchor="middle" font-size="12">💼</text>
                         </svg>`
                      ),
                    scaledSize: { width: 32, height: 42 },
                  }}
                  title={job.title}
                />
              ))}

              {/* InfoWindow for selected job */}
              {selectedJob && (
                <InfoWindow
                  position={{
                    lat: selectedJob.location.coordinates[1],
                    lng: selectedJob.location.coordinates[0],
                  }}
                  onCloseClick={() => setSelectedJob(null)}
                >
                  <div style={{ fontFamily: "sans-serif", minWidth: 180, padding: 4 }}>
                    <strong style={{ fontSize: 15 }}>{selectedJob.title}</strong>
                    <br />
                    <span style={{ color: "#16a34a", fontWeight: 600 }}>
                      ₹{selectedJob.salary.toLocaleString()}/mo
                    </span>
                    <br />
                    <span style={{ fontSize: 12, color: "#555" }}>
                      📍 {selectedJob.address}
                    </span>
                    <br />
                    {selectedJob.owner?.name && (
                      <span style={{ fontSize: 12, color: "#555" }}>
                        🏢 {selectedJob.owner.name}
                      </span>
                    )}
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </div>
        )}

        {/* Jobs List */}
        {searched && jobs.length === 0 && (
          <div className="empty-state">
            <div className="icon">🔍</div>
            <p>No jobs found within 5km of your location.</p>
            <p style={{ marginTop: 8, fontSize: 13, color: "var(--text-muted)" }}>
              Check back later or try from a different location.
            </p>
          </div>
        )}

        {jobs.length > 0 && (
          <div>
            {jobs.map((job) => (
              <div
                key={job._id}
                className="job-card"
                onClick={() => {
                  setSelectedJob(job);
                  setShowMap(true);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                style={{ cursor: "pointer" }}
              >
                <div className="job-title">{job.title}</div>
                <div className="job-meta">
                  <span>📍 {job.address}</span>
                  <span className="job-salary">
                    ₹{job.salary.toLocaleString()}/mo
                  </span>
                  {job.education && <span>🎓 {job.education}</span>}
                  {job.owner?.name && <span>🏢 {job.owner.name}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HunterDashboard;
