// src/pages/HunterDashboard.js

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
import { motion } from "framer-motion";

const LIBRARIES = ["places"];
const MAP_CONTAINER_STYLE = { width: "100%", height: "420px" };
const DEFAULT_ZOOM = 13;

const HunterDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [showMap, setShowMap] = useState(false);

  // ✅ NEW STATE (for UX like Swiggy/Zomato)
  const [searched, setSearched] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
    libraries: LIBRARIES,
  });

  // 🔥 MAIN FUNCTION
  const findNearbyJobs = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    setError("");
    setSearched(false); // reset before search

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          setUserLocation({ lat: latitude, lng: longitude });

          const res = await getNearbyJobs(latitude, longitude);

          const jobsData = res.data.jobs || res.data || [];

          setJobs(jobsData);
          setShowMap(true);
          setSearched(true); // ✅ VERY IMPORTANT
        } catch (err) {
          setError(
            err.response?.data?.message || "Failed to fetch nearby jobs."
          );
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError(
          err.code === 1
            ? "Location access denied. Please allow location."
            : "Could not detect your location"
        );
        setLoading(false);
      }
    );
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const onMapLoad = useCallback(() => {}, []);

  return (
    <motion.div
      className="dashboard"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="brand-icon">🎯</div>
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

      <div className="dashboard-content">
        <h2 className="section-title">Find Jobs Near You</h2>

        {/* SEARCH CARD */}
        <motion.div
          className="card"
          style={{ marginBottom: 28 }}
          whileHover={{ scale: 1.02 }}
        >
          <button
            className="btn btn-primary"
            onClick={findNearbyJobs}
            disabled={loading}
          >
            {loading ? "Searching..." : "🔍 Find Jobs Nearby"}
          </button>

          {error && <div className="alert alert-error">{error}</div>}
        </motion.div>

        {/* ❌ NO JOBS MESSAGE (NEW UX FIX) */}
        {searched && jobs.length === 0 && !loading && (
          <motion.div
            className="card"
            style={{
              textAlign: "center",
              padding: "20px",
              color: "#ff6b6b",
              fontWeight: "500",
              marginBottom: "20px",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            ❌ No jobs found near your location <br />
            <span style={{ fontSize: "13px", color: "#aaa" }}>
              Try moving to a different location 📍
            </span>
          </motion.div>
        )}

        {/* MAP */}
        {showMap && isLoaded && userLocation && (
          <div className="map-container" style={{ marginBottom: 24 }}>
            <GoogleMap
              mapContainerStyle={MAP_CONTAINER_STYLE}
              center={userLocation}
              zoom={DEFAULT_ZOOM}
              onLoad={onMapLoad}
            >
              <Marker position={userLocation} />

              {jobs.map((job) => (
                <Marker
                  key={job._id}
                  position={{
                    lat: job.location.coordinates[1],
                    lng: job.location.coordinates[0],
                  }}
                  onClick={() => setSelectedJob(job)}
                />
              ))}

              {selectedJob && (
                <InfoWindow
                  position={{
                    lat: selectedJob.location.coordinates[1],
                    lng: selectedJob.location.coordinates[0],
                  }}
                  onCloseClick={() => setSelectedJob(null)}
                >
                  <div>
                    <strong>{selectedJob.title}</strong>
                    <p>₹{selectedJob.salary}</p>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </div>
        )}

        {/* JOB LIST */}
        {jobs.length > 0 && (
          <div>
            {jobs.map((job, index) => (
              <motion.div
                key={job._id}
                className="job-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{
                  scale: 1.05,
                  y: -5,
                  boxShadow: "0px 10px 25px rgba(0,255,200,0.2)",
                }}
                whileTap={{ scale: 0.98 }}
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
                  <span>₹{job.salary}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default HunterDashboard;