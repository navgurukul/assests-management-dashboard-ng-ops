'use client';

import React, { useState } from 'react';
import { AlertTriangle, Calendar, Package, Wrench, Clock, FileText } from 'lucide-react';
import ComponentTimeline from './components/ComponentTimeline';
import { 
  CurrentlyInstalledCard 
} from './components/InfoCards';
import DocumentAttachments from './components/DocumentAttachments';

// Tab definitions - matching Create Component stepper order + Component Journey
const tabs = [
  { id: 'journey', label: 'Component Journey', icon: Clock },
  { id: 'source', label: 'Component Source', icon: Package },
  { id: 'basic', label: 'Basic Information', icon: FileText },
  { id: 'documents', label: 'Documents', icon: FileText },
];

export default function ComponentDetails({ componentId, componentData, onBack }) {
  const [timelineFilter, setTimelineFilter] = useState(null);
  const [activeTab, setActiveTab] = useState('journey');

  // If no component data is passed, show error
  if (!componentData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 font-medium">Component data not available</p>
          <p className="text-gray-600 mt-2">Please navigate from the components list</p>
        </div>
      </div>
    );
  }

  const componentDetails = componentData;

  // Calculate summary statistics
  const calculateAge = (purchaseDate) => {
    const diff = new Date() - new Date(purchaseDate);
    const years = Math.floor(diff / (365 * 24 * 60 * 60 * 1000));
    const months = Math.floor((diff % (365 * 24 * 60 * 60 * 1000)) / (30 * 24 * 60 * 60 * 1000));
    return years > 0 ? `${years}y ${months}m` : `${months}m`;
  };

  const calculateWarrantyStatus = (expiryDate) => {
    if (!expiryDate) return { warrantyExpired: true, warrantyDaysLeft: 0 };
    const diff = new Date(expiryDate) - new Date();
    const daysLeft = Math.floor(diff / (24 * 60 * 60 * 1000));
    return {
      warrantyExpired: daysLeft <= 0,
      warrantyDaysLeft: daysLeft > 0 ? daysLeft : 0
    };
  };

  const calculateDepreciation = (purchasePrice, purchaseDate) => {
    const age = new Date() - new Date(purchaseDate);
    const years = age / (365 * 24 * 60 * 60 * 1000);
    const depreciationRate = 0.15; // 15% per year
    const currentValue = purchasePrice * Math.pow(1 - depreciationRate, years);
    return Math.max(currentValue, purchasePrice * 0.1); // Minimum 10% of original value
  };

  const warrantyStatus = calculateWarrantyStatus(componentDetails.purchaseDetails?.warrantyExpiryDate);
  const summaryStats = {
    age: componentDetails.purchaseDetails?.purchaseDate ? calculateAge(componentDetails.purchaseDetails.purchaseDate) : 'N/A',
    devicesUsedIn: componentDetails.previousInstallations?.length || 0,
    currentValue: (componentDetails.purchaseDetails?.purchasePrice && componentDetails.purchaseDetails?.purchaseDate) 
      ? Math.round(calculateDepreciation(componentDetails.purchaseDetails.purchasePrice, componentDetails.purchaseDetails.purchaseDate))
      : 0,
    ...warrantyStatus
  };

  // Status formatting
  const getStatusColor = (status) => {
    const statusColors = {
      'WORKING': 'text-green-600',
      'IN_STOCK': 'text-blue-600',
      'INSTALLED': 'text-indigo-600',
      'UNDER_TESTING': 'text-yellow-600',
      'FAULTY': 'text-red-600',
      'SCRAP': 'text-gray-600'
    };
    return statusColors[status] || 'text-gray-900';
  };

  const getStatusBadgeColor = (status) => {
    const badgeColors = {
      'WORKING': 'bg-green-100 text-green-800 border-green-300',
      'IN_STOCK': 'bg-blue-100 text-blue-800 border-blue-300',
      'INSTALLED': 'bg-indigo-100 text-indigo-800 border-indigo-300',
      'UNDER_TESTING': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'FAULTY': 'bg-red-100 text-red-800 border-red-300',
      'SCRAP': 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return badgeColors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  // Document handlers (still needed for DocumentAttachments component)
  const handleUploadDocuments = (files) => {
    // Upload files to server
  };

  const handleDeleteDocument = (docId) => {
    // Delete document from server
  };

  // Check if warranty is expiring soon (30 days)
  const warrantyExpiringSoon = warrantyStatus.warrantyDaysLeft > 0 && warrantyStatus.warrantyDaysLeft <= 30;

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-3 text-xs text-gray-600">
          <span className="hover:text-blue-600 cursor-pointer" onClick={onBack}>Components</span>
          <span className="mx-2">›</span>
          <span>Component Details</span>
          <span className="mx-2">›</span>
          <span className="font-medium text-gray-900">{componentDetails.componentTag}</span>
        </div>

        {/* Header with alerts */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-200">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900 mb-1.5">
                COMPONENT: {componentDetails.componentTag}
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded text-xs font-semibold border ${getStatusBadgeColor(componentDetails.status)}`}>
                  {componentDetails.status}
                </span>
                <span className="text-xs text-gray-600">
                  {componentDetails.componentType?.name || componentDetails.componentType} • {componentDetails.brand} {componentDetails.model}
                </span>
              </div>
            </div>
          </div>

          {/* Warranty expiring alert */}
          {warrantyExpiringSoon && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-900">Warranty Expiring Soon</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Warranty expires in {warrantyStatus.warrantyDaysLeft} days on{' '}
                  {new Date(componentDetails.purchaseDetails?.warrantyExpiryDate).toLocaleDateString('en-IN')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Summary Statistics - Quick Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-4">
          <div className=" from-blue-50 to-indigo-50 rounded-lg shadow-sm p-3 border border-blue-200">
            <p className="text-[10px] text-gray-500 mb-0.5 uppercase tracking-wide">Component Age</p>
            <p className="text-xl font-bold text-gray-900">{summaryStats.age}</p>
          </div>
          
          <div className=" from-green-50 to-emerald-50 rounded-lg shadow-sm p-3 border border-green-200">
            <p className="text-[10px] text-gray-500 mb-0.5 uppercase tracking-wide">Devices Used In</p>
            <p className="text-xl font-bold text-gray-900">{summaryStats.devicesUsedIn}</p>
          </div>
          
          <div className=" from-purple-50 to-pink-50 rounded-lg shadow-sm p-3 border border-purple-200">
            <p className="text-[10px] text-gray-500 mb-0.5 uppercase tracking-wide">Current Value</p>
            <p className="text-xl font-bold text-gray-900">₹{summaryStats.currentValue?.toLocaleString('en-IN')}</p>
          </div>
          
          <div className={`rounded-lg shadow-sm p-3 border ${
            summaryStats.warrantyExpired 
              ? ' from-red-50 to-orange-50 border-red-200' 
              : ' from-green-50 to-teal-50 border-green-200'
          }`}>
            <p className="text-[10px] text-gray-500 mb-0.5 uppercase tracking-wide">Warranty Status</p>
            <p className={`text-xl font-bold ${summaryStats.warrantyExpired ? 'text-red-600' : 'text-green-600'}`}>
              {summaryStats.warrantyExpired ? 'Expired' : `${summaryStats.warrantyDaysLeft} days`}
            </p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {/* Journey Tab */}
          {activeTab === 'journey' && (
            <div className="space-y-6">
              {/* Component Journey Timeline */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Component Journey / Lifecycle History
                  </h3>
                  
                  {/* Timeline filter */}
                  <select
                    value={timelineFilter || ''}
                    onChange={(e) => setTimelineFilter(e.target.value || null)}
                    className="text-sm border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Events</option>
                    <option value="ACQUIRED">Acquired</option>
                    <option value="INSTALLED">Installed</option>
                    <option value="REMOVED">Removed</option>
                    <option value="TESTED">Tested</option>
                    <option value="LOCATION_CHANGED">Location Changed</option>
                  </select>
                </div>

                <ComponentTimeline 
                  events={componentDetails.journey || []} 
                  filterType={timelineFilter}
                />
              </div>

              {/* Currently Installed In */}
              {componentDetails.currentDevice && (
                <CurrentlyInstalledCard deviceInfo={componentDetails.currentDevice} />
              )}
            </div>
          )}

          {/* Component Source Tab */}
          {activeTab === 'source' && (
            <div className="space-y-6">
              {/* Source Information Card */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Source Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">Source Type</span>
                    <span className={`text-sm font-medium px-2 py-1 rounded inline-block w-fit ${
                      componentDetails.source === 'NEW_PURCHASE' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {componentDetails.source === 'NEW_PURCHASE' ? 'New Purchase' : 'Extracted from Device'}
                    </span>
                  </div>

                  {/* New Purchase Details */}
                  {componentDetails.source === 'NEW_PURCHASE' && (
                    <>
                      {componentDetails.purchaseDetails?.invoiceNumber && (
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 mb-1">Invoice Number</span>
                          <span className="text-sm font-medium text-gray-900">{componentDetails.purchaseDetails.invoiceNumber}</span>
                        </div>
                      )}
                      
                      {componentDetails.purchaseDetails?.purchaseOrderNumber && (
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 mb-1">Purchase Order Number</span>
                          <span className="text-sm font-medium text-gray-900">{componentDetails.purchaseDetails.purchaseOrderNumber}</span>
                        </div>
                      )}

                      {componentDetails.purchaseDetails?.vendorName && (
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 mb-1">Vendor Name</span>
                          <span className="text-sm font-medium text-gray-900">{componentDetails.purchaseDetails.vendorName}</span>
                        </div>
                      )}

                      {componentDetails.purchaseDetails?.vendorDetails && (
                        <div className="flex flex-col col-span-2">
                          <span className="text-xs text-gray-500 mb-1">Vendor Details</span>
                          <span className="text-sm text-gray-700">{componentDetails.purchaseDetails.vendorDetails}</span>
                        </div>
                      )}

                      {componentDetails.purchaseDetails?.purchaseDate && (
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 mb-1">Purchase Date</span>
                          <span className="text-sm font-medium text-gray-900 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(componentDetails.purchaseDetails.purchaseDate).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                      )}

                      {componentDetails.purchaseDetails?.purchasePrice && (
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 mb-1">Purchase Price</span>
                          <span className="text-sm font-medium text-gray-900">
                            ₹{componentDetails.purchaseDetails.purchasePrice?.toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}

                      {componentDetails.purchaseDetails?.warrantyExpiryDate && (
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 mb-1">Warranty Expiry Date</span>
                          <span className="text-sm font-medium text-gray-900 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(componentDetails.purchaseDetails.warrantyExpiryDate).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  {/* Extracted from Device Details */}
                  {componentDetails.source === 'EXTRACTED' && (
                    <>
                      {componentDetails.extractionDetails?.sourceAssetTag && (
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 mb-1">Source Device Tag</span>
                          <a 
                            href={`/assets/${componentDetails.extractionDetails.sourceAssetId}`}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800"
                          >
                            {componentDetails.extractionDetails.sourceAssetTag}
                          </a>
                        </div>
                      )}
                      
                      {componentDetails.extractionDetails?.sourceDeviceType && (
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 mb-1">Source Device Type</span>
                          <span className="text-sm font-medium text-gray-900">{componentDetails.extractionDetails.sourceDeviceType}</span>
                        </div>
                      )}

                      {componentDetails.extractionDetails?.extractionDate && (
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 mb-1">Extraction Date</span>
                          <span className="text-sm font-medium text-gray-900 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(componentDetails.extractionDetails.extractionDate).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                      )}

                      {componentDetails.extractionDetails?.extractionReason && (
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 mb-1">Extraction Reason</span>
                          <span className="text-sm font-medium text-gray-900">{componentDetails.extractionDetails.extractionReason}</span>
                        </div>
                      )}

                      {componentDetails.extractionDetails?.extractedBy && (
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 mb-1">Technician Name</span>
                          <span className="text-sm font-medium text-gray-900 flex items-center gap-1">
                            <Wrench className="w-3 h-3" />
                            {componentDetails.extractionDetails.extractedBy?.name || componentDetails.extractionDetails.extractedBy}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">Component Type</span>
                    <span className="text-sm font-medium text-gray-900">{componentDetails.componentType?.name || componentDetails.componentType || 'N/A'}</span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">Brand/Manufacturer</span>
                    <span className="text-sm font-medium text-gray-900">{componentDetails.brand || 'N/A'}</span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">Model Number</span>
                    <span className="text-sm font-medium text-gray-900">{componentDetails.model || componentDetails.modelNumber || 'N/A'}</span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">Specifications</span>
                    <span className="text-sm font-medium text-gray-900">{componentDetails.specifications || 'N/A'}</span>
                  </div>
                  
                  {componentDetails.serialNumber && (
                    <div className="flex flex-col col-span-2">
                      <span className="text-xs text-gray-500 mb-1">Serial Number</span>
                      <span className="text-sm font-medium text-gray-900">{componentDetails.serialNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div>
              <DocumentAttachments
                documents={componentDetails.documents || []}
                onUpload={handleUploadDocuments}
                onDelete={handleDeleteDocument}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
