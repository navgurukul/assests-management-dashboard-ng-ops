'use client';

import React from 'react';
import DetailsPage from '@/components/molecules/DetailsPage';
import useFetch from '@/app/hooks/query/useFetch';

export default function AssetDetails({ assetId, onBack }) {
  // Fetch asset details from API
  const { data, isLoading, isError, error } = useFetch({
    url: `https://asset-dashboard.navgurukul.org/api/assets/${assetId}`,
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
      'REPAIR': 'Repair',
      'SCRAP': 'Scrap',
    };
    return statusMap[status] || status;
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
        { label: 'Condition', value: assetDetails.condition || 'N/A' },
        { label: 'Campus', value: assetDetails.campusId || 'N/A' },
        { label: 'Location', value: assetDetails.currentLocationId || 'N/A' },
        { label: 'Source Type', value: assetDetails.sourceType || 'N/A' },
      ],
    },
    {
      title: 'Specs',
      itemsGrid: true, // Enable 2-column grid layout
      items: [
        { label: 'Brand', value: assetDetails.brand || 'N/A' },
        { label: 'Model', value: assetDetails.model || 'N/A' },
        { label: 'Processor', value: assetDetails.processor || 'N/A' },
        { label: 'RAM', value: assetDetails.ramSizeGB ? `${assetDetails.ramSizeGB} GB` : 'N/A' },
        { label: 'Storage', value: assetDetails.storageSizeGB ? `${assetDetails.storageSizeGB} GB` : 'N/A' },
        { label: 'Serial Number', value: assetDetails.serialNumber || 'N/A' },
      ],
    },
    {
      title: 'Purchase Info',
      items: [
        { label: 'Purchase Date', value: assetDetails.purchaseDate ? new Date(assetDetails.purchaseDate).toLocaleDateString() : 'N/A' },
        { label: 'Cost', value: assetDetails.cost ? `₹${assetDetails.cost}` : 'N/A' },
        { label: 'Charger', value: assetDetails.charger ? 'Yes' : 'No' },
        { label: 'Bag', value: assetDetails.bag ? 'Yes' : 'No' },
      ],
    },
  ];

  // Right column sections (70%) - Larger content cards
  const rightSections = [
    {
      title: 'Additional Information',
      items: [
        { label: 'Asset Type ID', value: assetDetails.assetTypeId || 'N/A' },
        { label: 'Spec Label', value: assetDetails.specLabel || 'N/A' },
        { label: 'Created At', value: new Date(assetDetails.createdAt).toLocaleString() },
        { label: 'Updated At', value: new Date(assetDetails.updatedAt).toLocaleString() },
      ],
    },
    {
      title: 'Notes',
      items: [
        { label: 'Notes', value: assetDetails.notes || 'No notes available' },
      ],
    },
  ];

  return (
    <DetailsPage
      title={`ASSET: ${assetDetails.assetTag}`}
      subtitle={`Status: ${displayStatus} | Condition: ${assetDetails.condition || 'N/A'}`}
      subtitleColor={getStatusColor()}
      leftSections={leftSections}
      rightSections={rightSections}
      showTimeline={false}
      onBack={onBack}
    />
  );
}
