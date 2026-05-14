'use client';

import React from 'react';
import DetailsPage from '@/components/molecules/DetailsPage';
import StateHandler from '@/components/atoms/StateHandler';
import StatusChip from '@/components/atoms/StatusChip';

export default function ReturnDetails({ returnId, returnData, onBack, isLoading, isError, error }) {
  if (isLoading) {
    return (
      <StateHandler
        isLoading={true}
        loadingMessage="Loading return details..."
      />
    );
  }

  if (isError) {
    return (
      <StateHandler
        isError={true}
        error={error}
        errorMessage="Error loading return details"
      />
    );
  }

  if (!returnData) {
    return (
      <StateHandler
        isEmpty={true}
        emptyMessage="Return record not found"
      />
    );
  }

  const returnItem = returnData?.data || returnData;
  const asset = returnItem?.asset || {};
  const consignment = returnItem?.consignment || {};
  const storedCampus = returnItem?.storedCampus || {};
  const returnByUser = returnItem?.returnByUser || {};

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const sharedHeightClass = 'lg:h-[280px] xl:h-[260px] cursor-default';

  const returnByUserName = `${returnByUser.firstName || ''} ${returnByUser.lastName || ''}`.trim() || returnByUser.email || 'N/A';

  const leftSections = [
    {
      title: 'Quick Info',
      color: 'theme',
      className: sharedHeightClass,
      items: [
        { label: 'Status', value: <StatusChip value={returnItem.status || 'N/A'} /> },
        { label: 'Consignment Code', value: returnItem.consignmentCode || 'N/A' },
        { label: 'Asset Tag', value: asset.tag || 'N/A' },
        { label: 'Previous Asset Tag', value: asset.previousAssetTag || 'N/A' },
        { label: 'Asset Type', value: asset.assetTypeName || 'N/A' },
      ],
    },
    {
      title: 'Asset Information',
      color: 'theme',
      itemsGrid: true,
      className: sharedHeightClass,
      items: [
        { label: 'Asset Brand', value: asset.brand || 'N/A' },
        { label: 'Model', value: asset.model || 'N/A' },
        { label: 'Serial Number', value: asset.serialNumber || 'N/A' },
        { label: 'Storage', value: asset.storageSizeGB ? `${asset.storageSizeGB}GB` : 'N/A' },
        { label: 'Condition', value: asset.condition || 'N/A' },
        { label: 'Asset Status', value: asset.status || 'N/A' },
      ],
    },
    {
      title: 'Stored Campus Information',
      color: 'theme',
      itemsGrid: true,
      className: sharedHeightClass,
      items: [
        { label: 'Campus Name', value: storedCampus.campusName || 'N/A' },
        { label: 'Campus Code', value: storedCampus.campusCode || 'N/A' },
        { label: 'State', value: storedCampus.state || 'N/A' },
        { label: 'Address', value: storedCampus.address || 'N/A' },
      ],
    },
  ];

  const rightSections = [
    {
      title: 'Return Information',
      color: 'theme',
      itemsGrid: true,
      className: sharedHeightClass,
      items: [
        { label: 'Return By', value: returnByUserName },
        { label: 'Return By Email', value: returnByUser.email || 'N/A' },
        { label: 'Return Notes', value: returnItem.returnNotes || 'N/A' },
        { label: 'Exact Address', value: returnItem.exactAddress || 'N/A' },
        { label: 'Manager Email', value: returnItem.managerEmail || 'N/A' },
        { label: 'Campus IT Coordinator', value: returnItem.campusITCoordinatorEmail || 'N/A' },
      ],
    },
    {
      title: 'Shipping & Tracking',
      color: 'theme',
      itemsGrid: true,
      className: sharedHeightClass,
      items: [
        { label: 'Shipped Through', value: returnItem.courierPartnerName || 'N/A' },
        { label: 'Tracking ID', value: returnItem.trackingNumber || 'N/A' },
        { label: 'Expected Delivery', value: formatDate(returnItem.expectedDeliveryDate) },
        {
          label: 'Receipt',
          value: returnItem.receiptUrl ? (
            <a
              href={returnItem.receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              View Receipt
            </a>
          ) : 'N/A',
        },
      ],
    },
    {
      title: 'Consignment Details',
      color: 'theme',
      itemsGrid: true,
      className: sharedHeightClass,
      items: [
        { label: 'Consignment Status', value: consignment.status || 'N/A' },
        { label: 'Shipped At', value: formatDate(consignment.shippedAt) },
        { label: 'Received At', value: formatDate(consignment.receivedAt) },
        { label: 'Est. Delivery Date', value: formatDate(consignment.estimatedDeliveryDate) },
        { label: 'Tracking Link', 
          value: consignment.trackingLink ? (
            <a
              href={consignment.trackingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Track Shipment
            </a>
          ) : 'N/A'
        },
        { label: 'Issue Type', value: consignment.issueType || 'N/A' },
      ],
    },
    {
      title: 'System Information',
      color: 'theme',
      itemsGrid: true,
      className: sharedHeightClass,
      items: [
        { label: 'Created At', value: formatDateTime(returnItem.createdAt) },
        { label: 'Updated At', value: formatDateTime(returnItem.updatedAt) },
      ],
    },
  ];

  return (
    <DetailsPage
      title="Return Details"
      subtitle={`Return: ${returnItem.consignmentCode || asset.tag || returnItem.id}`}
      leftSections={leftSections}
      rightSections={rightSections}
      onBack={onBack}
    />
  );
}