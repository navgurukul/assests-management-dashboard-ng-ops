/**
 * Environment Configuration
 * Centralized config for all environment variables
 */

const config = {
  // API Configuration
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  
  // Environment
  env: process.env.NEXT_PUBLIC_ENV || 'development',
  isDevelopment: process.env.NEXT_PUBLIC_ENV === 'development',
  isProduction: process.env.NEXT_PUBLIC_ENV === 'production',
  
  // API Endpoints
  endpoints: {
    // Components
    components: {
      list: '/components',
      create: '/components/create',
      update: (id) => `/components/${id}`,
      delete: (id) => `/components/${id}`,
      details: (id) => `/components/${id}`,
    },
    
    // Assets
    assets: {
      list: '/assets',
      create: '/assets/create',
      update: (id) => `/assets/${id}`,
      delete: (id) => `/assets/${id}`,
      details: (id) => `/assets/${id}`,
    },
    
    // Documents
    documents: {
      list: '/documents',
      upload: '/documents/upload',
      download: (id) => `/documents/${id}/download`,
      delete: (id) => `/documents/${id}`,
      details: (id) => `/documents/${id}`,
    },
    
    // Tickets
    tickets: {
      list: '/tickets',
      create: '/tickets/create',
      update: (id) => `/tickets/${id}`,
      delete: (id) => `/tickets/${id}`,
      details: (id) => `/tickets/${id}`,
    },
    
    // Dashboard
    dashboard: {
      stats: '/dashboard/stats',
      charts: '/dashboard/charts',
    },
  },
  
  // Helper function to get full API URL
  getApiUrl: (endpoint) => {
    return `${config.apiBaseUrl}${endpoint}`;
  },
  
  // Helper function to get full app URL
  getAppUrl: (path = '') => {
    return `${config.appUrl}${path}`;
  },
};

export default config;
