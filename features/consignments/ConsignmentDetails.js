'use client';

import React from 'react';
import DetailsPage from '@/components/molecules/DetailsPage';

export default function ConsignmentDetails({ consignmentId, consignmentData, onBack }) {
  // If no consignment data is passed, show error
  if (!consignmentData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 font-medium">Consignment data not available</p>
          <p className="text-gray-600 mt-2">Please navigate from the consignments list</p>
        </div>
      </div>
    );
  }

  const consignment = consignmentData;

  // Map API status to display format - Only draft, dispatched, and delivered are supported
  const formatStatus = (status) => {
    const statusMap = {
      'draft': 'Draft',
      'dispatched': 'Dispatched',
      'delivered': 'Delivered',
    };
    return statusMap[status] || status;
  };

  const displayStatus = formatStatus(consignment.status);

  const getStatusColor = () => {
    switch (consignment.status) {
      case 'draft':
        return 'text-gray-600';
      case 'dispatched':
        return 'text-blue-600';
      case 'delivered':
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
        { label: 'Allocation', value: consignment.allocation?.allocationCode || consignment.allocationCode || 'N/A' },
        { label: 'Total Assets', value: consignment.assets?.length || consignment.assetCount || '0' },
      ],
    },
    {
      title: 'Shipping Timeline',
      items: [
        { label: 'Shipped At', value: consignment.shippedAt ? new Date(consignment.shippedAt).toLocaleDateString() : 'Not shipped yet' },
        { label: 'Est. Delivery', value: consignment.estimatedDeliveryDate ? new Date(consignment.estimatedDeliveryDate).toLocaleDateString() : 'N/A' },
        { label: 'Delivered At', value: consignment.deliveredAt ? new Date(consignment.deliveredAt).toLocaleDateString() : 'Not delivered yet', className: consignment.deliveredAt ? 'text-green-600 font-semibold' : 'text-gray-500' },
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
        { label: 'Source', value: consignment.source || consignment.allocation?.sourceCampus?.name || 'N/A' },
        { label: 'Destination', value: consignment.destination || consignment.allocation?.destinationCampus?.name || 'N/A' },
        { label: 'Courier Service', value: consignment.courierService?.name || consignment.courierServiceName || 'N/A' },
        { label: 'Tracking ID', value: consignment.trackingId || 'N/A' },
        { 
          label: 'Tracking Link', 
          value: consignment.trackingLink ? (
            <a 
              href={consignment.trackingLink} 
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
        value: asset.assetTag || asset.serialNumber || asset.id || 'Unknown',
        className: 'text-blue-600 font-medium'
      })) : [{ label: 'No assets', value: 'No assets found in this consignment' }],
    },
    {
      title: 'Allocation Information',
      itemsGrid: true,
      items: [
        { label: 'Allocation Code', value: consignment.allocation?.allocationCode || 'N/A' },
        { label: 'Allocation Type', value: consignment.allocation?.allocationType || 'N/A' },
        { label: 'Allocation Status', value: consignment.allocation?.status || 'N/A' },
        { label: 'User Email', value: consignment.allocation?.userEmail || 'N/A' },
      ],
    },
    {
      title: 'System Information',
      itemsGrid: true,
      items: [
        { label: 'Consignment ID', value: consignment.id || 'N/A' },
        { label: 'Created By', value: consignment.createdBy?.name || consignment.createdBy || 'N/A' },
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
      // Optional: Add action buttons
      actions={[
        {
          label: 'Update Status',
          onClick: () => console.log('Update status clicked'),
          variant: 'primary',
          show: consignment.status !== 'delivered',
        },
        {
          label: 'Print Label',
          onClick: () => console.log('Print label clicked'),
          variant: 'secondary',
        },
      ]}
    />
  );
}
