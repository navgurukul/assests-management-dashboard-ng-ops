'use client';

import React, { useState } from 'react';
import DetailsPage from '@/components/molecules/DetailsPage';
import FormModal from '@/components/molecules/FormModal';
import CustomButton from '@/components/atoms/CustomButton';
import StateHandler from '@/components/atoms/StateHandler';
import MovementTimeline from '@/components/molecules/MovementTimeline';
import MaintenanceHistoryTimeline from '@/components/molecules/MaintenanceHistoryTimeline';
import apiService from '@/app/utils/apiService';
import { toast } from '@/app/utils/toast';
import config from '@/app/config/env.config';
import usePut from '@/app/hooks/query/usePut';
import {
  changeLocationFields,
  changeLocationValidationSchema,
  inspectionLogFields,
  inspectionLogValidationSchema,
  serviceLogFields,
  serviceLogValidationSchema,
  amcRenewalFields,
  amcRenewalValidationSchema,
} from '@/app/config/formConfigs/assetFormConfig';
import { buildSpecLabel } from '@/app/utils/dataTransformers';

export default function AssetDetails({ assetId, assetData, isLoading, isError, error, onBack, refetch }) {
  const [modalAction, setModalAction] = useState(null); // 'REPAIR' | 'SCRAP' | 'IN_STOCK' | 'CHANGE_LOCATION' | null
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutateAsync: moveToStock, isPending: isMovingToStock } = usePut({
    onSuccess: () => {
      toast.success('Asset moved to In Stock successfully.');
      setModalAction(null);
      if (refetch) {
        refetch();
      }
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to move asset to In Stock. Please try again.');
    },
  });
  const toDateTime = (dateStr) => {
    if (!dateStr) return undefined;
    return new Date(dateStr).toISOString();
  };

  const handleStatusUpdate = async (formData) => {
    const id = assetId || assetData?.id;
    setIsSubmitting(true);
    try {
      if (modalAction === 'IN_STOCK') {
        await moveToStock({
          endpoint: config.endpoints.assets.update(id),
          body: {
            status: 'IN_STOCK',
            condition: 'WORKING',
            notes: formData.description,
          },
        });
        return;
      } else if (modalAction === 'REPAIR') {
        await apiService.post(config.endpoints.assets.repair(id), {
          reasonForRepair: formData.description,
        });
        toast.success('Asset moved to repair successfully.');
      } else if (modalAction === 'SCRAP') {
        await apiService.post(config.endpoints.assets.scrap(id), {
          reasonForScrapping: formData.description,
        });
        toast.success('Asset marked as scrap successfully.');
      } else if (modalAction === 'CHANGE_LOCATION') {
        await apiService.put(config.endpoints.assets.update(id), {
          currentLocationId: formData.locationId,
        });
        toast.success('Asset location changed successfully.');
      } else if (modalAction === 'INSPECTION_LOG') {
        const { cost, inspectionDate, nextInspectionDate, ...rest } = formData;
        await apiService.post(config.endpoints.inspectionHistory.create, {
          assetId: id,
          ...rest,
          inspectionDate: toDateTime(inspectionDate),
          nextInspectionDate: toDateTime(nextInspectionDate),
          cost: cost !== '' && cost !== null && cost !== undefined ? Number(cost) : undefined,
        });
        toast.success('Inspection logged successfully.');
      } else if (modalAction === 'SERVICE_LOG') {
        const { cost, billDocument, serviceDate, nextServiceDate, ...rest } = formData;
        await apiService.post(config.endpoints.maintenanceHistory.create, {
          assetId: id,
          ...rest,
          serviceDate: toDateTime(serviceDate),
          nextServiceDate: toDateTime(nextServiceDate),
          cost: cost !== '' && cost !== null && cost !== undefined ? Number(cost) : undefined,
          billId: billDocument?.[0]?.id || undefined,
        });
        toast.success('Service logged successfully.');
      } else if (modalAction === 'AMC_RENEWAL') {
        const { cost, policyDocument, amcStartDate, amcExpiryDate, ...rest } = formData;
        await apiService.post(config.endpoints.insurance.create, {
          assetId: id,
          ...rest,
          amcStartDate: toDateTime(amcStartDate),
          amcExpiryDate: toDateTime(amcExpiryDate),
          cost: cost !== '' && cost !== null && cost !== undefined ? Number(cost) : undefined,
          policyDocumentId: policyDocument?.[0]?.id || undefined,
        });
        toast.success('AMC / Insurance renewal logged successfully.');
      }
      setModalAction(null);
      if (refetch) {
        refetch(); // Refresh asset details after status update
      }
    } catch (error) {
      toast.error(error?.message || 'Failed to update asset. Please try again.');
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

  const inStockFields = [
    {
      name: 'description',
      label: 'Notes',
      type: 'textarea',
      required: true,
      placeholder: 'Add any notes about moving this asset back to stock...',
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

  // Fields for changing asset location (same campus, different location)
  // Must be defined AFTER assetDetails is created
  const getChangeLocationFields = () => {
    return changeLocationFields.map((field) => {
      if (field.name === 'locationId') {
        return {
          ...field,
          apiUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL}/locations/campus/${assetDetails.campus?.id}`,
          queryKey: ['locations', assetDetails.campus?.id],
        };
      }
      return field;
    });
  };

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
  const computedSpecLabel = assetDetails.specLabel || buildSpecLabel(assetDetails);

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
      color: 'theme',
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
      color: 'theme',
      itemsGrid: true,
      items: [
        { label: 'Charger', value: assetDetails.charger ? 'Yes' : 'No', className: assetDetails.charger ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold' },
      ],
    },
    {
      title: 'Notes & Additional Information',
      color: 'theme',
      items: [
        { label: 'Notes', value: assetDetails.notes || 'No notes available' },
      ],
    },
    {
      title: 'MOVEMENT HISTORY',
      color: 'theme',
      content: <MovementTimeline movements={assetDetails.assetMovements || []} />,
    },
    {
      title: 'MAINTENANCE HISTORY',
      color: 'theme',
      content: (
        <MaintenanceHistoryTimeline
          maintenanceHistory={assetDetails.maintenanceHistory || []}
          inspectionHistory={assetDetails.inspectionHistory || []}
          insurance={assetDetails.insurance || []}
        />
      ),
    },
  ];

  // Right column sections (70%) - Larger content cards
  const rightSections = [
    {
      title: 'Asset Information',
      color: 'theme',
      itemsGrid: true, // Enable 2-column grid layout
      items: [
        ...(assetDetails.brand ? [{ label: 'Brand', value: assetDetails.brand }] : []),
        ...(assetDetails.model ? [{ label: 'Model', value: assetDetails.model }] : []),
        ...(assetDetails.processor ? [{ label: 'Processor', value: assetDetails.processor }] : []),
        ...(assetDetails.ramSizeGB ? [{ label: 'RAM', value: `${assetDetails.ramSizeGB} GB` }] : []),
        ...(assetDetails.storageSizeGB ? [{ label: 'Storage', value: `${assetDetails.storageSizeGB} GB` }] : []),
        ...(assetDetails.serialNumber ? [{ label: 'Serial Number', value: assetDetails.serialNumber, className: 'col-span-2' }] : []),
        ...(computedSpecLabel && computedSpecLabel !== 'N/A' ? [{ label: 'Spec Label', value: computedSpecLabel, className: 'col-span-2' }] : []),
        ...(assetDetails.name ? [{ label: 'Name', value: assetDetails.name }] : []),
        ...(assetDetails.material ? [{ label: 'Material', value: assetDetails.material }] : []),
        ...(assetDetails.dimensions ? [{ label: 'Dimensions', value: assetDetails.dimensions }] : []),
        ...(assetDetails.powerRating ? [{ label: 'Power Rating', value: assetDetails.powerRating }] : []),
        ...(assetDetails.vehicleNumber ? [{ label: 'Vehicle Number', value: assetDetails.vehicleNumber }] : []),
        ...(assetDetails.isbn ? [{ label: 'ISBN', value: assetDetails.isbn }] : []),
        ...(assetDetails.capacity ? [{ label: 'Capacity', value: assetDetails.capacity }] : []),
        ...(assetDetails.installationDate ? [{ label: 'Installation Date', value: new Date(assetDetails.installationDate).toLocaleDateString() }] : []),
        ...(assetDetails.contractorVendor ? [{ label: 'Contractor / Vendor', value: assetDetails.contractorVendor }] : []),
        ...(assetDetails.serviceDate ? [{ label: 'Service Date', value: new Date(assetDetails.serviceDate).toLocaleDateString() }] : []),
      ],
    },
    {
      title: 'Purchase Info',
      color: 'theme',
      itemsGrid: true, // Enable 2-column grid layout
      items: [
        { label: 'Source Type', value: formatSourceType(assetDetails.sourceType) || 'N/A' },
        { label: 'Owned By', value: assetDetails.ownedBy?.toUpperCase() || 'N/A' },
        { label: 'Source By', value: assetDetails.sourceBy || 'N/A' },
        { label: 'Purchase Date', value: assetDetails.purchaseDate ? new Date(assetDetails.purchaseDate).toLocaleDateString() : 'N/A' },
        { label: 'Cost', value: assetDetails.cost ? `₹${assetDetails.cost.toLocaleString()}` : 'N/A' },
        { label: 'Purchase Bill', value: assetDetails.purchaseBillDetails?.url ? <a href={assetDetails.purchaseBillDetails.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">{assetDetails.purchaseBillDetails.name}</a> : 'N/A' },
        { label: 'Bill Uploaded By', value: assetDetails.purchaseBillDetails?.uploadedBy ? `${assetDetails.purchaseBillDetails.uploadedBy.firstName} ${assetDetails.purchaseBillDetails.uploadedBy.lastName} (${assetDetails.purchaseBillDetails.uploadedBy.email})` : 'N/A' },
      ],
    },
    {
      title: 'System Information',
      color: 'theme',
      itemsGrid: true, // Enable 2-column grid layout
      items: [
        { label: 'Asset Category', value: assetDetails.assetType?.assetCategory?.name || assetDetails.assetType?.category || 'N/A' },
        { label: 'Campus Code', value: assetDetails.campus?.code || 'N/A' },
        { label: 'Created At', value: assetDetails.createdAt ? new Date(assetDetails.createdAt).toLocaleString() : 'N/A' },
        { label: 'Updated At', value: assetDetails.updatedAt ? new Date(assetDetails.updatedAt).toLocaleString() : 'N/A' },
      ],
    },
  ];

  return (
    <>
      <FormModal
        isOpen={modalAction === 'CHANGE_LOCATION'}
        onClose={() => setModalAction(null)}
        componentName={assetDetails.assetTag}
        actionType="CHANGE_LOCATION"
        fields={getChangeLocationFields()}
        validationSchema={changeLocationValidationSchema}
        onSubmit={handleStatusUpdate}
        isSubmitting={isSubmitting}
        helpText={`Current location: ${assetDetails.location?.name || 'N/A'} (${assetDetails.campus?.name || 'N/A'}) — Select a new location within the same campus.`}
        size="medium"
      />
      <FormModal
        isOpen={modalAction !== null && modalAction !== 'CHANGE_LOCATION'}
        onClose={() => setModalAction(null)}
        componentName={assetDetails.assetTag}
        actionType={modalAction === 'IN_STOCK' ? 'Move to In Stock' : modalAction === 'REPAIR' ? 'Put in Repair' : 'Scrap this Device'}
        fields={modalAction === 'IN_STOCK' ? inStockFields : modalAction === 'REPAIR' ? repairFields : scrapFields}
        onSubmit={handleStatusUpdate}
        isSubmitting={isSubmitting || isMovingToStock}
        helpText={
          modalAction === 'IN_STOCK'
            ? 'Add notes for moving this asset back to In Stock. The status and condition will be updated.'
            : modalAction === 'REPAIR'
            ? 'Provide details about the issue. The asset status will be updated to Under Repair.'
            : 'Provide a reason for scrapping. This will mark the asset as no longer in service.'
        }
      />
      <FormModal
        isOpen={modalAction === 'INSPECTION_LOG'}
        onClose={() => setModalAction(null)}
        componentName={`Log Inspection — ${assetDetails.assetTag}`}
        actionType="Log Inspection"
        fields={inspectionLogFields}
        validationSchema={inspectionLogValidationSchema}
        onSubmit={handleStatusUpdate}
        isSubmitting={isSubmitting}
        size="medium"
      />
      <FormModal
        isOpen={modalAction === 'SERVICE_LOG'}
        onClose={() => setModalAction(null)}
        componentName={`Log Service — ${assetDetails.assetTag}`}
        actionType="Log Service"
        fields={serviceLogFields}
        validationSchema={serviceLogValidationSchema}
        onSubmit={handleStatusUpdate}
        isSubmitting={isSubmitting}
        size="medium"
      />
      <FormModal
        isOpen={modalAction === 'AMC_RENEWAL'}
        onClose={() => setModalAction(null)}
        componentName={`Log AMC Renewal — ${assetDetails.assetTag}`}
        actionType="Log AMC Renewal"
        fields={amcRenewalFields}
        validationSchema={amcRenewalValidationSchema}
        onSubmit={handleStatusUpdate}
        isSubmitting={isSubmitting}
        size="medium"
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
              text="Change Location"
              variant="secondary"
              onClick={() => setModalAction('CHANGE_LOCATION')}
            />
            <CustomButton
              text={assetDetails.status === 'REPAIR' ? 'Move to in Stock' : 'Moved to Repair'}
              variant="warning"
              onClick={() => {
                if (assetDetails.status === 'REPAIR') {
                  setModalAction('IN_STOCK');
                } else {
                  setModalAction('REPAIR');
                }
              }}
            />
            <CustomButton
              text="Mark as Scrap"
              disabled={assetDetails?.ownedBy === 'lnw'}
              variant="danger"
              onClick={() => setModalAction('SCRAP')}
            />
            <CustomButton
              text="Inspection Log"
              variant="info"
              onClick={() => setModalAction('INSPECTION_LOG')}
            />
            <CustomButton
              text="Service Log"
              variant="purple"
              onClick={() => setModalAction('SERVICE_LOG')}
            />
            <CustomButton
              text="AMC Renew"
              variant="success"
              onClick={() => setModalAction('AMC_RENEWAL')}
            />
          </>
        }
      />
    </>
  );
}
