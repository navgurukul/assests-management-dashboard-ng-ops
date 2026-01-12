'use client';

import React from 'react';
import DetailsPage from '@/components/molecules/DetailsPage';

export default function AssetDetails({ assetId, assetData, onBack }) {
  // If no asset data is passed, show error
  if (!assetData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 font-medium">Asset data not available</p>
          <p className="text-gray-600 mt-2">Please navigate from the assets list</p>
        </div>
      </div>
    );
  }

  const assetDetails = assetData;

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

  // Format source type
  const formatSourceType = (sourceType) => {
    const sourceTypeMap = {
      'PURCHASED': 'Purchased',
      'DONATED': 'Donated',
      'LEASED': 'Leased',
    };
    return sourceTypeMap[sourceType] || sourceType;
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
        { label: 'Asset Type', value: assetDetails.assetType?.name || 'N/A' },
        { label: 'Campus', value: assetDetails.campus?.name || 'N/A' },
        { label: 'Location', value: assetDetails.location?.name || 'N/A' },
      ],
    },
    {
      title: 'Device Information',
      itemsGrid: true, // Enable 2-column grid layout
      items: [
        { label: 'Brand', value: assetDetails.brand || 'N/A' },
        { label: 'Model', value: assetDetails.model || 'N/A' },
        { label: 'Processor', value: assetDetails.processor || 'N/A' },
        { label: 'RAM', value: assetDetails.ramSizeGB ? `${assetDetails.ramSizeGB} GB` : 'N/A' },
        { label: 'Storage', value: assetDetails.storageSizeGB ? `${assetDetails.storageSizeGB} GB` : 'N/A' },
        { label: 'Serial Number', value: assetDetails.serialNumber || 'N/A', className: 'col-span-2' },
        { label: 'Spec Label', value: assetDetails.specLabel || 'N/A', className: 'col-span-2' },
      ],
    },
    {
      title: 'Accessories',
      itemsGrid: true,
      items: [
        { label: 'Charger', value: assetDetails.charger ? 'Yes' : 'No', className: assetDetails.charger ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold' },
        { label: 'Bag', value: assetDetails.bag ? 'Yes' : 'No', className: assetDetails.bag ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold' },
      ],
    },
    {
      title: 'Purchase Info',
      items: [
        { label: 'Source Type', value: formatSourceType(assetDetails.sourceType) || 'N/A' },
        { label: 'Owned By', value: assetDetails.ownedBy || 'N/A' },
        { label: 'Source By', value: assetDetails.sourceBy || 'N/A' },
        { label: 'Purchase Date', value: assetDetails.purchaseDate ? new Date(assetDetails.purchaseDate).toLocaleDateString() : 'N/A' },
        { label: 'Cost', value: assetDetails.cost ? `₹${assetDetails.cost.toLocaleString()}` : 'N/A' },
      ],
    },
  ];

  // Right column sections (70%) - Larger content cards
  const rightSections = [
    {
      title: 'Notes & Additional Information',
      items: [
        { label: 'Notes', value: assetDetails.notes || 'No notes available' },
      ],
    },
    {
      title: 'System Information',
      items: [
        { label: 'Asset ID', value: assetDetails.id || 'N/A' },
        { label: 'Asset Type Category', value: assetDetails.assetType?.category || 'N/A' },
        { label: 'Campus Code', value: assetDetails.campus?.code || 'N/A' },
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
