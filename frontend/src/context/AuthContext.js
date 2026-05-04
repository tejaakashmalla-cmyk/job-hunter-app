// src/context/AuthContext.js
// Global authentication state using React Context API

import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load, restore user session from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("jobhunter_user");
    const savedToken = localStorage.getItem("jobhunter_token");

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }

    setLoading(false);
  }, []);

  // Save user and token to state and localStorage
  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem("jobhunter_user", JSON.stringify(userData));
    localStorage.setItem("jobhunter_token", jwtToken);
  };

  // Clear user session
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("jobhunter_user");
    localStorage.removeItem("jobhunter_token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy context access
export const useAuth = () => useContext(AuthContext);
