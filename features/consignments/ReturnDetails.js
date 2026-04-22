'use client';

import React from 'react';
import DetailsPage from '@/components/molecules/DetailsPage';
import StateHandler from '@/components/atoms/StateHandler';
import StatusChip from '@/components/atoms/StatusChip';

export default function ReturnDetails({ returnData, onBack, isLoading, isError, error }) {
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const sharedHeightClass = 'lg:h-[280px] xl:h-[260px] cursor-default';

  const leftSections = [
    {
      title: 'Quick Info',
      color: 'theme',
      className: sharedHeightClass,
      items: [
        { label: 'Status', value: <StatusChip value={returnItem.status || 'N/A'} /> },
        { label: 'Asset Tag', value: returnItem.assetTag || 'N/A' },
        { label: 'Consignment Code', value: returnItem.consignmentCode || 'N/A' },
      ],
    },
    {
      title: 'Courier Information',
      color: 'theme',
      itemsGrid: true,
      className: sharedHeightClass,
      items: [
        { label: 'Courier Partner', value: returnItem.courierPartnerName || 'N/A' },
        { label: 'Tracking Number', value: returnItem.trackingNumber || 'N/A' },
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
  ];

  const rightSections = [
    {
      title: 'Return Details',
      color: 'theme',
      itemsGrid: true,
      className: sharedHeightClass,
      items: [
        { label: 'Return Notes', value: returnItem.returnNotes || 'N/A' },
        { label: 'Return By', value: returnItem.returnByUserEmail || 'N/A' },
        { label: 'Manager Email', value: returnItem.managerEmail || 'N/A' },
        { label: 'Campus IT Coordinator', value: returnItem.campusITCoordinatorEmail || 'N/A' },
      ],
    },
    {
      title: 'System Information',
      color: 'theme',
      itemsGrid: true,
      className: sharedHeightClass,
      items: [
        { label: 'Return ID', value: returnItem.id || 'N/A' },
        { label: 'Consignment ID', value: returnItem.consignmentId || 'N/A' },
        { label: 'Asset ID', value: returnItem.assetId || 'N/A' },
        { label: 'Stored Campus ID', value: returnItem.storedCampusId || 'N/A' },
        { label: 'Created At', value: formatDateTime(returnItem.createdAt) },
      ],
    },
  ];

  return (
    <DetailsPage
      title="Return Details"
      subtitle={`Return: ${returnItem.consignmentCode || returnItem.assetTag || returnItem.id}`}
      leftSections={leftSections}
      rightSections={rightSections}
      onBack={onBack}
    />
  );
}