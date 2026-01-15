'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Upload, X, Search, Plus, Link, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import apiService from '@/app/utils/apiService';
import config from '@/app/config/env.config';
 
export default function DocumentSelector({ 
  selectedDocuments = [], 
  onDocumentsChange,
  allowMultiple = true,
  documentType = 'INVOICE'  
}) {
  const [mode, setMode] = useState('link'); // 'link' or 'upload'
  const [searchTerm, setSearchTerm] = useState('');
  const [showDocumentList, setShowDocumentList] = useState(false);
  const [existingDocuments, setExistingDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  
  // Load documents from dummy data
  useEffect(() => {
    import('@/dummyJson/dummyJson').then(module => {
      setExistingDocuments(module.documentsLibrary || []);
    });
  }, []);

  // Filter documents based on search term
  const filteredDocuments = existingDocuments.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDocumentToggle = (document) => {
    const isSelected = selectedDocuments.some(d => d.id === document.id);
    
    if (isSelected) {
      // Remove document
      onDocumentsChange(selectedDocuments.filter(d => d.id !== document.id));
    } else {
      // Add document
      if (allowMultiple) {
        onDocumentsChange([...selectedDocuments, document]);
      } else {
        onDocumentsChange([document]);
      }
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // Reset error state
    setUploadError(null);
    setIsUploading(true);
    
    try {
      // Upload files to the API
      const response = await apiService.upload(
        config.endpoints.upload,
        files,
        { type: documentType }
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
          type: documentType,
          url: doc.url || doc.path,
          isNew: true,
          size: doc.size,
          uploadDate: doc.uploadDate || doc.createdAt || new Date().toISOString()
        }));
        
        if (allowMultiple) {
          onDocumentsChange([...selectedDocuments, ...newDocuments]);
        } else {
          onDocumentsChange([newDocuments[0]]);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset the input value so the same file can be uploaded again
      e.target.value = '';
    }
  };

  const handleRemoveDocument = (docId) => {
    onDocumentsChange(selectedDocuments.filter(d => d.id !== docId));
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      {/* Mode Selection */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
        <button
          type="button"
          onClick={() => setMode('link')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'link' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Link className="w-4 h-4" />
          Link to Existing Bill
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'upload' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload New Bill
        </button>
      </div>

      {/* Link Existing Documents */}
      {mode === 'link' && (
        <div className="border border-gray-300 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search Bill/Invoice (Vendor, Date, Invoice Number...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowDocumentList(true)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Document List */}
          {(showDocumentList || searchTerm) && (
            <div className="border border-gray-200 rounded-md max-h-60 overflow-y-auto">
              {filteredDocuments.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {filteredDocuments.map((doc) => {
                    const isSelected = selectedDocuments.some(d => d.id === doc.id);
                    return (
                      <div
                        key={doc.id}
                        onClick={() => handleDocumentToggle(doc)}
                        className={`p-3 cursor-pointer hover:bg-blue-50 transition-colors ${
                          isSelected ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <FileText className={`w-5 h-5 mt-0.5 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm text-gray-900">{doc.name}</p>
                                {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                              </div>
                              <p className="text-xs text-gray-600 mt-1">
                                ID: {doc.id} | Vendor: {doc.vendor} | Date: {doc.date}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Amount: {doc.amount} | Already linked to {doc.componentsLinked} components
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No documents found
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Upload New Documents */}
      {mode === 'upload' && (
        <div>
          <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isUploading ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-500'
          }`}>
            {isUploading ? (
              <>
                <Loader2 className="w-12 h-12 mx-auto mb-3 text-blue-600 animate-spin" />
                <p className="text-sm text-blue-600 font-medium mb-2">
                  Uploading...
                </p>
                <p className="text-xs text-gray-500">
                  Please wait while your file is being uploaded
                </p>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm text-gray-600 mb-2">
                  Upload new Bill/Invoice
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  PDF, Image files (Max 10MB)
                </p>
                <label className="cursor-pointer">
                  <span className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors inline-block">
                    Choose File
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    multiple={allowMultiple}
                    onChange={handleFileUpload}
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
              <button
                type="button"
                onClick={() => setUploadError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Selected Documents Display */}
      {selectedDocuments.length > 0 && (
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Selected Documents ({selectedDocuments.length})
          </h4>
          <div className="space-y-2">
            {selectedDocuments.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200"
              >
                <div className="flex items-center gap-3 flex-1">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                    {doc.isNew ? (
                      <p className="text-xs text-gray-500">
                        New Upload • {formatFileSize(doc.size)}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500">
                        {doc.vendor} • {doc.date} • {doc.amount}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveDocument(doc.id)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
