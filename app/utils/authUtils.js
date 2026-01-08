import { AUTH_KEY } from '@/app/context/AuthContext';

/**
 * Get authentication token from localStorage
 * @returns {string|null} - Authentication token or null
 */
export const getAuthToken = () => {
  try {
    if (typeof window === 'undefined') {
      return null;
    }
    
    const authData = localStorage.getItem(AUTH_KEY);
    if (authData) {
      const parsed = JSON.parse(authData);
      return parsed?.token || null;
    }
    return null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Get user data from localStorage
 * @returns {Object|null} - User data or null
 */
export const getUserData = () => {
  try {
    if (typeof window === 'undefined') {
      return null;
    }
    
    const authData = localStorage.getItem(AUTH_KEY);
    if (authData) {
      const parsed = JSON.parse(authData);
      return parsed?.user || null;
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} - True if authenticated
 */
export const isAuthenticated = () => {
  try {
    if (typeof window === 'undefined') {
      return false;
    }
    
    const authData = localStorage.getItem(AUTH_KEY);
    if (authData) {
      const parsed = JSON.parse(authData);
      return parsed?.isAuthenticated || false;
    }
    return false;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

/**
 * Create authorization headers
 * @returns {Object} - Headers with authorization token
 */
export const getAuthHeaders = () => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = token;
  }
  
  return headers;
};
