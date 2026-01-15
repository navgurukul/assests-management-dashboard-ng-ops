 

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
  
  upload: async (endpoint, files, additionalData = {}, options = {}) => {
    const url = config.getApiUrl(endpoint);
    
    // Create FormData
    const formData = new FormData();
    
    // Handle single file or multiple files
    const fileArray = Array.isArray(files) ? files : [files];
    
    // Append files to FormData
    fileArray.forEach((file) => {
      const fieldName = fileArray.length === 1 ? 'file' : 'files';
      formData.append(fieldName, file);
    });
    
    // Append additional data if provided
    Object.keys(additionalData).forEach((key) => {
      formData.append(key, additionalData[key]);
    });
    
    // Use the existing post method with FormData
    return await post({ url, method: 'POST', data: formData, ...options });
  },
};

export default apiService;
 
export const { get: apiGet, post: apiPost, put: apiPut, delete: apiDelete, patch: apiPatch, upload: apiUpload } = apiService;
