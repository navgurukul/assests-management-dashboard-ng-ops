'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import DetailsPage from '@/components/molecules/DetailsPage';
import CustomButton from '@/components/atoms/CustomButton';
import FormModal from '@/components/molecules/FormModal';
import StateHandler from '@/components/atoms/StateHandler';
import useFetch from '@/app/hooks/query/useFetch';
import config from '@/app/config/env.config';
import post from '@/app/api/post/post';
import { toast } from '@/app/utils/toast';
import { createConsignmentFields } from '@/app/config/formConfigs/consignmentFormConfig';

export default function AllocationDetails({ allocationId, onBack }) {
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Fetch allocation details from API
  const { data, isLoading, isError, error } = useFetch({
    url: config.getApiUrl(config.endpoints.allocations?.details?.(allocationId) || `/allocations/${allocationId}`),
    queryKey: ['allocation', allocationId],
    enabled: !!allocationId,
  });

  // Handle loading, error, and not found states
  if (isLoading || isError || !data || !data.data) {
    return (
      <StateHandler
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={!data || !data.data}
        loadingMessage="Loading allocation details..."
        errorMessage="Error loading allocation details"
        emptyMessage="Allocation not found"
      />
    );
  }

  const allocationDetails = data.data;

  const assetsFromAllocation = Array.isArray(allocationDetails?.assets)
    ? allocationDetails.assets
    : Array.isArray(allocationDetails?.assets?.items)
      ? allocationDetails.assets.items
      : [];
  const singleAssetFallback = allocationDetails?.asset
    ? [{
        id: allocationDetails.asset.id || allocationDetails.assetId,
        assetId: allocationDetails.asset.id || allocationDetails.assetId,
        assetTag: allocationDetails.asset.assetTag,
        assetType: allocationDetails.asset.assetType || allocationDetails.asset.type,
        status: allocationDetails.asset.status,
        brand: allocationDetails.asset.brand,
        model: allocationDetails.asset.model,
      }]
    : [];

  const normalizedAssets = assetsFromAllocation.length > 0 ? assetsFromAllocation : singleAssetFallback;
  const primaryAsset = normalizedAssets[0] || null;

  const normalizedAllocationDetails = {
    ...allocationDetails,
    assets: normalizedAssets,
  };

  const getCampusLabel = (details, campusType) => {
    if (!details) return 'N/A';

    const prefix = campusType === 'source' ? 'source' : 'destination';
    const campus = details?.[`${prefix}Campus`];

    const value =
      (typeof campus === 'object' ? (campus?.campusName || campus?.name) : '') ||
      (typeof campus === 'string' ? campus : '') ||
      details?.[`${prefix}CampusName`] ||
      details?.[`${prefix}Name`] ||
      details?.[prefix];

    const cleanedValue = String(value || '').trim();
    return cleanedValue || 'N/A';
  };

  const sourceCampusDisplay = getCampusLabel(allocationDetails, 'source');
  const destinationCampusDisplay = getCampusLabel(allocationDetails, 'destination');

  const createFieldsForAllocation = createConsignmentFields.map((field) => {
    if (field.type !== 'allocation-consignment-selector') {
      return field;
    }

    return {
      ...field,
      lockAllocationSelection: true,
      lockedAllocationId: String(allocationDetails.id || allocationId),
      lockedAllocationData: normalizedAllocationDetails,
    };
  });

  const handleCreateConsignment = async (formData) => {
    setIsSubmitting(true);
    const loadingToastId = toast.loading('Creating consignment...');

    try {
      if (!formData.allocationId) {
        throw new Error('Please select an allocation');
      }

      if (!formData.selectedAssets || formData.selectedAssets.length === 0) {
        throw new Error('Please select at least one asset');
      }

      const selectedAllocationDetails = formData.allocationDetails || normalizedAllocationDetails;
      const sourceFromModal = getCampusLabel(selectedAllocationDetails, 'source');
      const destinationFromModal = getCampusLabel(selectedAllocationDetails, 'destination');

      const sourceFromDetails = sourceFromModal !== 'N/A' ? sourceFromModal : sourceCampusDisplay;
      const destinationFromDetails = destinationFromModal !== 'N/A' ? destinationFromModal : destinationCampusDisplay;

      const payload = {
        allocationId: formData.allocationId,
        assetIds: formData.selectedAssets.map((asset) => asset.id || asset.assetId),
        status: 'draft',
        source: sourceFromDetails,
        destination: destinationFromDetails,
      };

      await post({
        url: config.getApiUrl(config.endpoints.consignments.create),
        method: 'POST',
        data: payload,
      });

      toast.dismiss(loadingToastId);
      toast.success('Consignment created successfully');
      setIsCreateModalOpen(false);
      router.push('/consignments');
    } catch (error) {
      console.error('Error creating consignment:', error);
      toast.dismiss(loadingToastId);
      toast.error(error?.message || 'Failed to create consignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format status
  const statusFromApi = String(allocationDetails.status || '').toUpperCase();
  const isActive = statusFromApi
    ? statusFromApi === 'ACTIVE'
    : !allocationDetails.endDate;
  const displayStatus = statusFromApi
    ? (allocationDetails.status.charAt(0).toUpperCase() + allocationDetails.status.slice(1).toLowerCase())
    : (isActive ? 'Active' : 'Returned');

  // Format reason
  const formatReason = (reason) => {
    const reasonMap = {
      'JOINER': 'Joiner (New Student/Staff)',
      'REPAIR': 'Repair (Temporary Replacement)',
      'REPLACEMENT': 'Replacement (Permanent Swap)',
      'LOANER': 'Loaner (Temporary Device)',
    };
    return reasonMap[reason] || reason;
  };

  const getStatusColor = () => {
    return isActive ? 'text-green-600' : 'text-gray-600';
  };

  const userDisplayName =
    allocationDetails.user?.name ||
    [allocationDetails.user?.firstName, allocationDetails.user?.lastName].filter(Boolean).join(' ') ||
    allocationDetails.user?.username ||
    allocationDetails.userId ||
    'Unknown';

  // Calculate duration
  const calculateDuration = () => {
    const startDate = allocationDetails.startDate || allocationDetails.createdAt;
    if (!startDate) return 'N/A';

    const start = new Date(startDate);
    if (Number.isNaN(start.getTime())) return 'N/A';

    const end = allocationDetails.endDate ? new Date(allocationDetails.endDate) : new Date();
    if (Number.isNaN(end.getTime())) return 'N/A';

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days`;
  };

  const formatDate = (value, fallback = 'N/A') => {
    if (!value) return fallback;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return fallback;
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (value, fallback = 'N/A') => {
    if (!value) return fallback;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return fallback;
    return date.toLocaleString();
  };

  // Left column sections (30%)
  const leftSections = [
    {
      title: 'Allocation Info',
      items: [
        { label: 'Status', value: displayStatus, className: `font-semibold ${getStatusColor()}` },
        { label: 'Reason', value: formatReason(allocationDetails.allocationReason) },
        { label: 'Source Campus', value: sourceCampusDisplay },
        { label: 'Destination Campus', value: destinationCampusDisplay },
        { label: 'Temporary', value: allocationDetails.isTemporary ? 'Yes' : 'No' },
        { label: 'Duration', value: calculateDuration() },
      ],
    },
    {
      title: 'Asset Information',
      items: [
        { label: 'Asset Tag', value: primaryAsset?.assetTag || allocationDetails.asset?.assetTag || 'N/A' },
        { label: 'Brand', value: primaryAsset?.brand || allocationDetails.asset?.brand || 'N/A' },
        { label: 'Model', value: primaryAsset?.model || allocationDetails.asset?.model || 'N/A' },
      ],
    },
    {
      title: 'User Information',
      items: [
        // { label: 'User ID', value: allocationDetails.userId || 'N/A' },
        { label: 'User Name', value: userDisplayName },
        { label: 'User Email', value: allocationDetails.user?.email || 'N/A' },
        { label: 'User Role', value: allocationDetails.user?.role || 'N/A' },
      ],
    },
  ];

  // Right column sections (70%)
  const rightSections = [
    {
      title: 'Timeline',
      items: [
        {
          label: 'Start Date',
          value: formatDate(allocationDetails.startDate || allocationDetails.createdAt),
        },
        {
          label: 'End Date',
          value: formatDate(allocationDetails.endDate, 'Still Active'),
        },
        {
          label: 'Expected Return Date',
          value: formatDate(allocationDetails.expectedReturnDate, 'Not Applicable'),
        },
      ],
    },
    {
      title: 'Administrative Information',
      items: [
        {
          label: 'Created By',
          value:
            allocationDetails.administrationInformation?.createdBy?.email ||
            allocationDetails.createdByUserId ||
            'N/A',
        },
        {
          label: 'Verified By',
          value:
            allocationDetails.administrationInformation?.verifiedBy?.email ||
            allocationDetails.verifiedByUserId ||
            'Not Yet Verified',
        },
        {
          label: 'Created At',
          value: formatDateTime(allocationDetails.createdAt),
        },
        {
          label: 'Updated At',
          value: formatDateTime(allocationDetails.updatedAt),
        },
      ],
    },
    ...(allocationDetails.ticket
      ? [
          {
            title: 'Ticket Information',
            items: [
              { label: 'Ticket Number', value: allocationDetails.ticket.ticketNumber || 'N/A' },
              { label: 'Ticket Type', value: allocationDetails.ticket.ticketType || 'N/A' },
              { label: 'Priority', value: allocationDetails.ticket.priority || 'N/A' },
              { label: 'Ticket Status', value: allocationDetails.ticket.status || 'N/A' },
              { label: 'Description', value: allocationDetails.ticket.description || 'N/A' },
            ],
          },
        ]
      : []),
    {
      title: 'Notes',
      items: [
        { 
          label: 'Allocation Notes', 
          value: allocationDetails.notes || 'No additional notes provided' 
        },
      ],
    },
  ];

  return (
    <>
      <DetailsPage
        title={`ALLOCATION #${allocationDetails.id}`}
        subtitle={`Status: ${displayStatus} | Assigned to: ${userDisplayName}`}
        subtitleColor={getStatusColor()}
        leftSections={leftSections}
        rightSections={rightSections}
        showTimeline={false}
        onBack={onBack}
        headerActions={
          <CustomButton
            text="Create Consignments"
            variant="primary"
            size="md"
            onClick={() => setIsCreateModalOpen(true)}
          />
        }
      />

      <FormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        actionType="Create"
        fields={createFieldsForAllocation}
        onSubmit={handleCreateConsignment}
        size="large"
        isSubmitting={isSubmitting}
        helpText="Select assets from this allocation to create a new consignment. The allocation is pre-selected and locked."
      />
    </>
  );
}

