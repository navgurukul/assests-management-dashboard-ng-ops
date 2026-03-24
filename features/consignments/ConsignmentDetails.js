'use client';

import React from 'react';
import DetailsPage from '@/components/molecules/DetailsPage';
import StateHandler from '@/components/atoms/StateHandler';
import { formatConsignmentStatus } from '@/app/utils/dataTransformers';

export default function ConsignmentDetails({ consignmentId, consignmentData, onBack, isLoading, isError, error }) {
  if (isLoading) {
    return (
      <StateHandler
        isLoading={true}
        loadingMessage="Loading consignment details..."
      />
    );
  }

  if (isError) {
    return (
      <StateHandler
        isError={true}
        error={error}
        errorMessage="Error loading consignment details"
      />
    );
  }

  // If no consignment data is passed, show empty state
  if (!consignmentData) {
    return (
      <StateHandler
        isEmpty={true}
        emptyMessage="Consignment not found"
      />
    );
  }

  const consignment = consignmentData;

  const displayStatus = formatConsignmentStatus(consignment.status);

  const resolveLocationName = (location) => {
    if (!location) return 'N/A';

    if (typeof location === 'string') {
      const trimmed = location.trim();
      return trimmed || 'N/A';
    }

    return (
      location.name ||
      location.campusName ||
      location.campus?.name ||
      location.location?.name ||
      location.destination?.name ||
      'N/A'
    );
  };

  const resolveLocationDisplay = (location, fallbackValue) => {
    if (!location) return resolveLocationName(fallbackValue);

    if (typeof location === 'string') {
      return resolveLocationName(location);
    }

    const campusName = location.campus?.name || location.campusName || '';

    return campusName || resolveLocationName(fallbackValue);
  };

  const sourceName = resolveLocationDisplay(
    consignment.sourceLocation,
    consignment.source || consignment.allocation?.sourceCampus
  );

  const destinationName = resolveLocationDisplay(
    consignment.destinationLocation,
    consignment.destination || consignment.allocation?.destinationCampus
  );

  const trackingLink = consignment.link || consignment.trackingLink;
  const trackingId = consignment.trackingNumber || consignment.trackingId;
  const courierServiceName = consignment.courierName || consignment.courierService?.name || consignment.courierServiceName;
  const totalAssets = consignment.assetCount ?? consignment.assets?.length ?? 0;

  const resolveUserDisplay = (userValue) => {
    if (!userValue) return 'N/A';
    if (typeof userValue === 'string') return userValue;

    const fullName = `${userValue.firstName || ''} ${userValue.lastName || ''}`.trim();
    return (
      userValue.name ||
      fullName ||
      userValue.email ||
      userValue.username ||
      userValue.id ||
      'N/A'
    );
  };

  const resolveUserEmail = (userValue) => {
    if (!userValue) return 'N/A';
    if (typeof userValue === 'string') return userValue;
    return userValue.email || resolveUserDisplay(userValue);
  };

  const resolveAddressDisplay = (addressValue) => {
    if (!addressValue) return '';
    if (typeof addressValue === 'string') {
      const trimmed = addressValue.trim();
      return trimmed;
    }

    if (typeof addressValue === 'object') {
      const line1 = addressValue.line1 || addressValue.addressLine1 || '';
      const line2 = addressValue.line2 || addressValue.addressLine2 || '';
      const city = addressValue.city || '';
      const state = addressValue.state || '';
      const postalCode = addressValue.postalCode || addressValue.pincode || '';

      const combined = [line1, line2, city, state, postalCode]
        .map((part) => String(part || '').trim())
        .filter(Boolean)
        .join(', ');

      if (combined) return combined;
    }

    return '';
  };

  const shippingDestinationDisplay =
    resolveAddressDisplay(consignment.allocation?.userAddress) ||
    consignment.destinationLocation?.campus?.name ||
    destinationName ||
    'N/A';

  const getStatusColor = () => {
    switch ((consignment.status || '').toUpperCase()) {
      case 'DRAFT':
        return 'text-gray-600';
      case 'DISPATCHED':
        return 'text-blue-600';
      case 'DELIVERED':
        return 'text-green-600';
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
        { label: 'Consignment Code', value: consignment.consignmentCode || consignment.code || 'N/A' },
        { label: 'Allocation', value: consignment.allocation?.id || consignment.allocationId || 'N/A' },
        { label: 'Total Assets', value: String(totalAssets) },
      ],
    },
    {
      title: 'Shipping Timeline',
      items: [
        { label: 'Shipped At', value: consignment.shippedAt ? new Date(consignment.shippedAt).toLocaleDateString() : 'Not shipped yet' },
        { label: 'Est. Delivery', value: consignment.estimatedDeliveryDate ? new Date(consignment.estimatedDeliveryDate).toLocaleDateString() : 'N/A' },
        {
          label: 'Delivered At',
          value: (consignment.receivedAt || consignment.deliveredAt)
            ? new Date(consignment.receivedAt || consignment.deliveredAt).toLocaleDateString()
            : shippingDestinationDisplay,
          className: (consignment.receivedAt || consignment.deliveredAt) ? 'text-green-600 font-semibold' : 'text-gray-500'
        },
      ],
    },
    {
      title: 'Notes',
      items: [
        { label: 'Notes', value: consignment.notes || 'No notes available' },
      ],
    },
  ];

  // Right column sections (70%) - Larger content cards
  const rightSections = [
    {
      title: 'Consignment Details',
      itemsGrid: true, // Enable 2-column grid layout
      items: [
        { label: 'Source', value: sourceName },
        { label: 'Destination', value: destinationName },
        { label: 'Courier Service', value: courierServiceName || 'N/A' },
        { label: 'Tracking ID', value: trackingId || 'N/A' },
        { 
          label: 'Tracking Link', 
          value: trackingLink ? (
            <a 
              href={trackingLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Track Shipment
            </a>
          ) : 'N/A',
          className: 'col-span-2'
        },
      ],
    },
    {
      title: 'Assets in Consignment',
      itemsList: true, // Render as a list instead of grid
      items: consignment.assets?.length > 0 ? consignment.assets.map((asset, index) => ({
        label: `Asset ${index + 1}`,
        value:
          asset?.asset?.assetTag ||
          asset?.assetTag ||
          asset?.asset?.serialNumber ||
          asset?.serialNumber ||
          asset?.asset?.id ||
          asset?.assetId ||
          asset?.id ||
          'Unknown',
        className: 'text-blue-600 font-medium'
      })) : [{ label: 'No assets', value: 'No assets found in this consignment' }],
    },
    {
      title: 'Allocation Information',
      itemsGrid: true,
      items: [
        { label: 'Allocation Code', value: consignment.allocation?.id || 'N/A' },
        { label: 'Allocation Type', value: consignment.allocation?.allocationType || 'N/A' },
        { label: 'Allocation Status', value: consignment.allocation?.status || 'N/A' },
        {
          label: 'User Email',
          value: resolveUserEmail(
            consignment.allocation?.requestRaisedBy ||
            consignment.allocation?.userEmail ||
            consignment.allocation?.user
          ),
        },
      ],
    },
    {
      title: 'System Information',
      itemsGrid: true,
      items: [
        { label: 'Consignment ID', value: consignment.id || 'N/A' },
        { label: 'Created By', value: resolveUserDisplay(consignment.createdBy) },
        { label: 'Created At', value: consignment.createdAt ? new Date(consignment.createdAt).toLocaleString() : 'N/A' },
        { label: 'Updated At', value: consignment.updatedAt ? new Date(consignment.updatedAt).toLocaleString() : 'N/A' },
      ],
    },
  ];

  return (
    <DetailsPage
      title="Consignment Details"
      subtitle={`Consignment: ${consignment.consignmentCode || consignment.code || consignment.id}`}
      leftSections={leftSections}
      rightSections={rightSections}
      onBack={onBack}
    />
  );
}
