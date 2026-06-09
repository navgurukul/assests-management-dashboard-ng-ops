'use client';

import React, { useState } from 'react';
import { FileText, Upload, X, Link, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import apiService from '@/app/utils/apiService';
import config from '@/app/config/env.config';
import useFetch from '@/app/hooks/query/useFetch';

export default function PurchaseBillSelector({
  selectedBills = [],
  onBillsChange,
  allowMultiple = false,
}) {
  const [mode, setMode] = useState('link');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Fetch existing purchase bills
  const { data, isLoading, error } = useFetch({
    url: '/purchase-bills?page=1&limit=100',
    queryKey: ['purchase-bills', 'list'],
    enabled: true,
  });

  // Extract bills from API response
  const existingBills = data?.success && Array.isArray(data?.data?.bills)
    ? data.data.bills
    : [];

  const filteredBills = existingBills.filter((bill) => {
    const fileName = bill.name || '';
    const id = bill.id || '';
    return (
      fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleBillToggle = (bill) => {
    const isSelected = selectedBills.some((b) => b.id === bill.id);

    // Already selected - do nothing (no deselect in single-select mode)
    if (isSelected && !allowMultiple) return;

    const billObj = {
      id: bill.id,
      name: bill.name || 'Untitled',
      url: bill.purchaseBillsUrl || bill.url,
      isNew: false,
    };

    onBillsChange(allowMultiple ? [...selectedBills, billObj] : [billObj]);
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploadError(null);
    setIsUploading(true);

    try {
      const response = await apiService.upload(
        config.endpoints.purchaseBills.create,
        files[0],
        {}
      );

      if (response?.data) {
        const doc = response.data?.bill || response.data;
        const billId = doc.id;

        if (!billId) {
          setUploadError('Upload succeeded but bill ID was not returned. Please try again.');
          return;
        }

        const newBill = {
          id: billId,
          name: doc.name || files[0].name,
          url: doc.purchaseBillsUrl || doc.url,
          isNew: true,
          size: files[0].size,
        };

        // allowMultiple false - always replace, never append
        onBillsChange([newBill]);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(err?.response?.data?.message || err.message || 'Failed to upload. Please try again.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      {/* Label */}
      <label className="block text-xs font-medium text-gray-700 mb-1">
        Purchase Bills / Invoices
      </label>

      {/* Mode Toggle */}
      <div className="flex gap-3 p-1 bg-gray-100 rounded-lg w-full">
        <button
          type="button"
          onClick={() => setMode('link')}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-md text-sm font-medium transition-colors ${
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
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-md text-sm font-medium transition-colors ${
            mode === 'upload'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload New Bill
        </button>
      </div>

      {/* Link Existing Bills */}
      {mode === 'link' && (
        <div className="border border-gray-300 rounded-lg p-4">
          <input
            type="text"
            placeholder="Search by file name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3 text-sm"
          />

          <div className="border border-gray-200 rounded-md max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-blue-500 text-sm flex items-center gap-2 justify-center">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading bills...
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500 text-sm flex items-center gap-2 justify-center">
                <AlertCircle className="w-4 h-4" /> Failed to load bills.
              </div>
            ) : filteredBills.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredBills.map((bill) => {
                  const isSelected = selectedBills.some((b) => b.id === bill.id);
                  return (
                    <div
                      key={bill.id}
                      onClick={() => handleBillToggle(bill)}
                      className={`p-3 cursor-pointer hover:bg-blue-50 transition-colors ${
                        isSelected ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <FileText
                          className={`w-5 h-5 shrink-0 ${
                            isSelected ? 'text-blue-600' : 'text-gray-400'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm text-gray-900 truncate">
                              {bill.fileName || bill.name || 'Untitled'}
                            </p>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">ID: {bill.id}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500 text-sm">
                {searchTerm ? 'No bills match your search' : 'No existing bills found'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload New Bill */}
      {mode === 'upload' && (
        <div className="w-full">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isUploading
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-blue-500'
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-12 h-12 mx-auto mb-3 text-blue-600 animate-spin" />
                <p className="text-sm text-blue-600 font-medium">Uploading...</p>
                <p className="text-xs text-gray-500 mt-1">Please wait</p>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm text-gray-600 mb-1">Upload new Bill/Invoice</p>
                <p className="text-xs text-gray-500 mb-4">PDF, Image files (Max 10MB)</p>
                <label className="cursor-pointer">
                  <span className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors inline-block">
                    Choose File
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".pdf,.jpg,.jpeg,.png"
                    disabled={isUploading}
                  />
                </label>
              </>
            )}
          </div>

          {/* Upload Error */}
          {uploadError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 flex-1">{uploadError}</p>
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

      {/* Selected Bills Display */}
      {selectedBills.length > 0 && (
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Selected Bill ({selectedBills.length})
          </h4>
          <div className="space-y-2">
            {selectedBills.map((bill) => (
              <div
                key={bill.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{bill.name}</p>
                    <p className="text-xs text-gray-500">
                      {bill.isNew
                        ? `New Upload${bill.size ? ' • ' + formatFileSize(bill.size) : ''}`
                        : 'Existing Bill'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onBillsChange(selectedBills.filter((b) => b.id !== bill.id))}
                  className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors ml-2 shrink-0"
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
