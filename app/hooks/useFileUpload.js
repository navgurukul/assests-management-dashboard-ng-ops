import { useState } from 'react';
import apiService from '@/app/utils/apiService';
import config from '@/app/config/env.config';

export default function useFileUpload({ onSuccess, onError } = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const uploadFiles = async (files, additionalData = {}) => {
    if (!files || files.length === 0) {
      return null;
    }

    // Reset states
    setUploadError(null);
    setIsUploading(true);

    try {
      // Upload files to the API using the existing post method
      const response = await apiService.upload(
        config.endpoints.upload,
        files,
        additionalData
      );

      // Handle successful upload
      if (response && response.data) {
        const uploadedDocuments = Array.isArray(response.data)
          ? response.data
          : [response.data];

        const normalizedDocuments = uploadedDocuments.map((doc) => ({
          id: doc.id || doc._id || `DOC-${Date.now()}`,
          name: doc.name || doc.filename || doc.originalName,
          url: doc.url || doc.path,
          size: doc.size,
          mimeType: doc.mimeType || doc.mimetype,
          type: doc.type || 'OTHER',
          uploadedAt: doc.uploadDate || doc.createdAt || new Date().toISOString()
        }));

        // Call success callback
        if (onSuccess) {
          onSuccess(normalizedDocuments, response);
        }

        return normalizedDocuments;
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.message || 'Failed to upload files. Please try again.';
      setUploadError(errorMessage);

      // Call error callback
      if (onError) {
        onError(error);
      }

      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const clearError = () => {
    setUploadError(null);
  };

  const reset = () => {
    setIsUploading(false);
    setUploadError(null);
  };

  return {
    uploadFiles,
    isUploading,
    uploadError,
    clearError,
    reset
  };
}
