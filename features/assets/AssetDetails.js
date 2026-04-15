'use client';

import React, { useState } from 'react';
import DetailsPage from '@/components/molecules/DetailsPage';
import FormModal from '@/components/molecules/FormModal';
import CustomButton from '@/components/atoms/CustomButton';
import StateHandler from '@/components/atoms/StateHandler';
import MovementTimeline from '@/components/molecules/MovementTimeline';
import apiService from '@/app/utils/apiService';
import { toast } from '@/app/utils/toast';
import config from '@/app/config/env.config';

export default function AssetDetails({ assetId, assetData, isLoading, isError, error, onBack }) {
  const [modalAction, setModalAction] = useState(null); // 'REPAIR' | 'SCRAP' | null
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStatusUpdate = async (formData) => {
    const id = assetId || assetData?.id;
    setIsSubmitting(true);
    try {
      if (modalAction === 'REPAIR') {
        await apiService.post(config.endpoints.assets.repair(id), {
          reasonForRepair: formData.description,
        });
        toast.success('Asset moved to repair successfully.');
      } else if (modalAction === 'SCRAP') {
        await apiService.post(config.endpoints.assets.scrap(id), {
          reasonForScrapping: formData.description,
        });
        toast.success('Asset marked as scrap successfully.');
      }
      setModalAction(null);
    } catch (error) {
      toast.error(error?.message || 'Failed to update asset status. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const repairFields = [
    {
      name: 'description',
      label: 'Reason for Repair',
      type: 'textarea',
      required: true,
      placeholder: 'Describe the issue or reason this asset needs repair...',
    },
  ];

  const scrapFields = [
    {
      name: 'description',
      label: 'Reason for Scrapping',
      type: 'textarea',
      required: true,
      placeholder: 'Describe why this asset is being scrapped...',
    },
  ];

  // If no asset data is available, show loading/error state
  if (isLoading || isError || !assetData) {
    return (
      <StateHandler
        isLoading={isLoading}
        isError={isError}
        error={error}
        loadingMessage="Loading asset details..."
        errorMessage="Failed to load asset details"
      />
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
      title: 'Accessories',
      itemsGrid: true,
      items: [
        { label: 'Charger', value: assetDetails.charger ? 'Yes' : 'No', className: assetDetails.charger ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold' },
        { label: 'Bag', value: assetDetails.bag ? 'Yes' : 'No', className: assetDetails.bag ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold' },
      ],
    },
    {
      title: 'Notes & Additional Information',
      items: [
        { label: 'Notes', value: assetDetails.notes || 'No notes available' },
      ],
    },
    {
      title: 'MOVEMENT HISTORY',
      color: 'theme',
      content: <MovementTimeline movements={assetDetails.assetMovements || []} />,
    },
  ];

  // Right column sections (70%) - Larger content cards
  const rightSections = [
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
      title: 'Purchase Info',
      itemsGrid: true, // Enable 2-column grid layout
      items: [
        { label: 'Source Type', value: formatSourceType(assetDetails.sourceType) || 'N/A' },
        { label: 'Owned By', value: assetDetails.ownedBy || 'N/A' },
        { label: 'Source By', value: assetDetails.sourceBy || 'N/A' },
        { label: 'Purchase Date', value: assetDetails.purchaseDate ? new Date(assetDetails.purchaseDate).toLocaleDateString() : 'N/A' },
        { label: 'Cost', value: assetDetails.cost ? `₹${assetDetails.cost.toLocaleString()}` : 'N/A' },
      ],
    },
    {
      title: 'System Information',
      itemsGrid: true, // Enable 2-column grid layout
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
    <>
      <FormModal
        isOpen={modalAction !== null}
        onClose={() => setModalAction(null)}
        componentName={assetDetails.assetTag}
        actionType={modalAction === 'REPAIR' ? 'Put in Repair' : 'Scrap this Device'}
        fields={modalAction === 'REPAIR' ? repairFields : scrapFields}
        onSubmit={handleStatusUpdate}
        isSubmitting={isSubmitting}
        helpText={
          modalAction === 'REPAIR'
            ? 'Provide details about the issue. The asset status will be updated to Under Repair.'
            : 'Provide a reason for scrapping. This will mark the asset as no longer in service.'
        }
      />
      <DetailsPage
        title={`ASSET: ${assetDetails.assetTag}`}
        subtitle={`Status: ${displayStatus} | Condition: ${formatCondition(assetDetails.condition)}`}
        subtitleColor={getStatusColor()}
        leftSections={leftSections}
        rightSections={rightSections}
        showTimeline={false}
        onBack={onBack}
        headerActions={
          <>
            <CustomButton
              text="Moved to Repair"
              variant="warning"
              onClick={() => setModalAction('REPAIR')}
            />
            <CustomButton
              text="Mark as Scrap"
              variant="danger"
              onClick={() => setModalAction('SCRAP')}
            />
          </>
        }
      />
    </>
  );
}
