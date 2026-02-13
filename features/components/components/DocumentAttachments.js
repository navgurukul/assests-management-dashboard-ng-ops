'use client';

import React, { useState } from 'react';
import { Upload, FileText, Image, X, Download, Eye, Loader2, AlertCircle } from 'lucide-react';
import apiService from '@/app/utils/apiService';
import config from '@/app/config/env.config';
import CustomButton from '@/components/atoms/CustomButton';

export default function DocumentAttachments({ documents = [], onUpload, onDelete }) {
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files) => {
    const fileArray = Array.from(files);
    
    if (fileArray.length === 0) return;
    
    // Reset error state
    setUploadError(null);
    setIsUploading(true);
    
    try {
      // Upload files to the API
      const response = await apiService.upload(
        config.endpoints.upload,
        fileArray
      );
      
      // Handle successful upload
      if (response && response.data) {
        // Map API response to document format
        const uploadedDocuments = Array.isArray(response.data) 
          ? response.data 
          : [response.data];
        
        const newDocuments = uploadedDocuments.map((doc) => ({
          id: doc.id || doc._id || `DOC-${Date.now()}`,
          name: doc.name || doc.filename || doc.originalName,
          url: doc.url || doc.path,
          size: doc.size,
          mimeType: doc.mimeType || doc.mimetype,
          type: doc.type || 'OTHER',
          uploadedAt: doc.uploadDate || doc.createdAt || new Date().toISOString()
        }));
        
        // Call the onUpload callback with the uploaded documents
        if (onUpload) {
          onUpload(newDocuments);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'Failed to upload files. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) {
      return Image;
    }
    return FileText;
  };

  const getFileTypeLabel = (type) => {
    const typeMap = {
      'INVOICE': { label: 'Invoice', color: 'bg-blue-100 text-blue-800' },
      'WARRANTY': { label: 'Warranty', color: 'bg-green-100 text-green-800' },
      'TEST_REPORT': { label: 'Test Report', color: 'bg-yellow-100 text-yellow-800' },
      'PHOTO': { label: 'Photo', color: 'bg-purple-100 text-purple-800' },
      'OTHER': { label: 'Other', color: 'bg-gray-100 text-gray-800' }
    };
    return typeMap[type] || typeMap['OTHER'];
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
        Document Attachments
      </h3>

      {/* Upload area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isUploading 
            ? 'border-blue-400 bg-blue-50'
            : dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <>
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
            <p className="text-sm text-blue-600 font-medium mb-2">
              Uploading files...
            </p>
            <p className="text-xs text-gray-500">
              Please wait while your files are being uploaded
            </p>
          </>
        ) : (
          <>
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-sm text-gray-600 mb-2">
              Drag and drop files here, or click to browse
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Supported: PDF, Images, Documents (Max 10MB)
            </p>
            <label className="cursor-pointer">
              <CustomButton
                text="Browse Files"
                icon={Upload}
                variant="primary"
                size="md"
                disabled={isUploading}
              />
              <input
                type="file"
                className="hidden"
                multiple
                onChange={handleChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                disabled={isUploading}
              />
            </label>
          </>
        )}
      </div>
      
      {/* Error Message */}
      {uploadError && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800 font-medium">Upload Failed</p>
            <p className="text-xs text-red-600 mt-1">{uploadError}</p>
          </div>
          <CustomButton
            icon={X}
            onClick={() => setUploadError(null)}
            variant="danger"
            size="sm"
            className="!p-1.5 !border-0 !shadow-none"
          />
        </div>
      )}

      {/* Documents list */}
      {documents && documents.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Uploaded Documents</h4>
          
          {documents.map((doc, index) => {
            const Icon = getFileIcon(doc.mimeType || 'application/pdf');
            const typeInfo = getFileTypeLabel(doc.type);
            
            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Icon className="w-8 h-8 text-gray-400 shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {doc.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                      <span className="text-xs text-gray-500">
                        {doc.size && `${(doc.size / 1024).toFixed(1)} KB`}
                      </span>
                      {doc.uploadedAt && (
                        <span className="text-xs text-gray-500">
                          • {new Date(doc.uploadedAt).toLocaleDateString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {doc.url && (
                    <>
                      <CustomButton
                        icon={Eye}
                        onClick={() => window.open(doc.url, '_blank')}
                        variant="info"
                        size="sm"
                        title="View"
                        className="!p-1.5"
                      />
                      <CustomButton
                        icon={Download}
                        onClick={() => window.open(doc.url, '_blank')}
                        variant="success"
                        size="sm"
                        title="Download"
                        className="!p-1.5"
                      />
                    </>
                  )}
                  {onDelete && (
                    <CustomButton
                      icon={X}
                      onClick={() => onDelete(doc.id)}
                      variant="danger"
                      size="sm"
                      title="Delete"
                      className="!p-1.5"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {documents && documents.length === 0 && (
        <p className="mt-4 text-sm text-gray-500 text-center">
          No documents uploaded yet
        </p>
      )}
    </div>
  );
}
