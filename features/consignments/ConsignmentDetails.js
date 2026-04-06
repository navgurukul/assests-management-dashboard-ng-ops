'use client';

import React, { useState } from 'react';
import DetailsPage from '@/components/molecules/DetailsPage';
import StateHandler from '@/components/atoms/StateHandler';
import PdfPreviewModal from '@/components/molecules/PdfPreviewModal';
import CustomButton from '@/components/atoms/CustomButton';
import BulkConsignmentModal from './BulkConsignmentModal';
import { formatConsignmentStatus } from '@/app/utils/dataTransformers';

export default function ConsignmentDetails({ consignmentId, consignmentData, onBack, isLoading, isError, error }) {
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

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

  const sharedHeightClass = 'lg:h-[280px] xl:h-[260px] cursor-default';

  // Left column sections (30%) - Multiple smaller information cards
  const leftSections = [
    {
      title: 'Quick Info',
      color: 'theme',
      className: sharedHeightClass,
      items: [
        { label: 'Status', value: displayStatus, className: `font-semibold ${getStatusColor()}` },
        { label: 'Consignment Code', value: consignment.consignmentCode || consignment.code || 'N/A' },
        { label: 'Total Assets', value: String(totalAssets) },
      ],
    },
    {
      title: 'Assets in Consignment',
      color: 'theme',
      itemsGrid: true, // Render as a 2-column grid
      className: sharedHeightClass,
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
      title: 'Shipping Timeline & Notes',
      color: 'theme',
      itemsGrid: true,
      className: sharedHeightClass,
      items: [
        { label: 'Shipped At', value: consignment.shippedAt ? new Date(consignment.shippedAt).toLocaleDateString() : 'Not shipped yet' },
        { label: 'Est. Delivery', value: consignment.estimatedDeliveryDate ? new Date(consignment.estimatedDeliveryDate).toLocaleDateString() : 'N/A' },
        {
          label: 'Delivered At',
          value: (consignment.receivedAt || consignment.deliveredAt)
            ? new Date(consignment.receivedAt || consignment.deliveredAt).toLocaleDateString()
            : shippingDestinationDisplay,
          className: (consignment.receivedAt || consignment.deliveredAt) ? 'col-span-2 text-green-600 font-semibold' : 'col-span-2 text-gray-500'
        },
        { label: 'Notes', value: consignment.notes || 'No notes available', className: 'col-span-2' },
      ],
    },
  ];

  // Right column sections (70%) - Larger content cards
  const rightSections = [
    {
      title: 'Consignment Details',
      color: 'theme',
      itemsGrid: true, // Enable 2-column grid layout
      className: sharedHeightClass,
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
      title: 'Allocation Information',
      color: 'theme',
      itemsGrid: true,
      className: sharedHeightClass,
      items: [
        { 
          label: 'Allocation Code', 
          value: consignment.allocation?.allocationCode || 
                 (typeof consignment.allocation?.id === 'object' ? consignment.allocation.id?.name || consignment.allocation.id?.id : consignment.allocation?.id) || 
                 'N/A' 
        },
        { 
          label: 'Allocation Type', 
          value: typeof consignment.allocation?.allocationType === 'object' ? consignment.allocation?.allocationType?.name || 'N/A' : consignment.allocation?.allocationType || 'N/A' 
        },
        { 
          label: 'Allocation Status', 
          value: typeof consignment.allocation?.status === 'object' ? consignment.allocation?.status?.name || 'N/A' : consignment.allocation?.status || 'N/A' 
        },
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
      color: 'theme',
      itemsGrid: true,
      className: sharedHeightClass,
      items: [
        { label: 'Consignment ID', value: consignment.id || 'N/A' },
        { label: 'Created By', value: resolveUserDisplay(consignment.createdBy) },
        { label: 'Created At', value: consignment.createdAt ? new Date(consignment.createdAt).toLocaleString() : 'N/A' },
        { label: 'Updated At', value: consignment.updatedAt ? new Date(consignment.updatedAt).toLocaleString() : 'N/A' },
      ],
    },
  ];

  const sourceAddress = consignment.sourceLocation?.campus?.address || 'N/A';
  const destinationAddress = consignment.destinationLocation?.campus?.address || 'N/A';

  return (
    <>
      <DetailsPage
        title="Consignment Details"
        subtitle={`Consignment: ${consignment.consignmentCode || consignment.code || consignment.id}`}
        leftSections={leftSections}
        rightSections={rightSections}
        onBack={onBack}
        headerActions={
          <div className="flex gap-2">
            {destinationName?.toUpperCase() !== 'REMOTE' && (
              <CustomButton
                text="Bulk Consignment"
                variant="primary"
                size="md"
                onClick={() => setShowBulkModal(true)}
              />
            )}
            <CustomButton
              text="Print PDF"
              variant="secondary"
              size="md"
              onClick={() => setShowPdfModal(true)}
            />
          </div>
        }
      />

      <BulkConsignmentModal 
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        consignment={consignment}
      />

      <PdfPreviewModal
        isOpen={showPdfModal}
        onClose={() => setShowPdfModal(false)}
        title="Consignment PDF Preview"
        documentTitle="Consignment Receipt"
        documentCode={consignment.consignmentCode || "\x27N/A\x27"}
        date={consignment.createdAt}
        destinationName={destinationName}
        destinationAddress={destinationAddress}
        sourceName={sourceName}
        sourceAddress={sourceAddress}
        filename={`Consignment_${consignment?.consignmentCode || consignment?.id || "Details"}.pdf`}
      />
    </>
  );
}
