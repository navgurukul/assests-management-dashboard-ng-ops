'use client';

import React from 'react';
import DetailsPage from '@/components/molecules/DetailsPage';
import useFetch from '@/app/hooks/query/useFetch';

export default function AssetDetails({ assetId, onBack }) {
  // Fetch asset details from API
  const { data, isLoading, isError, error } = useFetch({
    url: config.getApiUrl(config.endpoints.assets.details(assetId)),
    queryKey: ['asset', assetId],
    enabled: !!assetId,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading asset details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 font-medium">Error loading asset details</p>
          <p className="text-gray-600 mt-2">{error?.message || 'Something went wrong'}</p>
        </div>
      </div>
    );
  }

  if (!data || !data.data) {
    return (
      <div className="p-6">
        <p>Asset not found</p>
      </div>
    );
  }

  const assetDetails = data.data;

  // Map API status to display format
  const formatStatus = (status) => {
    const statusMap = {
      'IN_STOCK': 'In Stock',
      'ALLOCATED': 'Allocated',
      'REPAIR': 'Under Repair',
      'SCRAP': 'Scrap',
      'PARTED_OUT': 'Parted Out',
    };
    return statusMap[status] || status;
  };

  // Map condition to display format
  const formatCondition = (condition) => {
    const conditionMap = {
      'WORKING': 'Working',
      'MINOR_ISSUES': 'Minor Issues',
      'NOT_WORKING': 'Not Working',
    };
    return conditionMap[condition] || condition;
  };

  const displayStatus = formatStatus(assetDetails.status);

  const getStatusColor = () => {
    switch (assetDetails.status) {
      case 'REPAIR':
        return 'text-red-600';
      case 'ALLOCATED':
        return 'text-green-600';
      case 'IN_STOCK':
        return 'text-blue-600';
      case 'SCRAP':
        return 'text-gray-600';
      case 'PARTED_OUT':
        return 'text-orange-600';
      default:
        return 'text-gray-900';
    }
  };

  const getConditionColor = () => {
    switch (assetDetails.condition) {
      case 'WORKING':
        return 'text-green-600';
      case 'MINOR_ISSUES':
        return 'text-yellow-600';
      case 'NOT_WORKING':
        return 'text-red-600';
      default:
        return 'text-gray-900';
    }
  };

  // Left column sections (30%) - Multiple smaller information cards
  const leftSections = [
    {
      title: 'Quick Info',
      items: [
        { label: 'Status', value: displayStatus, className: `font-semibold ${getStatusColor()}` },
        { label: 'Condition', value: formatCondition(assetDetails.condition), className: `font-semibold ${getConditionColor()}` },
        { label: 'Campus', value: assetDetails.campusId || 'N/A' },
        { label: 'Location', value: assetDetails.currentLocationId || 'N/A' },
        { label: 'Source Type', value: assetDetails.sourceType || 'N/A' },
      ],
    },
    {
      title: 'Device Information',
      itemsGrid: true, // Enable 2-column grid layout
      items: [
        { label: 'Brand', value: assetDetails.brand || 'N/A' },
        { label: 'Model', value: assetDetails.model || 'N/A' },
        { label: 'Serial Number', value: assetDetails.serialNumber || 'N/A' },
        { label: 'Spec Label', value: assetDetails.specLabel || 'N/A', className: 'col-span-2' },
      ],
    },
    {
      title: 'Purchase Info',
      items: [
        { label: 'Purchase Date', value: assetDetails.purchaseDate ? new Date(assetDetails.purchaseDate).toLocaleDateString() : 'N/A' },
        { label: 'Cost', value: assetDetails.cost ? `₹${assetDetails.cost}` : 'N/A' },
      ],
    },
  ];

  // Right column sections (70%) - Larger content cards
  const rightSections = [
    {
      title: 'Notes & Additional Information',
      items: [
        { label: 'Notes', value: assetDetails.notes || 'No notes available' },
        { label: 'Asset Type ID', value: assetDetails.assetTypeId || 'N/A' },
      ],
    },
    {
      title: 'System Information',
      items: [
        { label: 'Created At', value: assetDetails.createdAt ? new Date(assetDetails.createdAt).toLocaleString() : 'N/A' },
        { label: 'Updated At', value: assetDetails.updatedAt ? new Date(assetDetails.updatedAt).toLocaleString() : 'N/A' },
      ],
    },
  ];

  return (
    <DetailsPage
      title={`ASSET: ${assetDetails.assetTag}`}
      subtitle={`Status: ${displayStatus} | Condition: ${formatCondition(assetDetails.condition)}`}
      subtitleColor={getStatusColor()}
      leftSections={leftSections}
      rightSections={rightSections}
      showTimeline={false}
      onBack={onBack}
    />
  );
}
