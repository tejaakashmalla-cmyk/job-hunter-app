// src/App.js
// Root component — sets up routing and auth context

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OwnerDashboard from "./pages/OwnerDashboard";
import HunterDashboard from "./pages/HunterDashboard";

// Root redirect: send logged-in users to their dashboard
const HomeRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return user.role === "owner"
    ? <Navigate to="/owner-dashboard" replace />
    : <Navigate to="/hunter-dashboard" replace />;
};

const AppRoutes = () => (
  <Routes>
    {/* Public routes */}
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />

    {/* Protected: Owner only */}
    <Route
      path="/owner-dashboard"
      element={
        <ProtectedRoute requiredRole="owner">
          <OwnerDashboard />
        </ProtectedRoute>
      }
    />

    {/* Protected: Hunter only */}
    <Route
      path="/hunter-dashboard"
      element={
        <ProtectedRoute requiredRole="hunter">
          <HunterDashboard />
        </ProtectedRoute>
      }
    />

    {/* Default: smart redirect */}
    <Route path="*" element={<HomeRedirect />} />
  </Routes>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
