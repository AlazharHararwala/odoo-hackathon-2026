import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, login as apiLogin, signup as apiSignup } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const loginUser = async (credentials) => {
    const data = await apiLogin(credentials);
    setUser(data.user);
    return data;
  };

  const signupUser = async (userData) => {
    const data = await apiSignup(userData);
    setUser(data.user);
    return data;
  };

  const logoutUser = () => {
    localStorage.removeItem('globetrotter_token');
    setUser(null);
  };

  const updateUserProfile = (newProfileData) => {
    setUser((prev) => ({ ...prev, ...newProfileData }));
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, loginUser, signupUser, logoutUser, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
