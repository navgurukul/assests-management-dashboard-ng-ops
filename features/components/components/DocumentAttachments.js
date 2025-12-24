'use client';

import React, { useState } from 'react';
import { Upload, FileText, Image, X, Download, Eye } from 'lucide-react';

export default function DocumentAttachments({ documents = [], onUpload, onDelete }) {
  const [dragActive, setDragActive] = useState(false);

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

  const handleFiles = (files) => {
    if (onUpload) {
      onUpload(Array.from(files));
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
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-sm text-gray-600 mb-2">
          Drag and drop files here, or click to browse
        </p>
        <p className="text-xs text-gray-500 mb-4">
          Supported: PDF, Images, Documents (Max 10MB)
        </p>
        <label className="cursor-pointer">
          <span className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors inline-block">
            Browse Files
          </span>
          <input
            type="file"
            className="hidden"
            multiple
            onChange={handleChange}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          />
        </label>
      </div>

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
                      <button
                        onClick={() => window.open(doc.url, '_blank')}
                        className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => window.open(doc.url, '_blank')}
                        className="p-2 text-gray-600 hover:text-green-600 transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(doc.id)}
                      className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <X className="w-4 h-4" />
                    </button>
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
