 

import config from '@/app/config/env.config';
import post from '@/app/api/post/post';
import get from '@/app/api/get/get';
 
const apiService = { 
  get: async (endpoint, options = {}) => {
    const url = config.getApiUrl(endpoint);
    return await get({ url, ...options });
  },
 
  post: async (endpoint, data, options = {}) => {
    const url = config.getApiUrl(endpoint);
    return await post({ url, method: 'POST', data, ...options });
  },
 
  put: async (endpoint, data, options = {}) => {
    const url = config.getApiUrl(endpoint);
    return await post({ url, method: 'PUT', data, ...options });
  },
 
  delete: async (endpoint, options = {}) => {
    const url = config.getApiUrl(endpoint);
    return await post({ url, method: 'DELETE', ...options });
  },
 
  patch: async (endpoint, data, options = {}) => {
    const url = config.getApiUrl(endpoint);
    return await post({ url, method: 'PATCH', data, ...options });
  },
};

export default apiService;
 
export const { get: apiGet, post: apiPost, put: apiPut, delete: apiDelete, patch: apiPatch } = apiService;
