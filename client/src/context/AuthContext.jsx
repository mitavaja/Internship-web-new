import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, studentAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('maindot_student_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await studentAPI.getMyProfile();
      if (res.success) {
        setProfile(res.data);
      }
    } catch (err) {
      console.error('Failed to load student profile:', err.message);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('maindot_student_token');
    if (token) {
      authAPI
        .getMe()
        .then((res) => {
          if (res.success) {
            setUser(res.data.user);
            setProfile(res.data.user.profile);
            localStorage.setItem('maindot_student_user', JSON.stringify(res.data.user));
          }
        })
        .catch(() => {
          localStorage.removeItem('maindot_student_token');
          localStorage.removeItem('maindot_student_user');
          setUser(null);
          setProfile(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    if (res.success) {
      localStorage.setItem('maindot_student_token', res.data.token);
      localStorage.setItem('maindot_student_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      setProfile(res.data.user.profile);
      return res.data.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    if (res.success) {
      localStorage.setItem('maindot_student_token', res.data.token);
      localStorage.setItem('maindot_student_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      await fetchProfile();
      return res.data.user;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('maindot_student_token');
    localStorage.removeItem('maindot_student_user');
    setUser(null);
    setProfile(null);
    window.location.href = '/login';
  };

  const refreshUser = async () => {
    const res = await authAPI.getMe();
    if (res.success) {
      setUser(res.data.user);
      setProfile(res.data.user.profile);
      localStorage.setItem('maindot_student_user', JSON.stringify(res.data.user));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
