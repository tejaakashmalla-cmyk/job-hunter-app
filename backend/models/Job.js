// models/Job.js
// Defines the Job schema with GeoJSON location support

const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },

    education: {
      type: String,
      trim: true,
      default: "Not specified",
    },

    salary: {
      type: Number,
      required: [true, "Salary is required"],
      min: [0, "Salary cannot be negative"],
    },

    // GeoJSON format for MongoDB geospatial queries
    // coordinates stored as [longitude, latitude] — MongoDB convention
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, "Coordinates are required"],
      },
    },

    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },

    // Reference to the User (owner) who posted this job
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// 🌍 Create a 2dsphere index for geospatial queries ($near, $geoWithin, etc.)
jobSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Job", jobSchema);
