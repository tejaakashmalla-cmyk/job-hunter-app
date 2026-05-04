// server.js
// Main entry point for the Job Hunter backend API
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ─── Middleware ───────────────────────────────────────────
// Enable CORS so React frontend can communicate with this API
app.use(
  cors({
    origin: "http://localhost:3000", // React dev server
    credentials: true,
  })
);

// Parse incoming JSON request bodies
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/jobs", require("./routes/jobRoutes"));

// ─── Health Check ─────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Job Hunter API is running!",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth/register | /api/auth/login",
      jobs: "/api/jobs | /api/jobs/my | /api/jobs/nearby",
    },
  });
});

// ─── Global Error Handler ─────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).json({ message: "Internal server error" });
});

// ─── Start Server ─────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
