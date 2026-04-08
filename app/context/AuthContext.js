'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setUserRole } from '@/app/store/slices/appSlice';
import { jwtDecode } from 'jwt-decode';
import { isTokenExpired, clearAuthData } from '@/app/utils/authUtils';
import { AUTH_KEY as _AUTH_KEY } from '@/app/utils/authConstants';

const AuthContext = createContext({});

// Re-export for existing callers
export const AUTH_KEY = _AUTH_KEY;

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    loading: true,
    error: null,
    data: null,
  });
  const router = useRouter();
  const dispatch = useDispatch();

  // Load auth state from localStorage on mount
  useEffect(() => {
    const loadAuth = async () => {
      try {
        const storedAuth = localStorage.getItem(AUTH_KEY);
        if (storedAuth) {
          const parsedAuth = JSON.parse(storedAuth);
          
          // Decode Token
          if (parsedAuth?.token) {
            try {
              const decodedToken = jwtDecode(parsedAuth.token);
              // console.log("Decoded Token Data:===>>>", decodedToken);
              // Map/Extract role and dispatch to Redux (Assume 'Student' if not present for placeholder)
              const role = decodedToken?.role;
              dispatch(setUserRole(role));
            } catch (err) {
              console.error("Invalid token format:", err);
            }
          }

          // If the JWT is expired, clear stale data and treat as logged out
          if (isTokenExpired(parsedAuth?.token)) {
            clearAuthData();
            setAuthState({ loading: false, error: null, data: null });
          } else {
            setAuthState({ loading: false, error: null, data: parsedAuth });
          }
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
    };
    
    loadAuth();
  }, [dispatch]);

  // Save auth state to localStorage and cookies whenever it changes
  const saveAuthState = useCallback((data) => {
    try {
      if (data) {
        localStorage.setItem(AUTH_KEY, JSON.stringify(data));
        // Also save to cookie for middleware access
        document.cookie = `${AUTH_KEY}=${data.token || 'authenticated'}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
        
        if (data.token) {
          try {
            const decodedToken = jwtDecode(data.token);
            dispatch(setUserRole(decodedToken?.role));
          } catch (err) {
            console.error("Invalid token format:", err);
          }
        }
        
        setAuthState({
          loading: false,
          error: null,
          data: data,
        });
      } else {
        localStorage.removeItem(AUTH_KEY);
        // Remove cookie
        document.cookie = `${AUTH_KEY}=; path=/; max-age=0`;
        dispatch(setUserRole(''));
        setAuthState({
          loading: false,
          error: null,
          data: null,
        });
      }
    } catch (error) {
      console.error('Error saving auth state:', error);
    }
  }, [dispatch]);

  // Listen for 401 Unauthorized events from API calls
  useEffect(() => {
    const handleUnauthorized = () => {
      saveAuthState(null);
      router.push('/login');
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [router, saveAuthState]);

  const login = (userData) => {
    const authData = {
      ...userData,
      isAuthenticated: true,
    };
    saveAuthState(authData);
  };

  const logout = () => {
    saveAuthState(null);
    sessionStorage.removeItem('redirectAfterLogin');
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
