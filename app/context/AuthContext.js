'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext({});

export const AUTH_KEY = '__AUTH__';

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    loading: true,
    error: null,
    data: null,
  });
  const router = useRouter();

  // Load auth state from localStorage on mount
  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem(AUTH_KEY);
      if (storedAuth) {
        const parsedAuth = JSON.parse(storedAuth);
        setAuthState({
          loading: false,
          error: null,
          data: parsedAuth,
        });
      } else {
        setAuthState({
          loading: false,
          error: null,
          data: null,
        });
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
      setAuthState({
        loading: false,
        error: null,
        data: null,
      });
    }
  }, []);

  // Save auth state to localStorage whenever it changes
  const saveAuthState = (data) => {
    try {
      if (data) {
        localStorage.setItem(AUTH_KEY, JSON.stringify(data));
        setAuthState({
          loading: false,
          error: null,
          data: data,
        });
      } else {
        localStorage.removeItem(AUTH_KEY);
        setAuthState({
          loading: false,
          error: null,
          data: null,
        });
      }
    } catch (error) {
      console.error('Error saving auth state:', error);
    }
  };

  const login = (userData) => {
    const authData = {
      ...userData,
      isAuthenticated: true,
    };
    saveAuthState(authData);
  };

  const logout = () => {
    saveAuthState(null);
    router.push('/login');
  };

  const updateUserData = (userData) => {
    if (authState.data) {
      const updatedData = {
        ...authState.data,
        user: {
          ...authState.data.user,
          ...userData,
        },
      };
      saveAuthState(updatedData);
    }
  };

  const setLoading = (loading) => {
    setAuthState((prev) => ({
      ...prev,
      loading,
    }));
  };

  const setError = (error) => {
    setAuthState((prev) => ({
      ...prev,
      loading: false,
      error,
    }));
  };

  const value = {
    ...authState,
    user: authState.data?.user || null,
    token: authState.data?.token || null,
    isAuthenticated: authState.data?.isAuthenticated || false,
    login,
    logout,
    updateUserData,
    setLoading,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
