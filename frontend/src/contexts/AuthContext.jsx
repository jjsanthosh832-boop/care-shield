import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';

const AuthContext = createContext(null);

function getStoredUser() {
  try {
    const stored = localStorage.getItem('care_shield_user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    localStorage.removeItem('care_shield_user');
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [loading] = useState(false);

  const login = useCallback(async (credentials) => {
    const response = await api.post(ENDPOINTS.auth.login, credentials);
    const userData = response.data;
    localStorage.setItem('care_shield_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (data) => {
    const response = await api.post(ENDPOINTS.auth.register, data);
    return response.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('care_shield_user');
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (userId, data) => {
    const response = await api.put(ENDPOINTS.users.profile(userId), data);
    const updatedUser = response.data;
    localStorage.setItem('care_shield_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    return updatedUser;
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}