import { AUTH_KEY } from '@/app/utils/authConstants';
import { decryptData } from '@/app/utils/storageUtils';

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
      const parsed = decryptData(authData);
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
      const parsed = decryptData(authData);
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
      const parsed = decryptData(authData);
      return parsed?.isAuthenticated || false;
    }
    return false;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

/**
 * Check if a JWT token is expired by decoding its payload
 * @param {string} token - JWT token string
 * @returns {boolean} - True if expired or invalid
 */
export const isTokenExpired = (token) => {
  try {
    if (!token) return true;
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.exp) return false; // No exp claim — treat as valid
    return payload.exp * 1000 < Date.now();
  } catch {
    return true; // Malformed token → treat as expired
  }
};

/**
 * Clear all auth data from localStorage and cookies (used on logout / 401)
 */
export const clearAuthData = () => {
  try {
    localStorage.removeItem(AUTH_KEY);
    document.cookie = `${AUTH_KEY}=; path=/; max-age=0`;
  } catch (error) {
    console.error('Error clearing auth data:', error);
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
