// server.js
// Main entry point for the Job Hunter backend API

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Connect to MongoDB
connectDB();

const app = express();

// ─── Middleware ───────────────────────────────────────────

// ✅ CORS setup (FIXED CLEAN VERSION)
const allowedOrigins = [
  "http://localhost:3000",
  "https://job-hunter-app-lime.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.options("*", cors());

// Parse JSON
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