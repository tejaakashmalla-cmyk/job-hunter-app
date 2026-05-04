// routes/jobRoutes.js
// Job route definitions with protection and role-based access

const express = require("express");
const router = express.Router();
const {
  createJob,
  getMyJobs,
  getNearbyJobs,
} = require("../controllers/jobController");
const { protect, authorize } = require("../middleware/auth");

// ─── OWNER ROUTES ────────────────────────────────────────
// POST /api/jobs — Create a job (owner only)
router.post("/", protect, authorize("owner"), createJob);

// GET /api/jobs/my — Get owner's own job listings (owner only)
router.get("/my", protect, authorize("owner"), getMyJobs);

// ─── HUNTER ROUTES ───────────────────────────────────────
// GET /api/jobs/nearby?lat=xx&lng=xx — Get nearby jobs (hunter only)
router.get("/nearby", protect, authorize("hunter"), getNearbyJobs);

module.exports = router;
