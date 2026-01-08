'use client';

import React, { useState } from 'react';
import { AlertTriangle, Calendar, Package, Wrench, ChevronDown, ChevronUp, Clock, HardDrive, Shield, FileText, TestTube, MapPin } from 'lucide-react';
import useFetch from '@/app/hooks/query/useFetch';
import ComponentTimeline from './components/ComponentTimeline';
import { 
  CurrentlyInstalledCard, 
  PreviouslyInstalledCard, 
  StorageHistoryCard,
  SummaryStatsCard 
} from './components/InfoCards';
import ActionButtons from './components/ActionButtons';
import DocumentAttachments from './components/DocumentAttachments';
import CustomButton from '@/components/atoms/CustomButton';

// Tab definitions
const tabs = [
  { id: 'journey', label: 'Component Journey', icon: Clock },
  { id: 'usage', label: 'Usage History', icon: HardDrive },
  { id: 'warranty', label: 'Warranty & Purchase', icon: Shield },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'testing', label: 'Testing History', icon: TestTube },
  { id: 'location', label: 'Location History', icon: MapPin },
];

export default function ComponentDetails({ componentId, onBack }) {
  const [editMode, setEditMode] = useState(false);
  const [showAllFields, setShowAllFields] = useState(false);
  const [timelineFilter, setTimelineFilter] = useState(null);
  const [activeTab, setActiveTab] = useState('journey');

  // Fetch component details from API
  // For now, using dummy data. Replace with actual API call when backend is ready.
  const { data, isLoading, isError, error } = useFetch({
    url: `https://asset-dashboard.navgurukul.org/api/components/${componentId}`,
    queryKey: ['component', componentId],
    enabled: false, // Disabled for now, using dummy data
  });

  // Temporary: Use dummy data
  const [componentDetails, setComponentDetails] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate API call with dummy data
    import('@/dummyJson/dummyJson').then(module => {
      const dummyData = module.componentDetailsData[componentId];
      if (dummyData) {
        setComponentDetails(dummyData);
      }
      setLoading(false);
    });
  }, [componentId]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading component details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!componentDetails) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 font-medium">Component not found</p>
          <p className="text-gray-600 mt-2">Component ID: {componentId}</p>
        </div>
      </div>
    );
  }

  // Remove the old error handling code below
  /*
  // Error state
  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 font-medium">Error loading component details</p>
          <p className="text-gray-600 mt-2">{error?.message || 'Something went wrong'}</p>
        </div>
      </div>
    );
  }

  if (!data || !data.data) {
    return (
      <div className="p-6">
        <p>Component not found</p>
      </div>
    );
  }

  const componentDetails = data.data;
  */

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

  const warrantyStatus = calculateWarrantyStatus(componentDetails.warrantyExpiryDate);
  const summaryStats = {
    age: calculateAge(componentDetails.purchaseDate),
    devicesUsedIn: componentDetails.previousInstallations?.length || 0,
    currentValue: Math.round(calculateDepreciation(componentDetails.purchasePrice, componentDetails.purchaseDate)),
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

  // Action handlers
  const handleEdit = () => {
    setEditMode(true);
    console.log('Edit mode enabled');
  };

  const handleMarkFaulty = () => {
    console.log('Mark as faulty');
    // API call to mark as faulty
  };

  const handleMoveStorage = () => {
    console.log('Move storage');
    // Open modal for storage location change
  };

  const handleInstall = () => {
    console.log('Install in device');
    // Open modal for device installation
  };

  const handleRemove = () => {
    console.log('Remove from device');
    // API call to remove from device
  };

  const handleMarkScrap = () => {
    console.log('Mark as scrap');
    // API call to mark as scrap
  };

  const handleGenerateQR = () => {
    console.log('Generate QR code');
    // Generate and download QR code
  };

  const handlePrintLabel = () => {
    console.log('Print label');
    // Open print dialog for component label
  };

  const handleViewTestReports = () => {
    console.log('View test reports');
    // Open test reports modal
  };

  const handleUploadDocuments = (files) => {
    console.log('Upload documents:', files);
    // Upload files to server
  };

  const handleDeleteDocument = (docId) => {
    console.log('Delete document:', docId);
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
                  {componentDetails.componentType} • {componentDetails.brand} {componentDetails.modelNumber}
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
                  {new Date(componentDetails.warrantyExpiryDate).toLocaleDateString('en-IN')}
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
              {/* Action Buttons */}
              <ActionButtons
                componentStatus={componentDetails.status}
                onEdit={handleEdit}
                onMarkFaulty={handleMarkFaulty}
                onMoveStorage={handleMoveStorage}
                onInstall={handleInstall}
                onRemove={handleRemove}
                onMarkScrap={handleMarkScrap}
                onGenerateQR={handleGenerateQR}
                onPrintLabel={handlePrintLabel}
                onViewTestReports={handleViewTestReports}
                onUploadDocuments={handleUploadDocuments}
              />

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

          {/* Usage History Tab */}
          {activeTab === 'usage' && (
            <div className="space-y-6">
              {/* Previously Installed In */}
              {componentDetails.previousInstallations && componentDetails.previousInstallations.length > 0 ? (
                <PreviouslyInstalledCard devices={componentDetails.previousInstallations} />
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200 text-center">
                  <HardDrive className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No previous installation history available</p>
                </div>
              )}
            </div>
          )}

          {/* Warranty & Purchase Tab */}
          {activeTab === 'warranty' && (
            <div className="space-y-6">
              {/* Basic Information Card */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">Component Type</span>
                    <span className="text-sm font-medium text-gray-900">{componentDetails.componentType}</span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">Brand</span>
                    <span className="text-sm font-medium text-gray-900">{componentDetails.brand}</span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">Model Number</span>
                    <span className="text-sm font-medium text-gray-900">{componentDetails.modelNumber}</span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">Specifications</span>
                    <span className="text-sm font-medium text-gray-900">{componentDetails.specifications}</span>
                  </div>
                  
                  {componentDetails.serialNumber && (
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 mb-1">Serial Number</span>
                      <span className="text-sm font-medium text-gray-900">{componentDetails.serialNumber}</span>
                    </div>
                  )}
                </div>

                {/* Toggle for more fields */}
                <CustomButton
                  text={showAllFields ? 'Show Less' : 'Show More Details'}
                  icon={showAllFields ? ChevronUp : ChevronDown}
                  onClick={() => setShowAllFields(!showAllFields)}
                  variant="secondary"
                  size="sm"
                  className="mt-4"
                />

                {/* Additional fields */}
                {showAllFields && (
                  <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 mb-1">Purchase Date</span>
                      <span className="text-sm font-medium text-gray-900 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(componentDetails.purchaseDate).toLocaleDateString('en-IN')}
                      </span>
                    </div>

                    {componentDetails.warrantyExpiryDate && (
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 mb-1">Warranty Expiry</span>
                        <span className={`text-sm font-medium flex items-center gap-1 ${
                          warrantyStatus.warrantyExpired ? 'text-red-600' : 'text-green-600'
                        }`}>
                          <Calendar className="w-3 h-3" />
                          {new Date(componentDetails.warrantyExpiryDate).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    )}

                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 mb-1">Purchase Price</span>
                      <span className="text-sm font-medium text-gray-900">
                        ₹{componentDetails.purchasePrice?.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {componentDetails.vendorName && (
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 mb-1">Vendor</span>
                        <span className="text-sm font-medium text-gray-900">{componentDetails.vendorName}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

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
                      componentDetails.sourceType === 'NEW_PURCHASE' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {componentDetails.sourceType === 'NEW_PURCHASE' ? 'New Purchase' : 'Extracted from Device'}
                    </span>
                  </div>

                  {componentDetails.sourceType === 'NEW_PURCHASE' && componentDetails.invoiceNumber && (
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 mb-1">Invoice Number</span>
                      <span className="text-sm font-medium text-gray-900">{componentDetails.invoiceNumber}</span>
                    </div>
                  )}

                  {componentDetails.sourceType === 'EXTRACTED' && componentDetails.sourceDeviceTag && (
                    <>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 mb-1">Source Device</span>
                        <a 
                          href={`/assets/${componentDetails.sourceDeviceId}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          {componentDetails.sourceDeviceTag}
                        </a>
                      </div>
                      
                      {componentDetails.extractionReason && (
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 mb-1">Extraction Reason</span>
                          <span className="text-sm font-medium text-gray-900">{componentDetails.extractionReason}</span>
                        </div>
                      )}

                      {componentDetails.extractionTechnician && (
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 mb-1">Extracted By</span>
                          <span className="text-sm font-medium text-gray-900 flex items-center gap-1">
                            <Wrench className="w-3 h-3" />
                            {componentDetails.extractionTechnician}
                          </span>
                        </div>
                      )}
                    </>
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

          {/* Testing History Tab */}
          {activeTab === 'testing' && (
            <div className="space-y-6">
              {/* Testing Information */}
              {(componentDetails.lastTestedDate || componentDetails.testResults) ? (
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide flex items-center gap-2">
                    <TestTube className="w-4 h-4" />
                    Testing Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {componentDetails.lastTestedDate && (
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 mb-1">Last Tested</span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(componentDetails.lastTestedDate).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    )}

                    {componentDetails.testedBy && (
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 mb-1">Tested By</span>
                        <span className="text-sm font-medium text-gray-900">{componentDetails.testedBy}</span>
                      </div>
                    )}

                    {componentDetails.testResults && (
                      <div className="flex flex-col col-span-2">
                        <span className="text-xs text-gray-500 mb-1">Test Results</span>
                        <span className="text-sm text-gray-700">{componentDetails.testResults}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200 text-center">
                  <TestTube className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No testing history available</p>
                </div>
              )}
            </div>
          )}

          {/* Location History Tab */}
          {activeTab === 'location' && (
            <div className="space-y-6">
              {/* Current Location Card */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Current Location
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {componentDetails.locationType === 'IN_STOCK' ? (
                    <>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 mb-1">Campus</span>
                        <span className="text-sm font-medium text-gray-900">{componentDetails.campus || 'N/A'}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 mb-1">Almirah</span>
                        <span className="text-sm font-medium text-gray-900">{componentDetails.almirah || 'N/A'}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 mb-1">Shelf</span>
                        <span className="text-sm font-medium text-gray-900">{componentDetails.shelf || 'N/A'}</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 col-span-3">Currently installed in a device (see Usage History tab)</p>
                  )}

                  {componentDetails.conditionNotes && (
                    <div className="flex flex-col col-span-3 pt-3 border-t">
                      <span className="text-xs text-gray-500 mb-1">Condition Notes</span>
                      <span className="text-sm text-gray-700">{componentDetails.conditionNotes}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Storage History */}
              {componentDetails.storageHistory && componentDetails.storageHistory.length > 0 ? (
                <StorageHistoryCard storageHistory={componentDetails.storageHistory} />
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200 text-center">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No storage history available</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Remarks Section (shown on all tabs) */}
        {componentDetails.remarks && (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
              General Remarks
            </h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{componentDetails.remarks}</p>
          </div>
        )}

        {/* Audit Log (shown on all tabs) */}
        {componentDetails.auditLog && componentDetails.auditLog.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
              Audit Log
            </h3>
            <div className="space-y-2 text-xs">
              {componentDetails.auditLog.map((log, index) => (
                <div key={index} className="flex justify-between items-start p-2 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium text-gray-900">{log.action}</span>
                    <span className="text-gray-600 ml-2">by {log.user}</span>
                  </div>
                  <span className="text-gray-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
