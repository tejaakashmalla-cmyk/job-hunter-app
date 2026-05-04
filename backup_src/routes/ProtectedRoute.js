// src/components/ProtectedRoute.js
// Redirects unauthenticated users or wrong-role users away from protected pages

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  // Show nothing while auth state is loading from localStorage
  if (loading) return null;

  // Not logged in → send to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Wrong role → send to their own dashboard
  if (requiredRole && user.role !== requiredRole) {
    const redirect =
      user.role === "owner" ? "/owner-dashboard" : "/hunter-dashboard";
    return <Navigate to={redirect} replace />;
  }

  return children;
};

export default ProtectedRoute;
