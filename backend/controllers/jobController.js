// controllers/jobController.js
// Handles all job-related business logic

const Job = require("../models/Job");

// ──────────────────────────────────────────────
// @route   POST /api/jobs
// @desc    Create a new job posting
// @access  Private (owner only)
// ──────────────────────────────────────────────
const createJob = async (req, res) => {
  try {
    const { title, education, salary, address, latitude, longitude } = req.body;

    // Validate required fields
    if (!title || !salary || !address || latitude == null || longitude == null) {
      return res.status(400).json({
        message: "Title, salary, address, latitude, and longitude are required",
      });
    }

    // Create job with GeoJSON location
    // MongoDB expects coordinates as [longitude, latitude]
    const job = await Job.create({
      title,
      education,
      salary,
      address,
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
      owner: req.user._id, // Attached by auth middleware
    });

    res.status(201).json({
      message: "Job posted successfully",
      job,
    });
  } catch (error) {
    console.error("Create job error:", error.message);
    res.status(500).json({ message: "Server error while creating job" });
  }
};

// ──────────────────────────────────────────────
// @route   GET /api/jobs/my
// @desc    Get all jobs posted by the logged-in owner
// @access  Private (owner only)
// ──────────────────────────────────────────────
const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ owner: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error("Get my jobs error:", error.message);
    res.status(500).json({ message: "Server error while fetching jobs" });
  }
};

// ──────────────────────────────────────────────
// @route   GET /api/jobs/nearby?lat=xx&lng=xx
// @desc    Get jobs within 5km of given coordinates
// @access  Private (hunter only)
// ──────────────────────────────────────────────
const getNearbyJobs = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    // Validate coordinates
    if (!lat || !lng) {
      return res
        .status(400)
        .json({ message: "Latitude (lat) and longitude (lng) are required" });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res
        .status(400)
        .json({ message: "Invalid coordinates provided" });
    }

    // 🌍 MongoDB $near query: find jobs within 5km (5000 meters)
    // Coordinates must be [longitude, latitude] for GeoJSON
    const jobs = await Job.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: 5000, // 5 kilometers in meters
        },
      },
    }).populate("owner", "name email"); // Include owner's name and email

    res.status(200).json({
      count: jobs.length,
      userLocation: { lat: latitude, lng: longitude },
      jobs,
    });
  } catch (error) {
    console.error("Get nearby jobs error:", error.message);
    res.status(500).json({ message: "Server error while fetching nearby jobs" });
  }
};

module.exports = { createJob, getMyJobs, getNearbyJobs };
