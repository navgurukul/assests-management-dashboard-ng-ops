const config = {
  // API Configuration
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://asset-dashboard.navgurukul.org/api',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://asset-dashboard.navgurukul.org',
  
  // API Endpoints
  endpoints: {
    // Components
    components: {
      list: '/components',
      create: '/components',
      update: (id) => `/components/${id}`,
      delete: (id) => `/components/${id}`,
      details: (id) => `/components/${id}`,
      addDocuments: (id) => `/components/${id}/documents`,
      install: (id) => `/components/${id}/install`,
    },
    
    // Assets
    assets: {
      list: '/assets',
      create: '/assets',
      update: (id) => `/assets/${id}`,
      delete: (id) => `/assets/${id}`,
      details: (id) => `/assets/${id}`,
    },
    
    // Consignments
    consignments: {
      list: '/consignments',
      create: '/consignments',
      update: (id) => `/consignments/${id}`,
      delete: (id) => `/consignments/${id}`,
      details: (id) => `/consignments/${id}`,
      updateStatus: (id) => `/consignments/${id}/status`,
    },
    
    // Documents
    documents: {
      list: '/documents',
      upload: '/documents/upload',
      download: (id) => `/documents/${id}/download`,
      delete: (id) => `/documents/${id}`,
      details: (id) => `/documents/${id}`,
    },
    
    // Upload
    upload: '/upload',
    
    // Tickets
    tickets: {
      list: '/tickets',
      create: '/tickets',
      update: (id) => `/tickets/${id}`,
      delete: (id) => `/tickets/${id}`,
      details: (id) => `/tickets/${id}`,
      myTickets: '/tickets/my-tickets',
    },
    
    // Allocations
    allocations: {
      list: '/allocations',
      create: '/allocations',
      update: (id) => `/allocations/${id}`,
      delete: (id) => `/allocations/${id}`,
      details: (id) => `/allocations/${id}`,
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
