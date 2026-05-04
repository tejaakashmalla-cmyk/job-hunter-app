// src/pages/RegisterPage.js
// Registration form — creates a new user account

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/api";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "hunter",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      const res = await registerUser(formData);
      const { user, token } = res.data;

      // Save to context + localStorage
      login(user, token);

      // Redirect based on role
      if (user.role === "owner") {
        navigate("/owner-dashboard");
      } else {
        navigate("/hunter-dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="auth-card">
        {/* Brand */}
        <div className="brand">
          <div className="brand-icon">🎯</div>
          <span className="brand-name">Job Hunter</span>
        </div>

        <h1>Create account</h1>
        <p className="subtitle">Join as an employer or job seeker</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Min. 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>I am a...</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="hunter">🔍 Job Seeker (Hunter)</option>
              <option value="owner">🏢 Employer (Owner)</option>
            </select>
          </div>

          {/* Role description */}
          <div
            className="alert"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
              fontSize: "13px",
              marginBottom: "18px",
            }}
          >
            {formData.role === "owner"
              ? "🏢 As an Owner, you can post job listings and manage your openings."
              : "🔍 As a Hunter, you can find jobs near your current location."}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <><span className="spinner" /> Creating account...</>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="divider">or</div>

        <p
          style={{
            textAlign: "center",
            fontSize: "14px",
            color: "var(--text-secondary)",
          }}
        >
          Already have an account?{" "}
          <Link to="/login" className="link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
