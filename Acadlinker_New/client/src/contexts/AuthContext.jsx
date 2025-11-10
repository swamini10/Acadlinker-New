// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import AuthService from '../api/auth';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setAuth] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- Refresh auth status using backend API ---
  const refresh = async () => {
    setLoading(true);
    const { isAuthenticated, user } = await AuthService.checkStatus();
    setAuth(isAuthenticated);
    setCurrentUser(user);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  // --- Login ---
  const login = async (data) => {
    console.log("🔹 Login request data:", data);
    const result = await AuthService.login(data);
    console.log("🔹 Login response:", result);
    if (result.success) await refresh();
    return result;
  };

  // --- Register (fixed with arrow function to avoid 'this' binding issue) ---
  const register = async (data) => {
    console.log("🟢 Register request data:", data);
    const result = await AuthService.register(data);
    console.log("🟢 Register response:", result);
    if (result.success) await refresh();
    return result;
  };

  // --- Refresh only the user details (used after profile edit) ---
  const refreshUser = async () => {
    try {
      const res = await axios.get('/api/auth/status', { withCredentials: true });
      if (res.data.user) {
        setCurrentUser(res.data.user);
        setAuth(true);
      } else {
        setCurrentUser(null);
        setAuth(false);
      }
    } catch (err) {
      console.error('Error refreshing user:', err);
      setCurrentUser(null);
      setAuth(false);
    }
  };

  // --- Logout ---
  const logout = async () => {
    await AuthService.logout();
    setAuth(false);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        refreshUser,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
