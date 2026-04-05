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

  const userDisplayName =
    allocationDetails.user?.name ||
    [allocationDetails.user?.firstName, allocationDetails.user?.lastName].filter(Boolean).join(' ') ||
    allocationDetails.user?.username ||
    allocationDetails.userId ||
    'Unknown';

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

  const normalizedAllocationDetails = {
    ...allocationDetails,
    assets: normalizedAssets,
    assigneeName: userDisplayName,
    sourceCampusDisplay,
    destinationCampusDisplay,
  };

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

  const formatBoolean = (value) => {
    if (value === true) return 'Yes';
    if (value === false) return 'No';
    return 'Unknown';
  };

  const formatAssetStatus = (status) => {
    if (!status) return 'N/A';
    const value = String(status);
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  };

  const getStatusColor = () => {
    return isActive ? 'text-green-600' : 'text-gray-600';
  };

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

  const assetCardsSection = {
    title: 'Assets in Allocation',
    color: 'theme',
    span: 2,
    content: normalizedAssets.length === 0 ? (
      <p className="text-xs text-gray-600">No assets linked to this allocation.</p>
    ) : (
      <div className="grid grid-cols-1 gap-2">
        {normalizedAssets.map((asset) => {
          const key = asset.id || asset.assetId || asset.assetTag;
          return (
            <div
              key={key}
              className="border border-gray-100 rounded-lg bg-white p-2 flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-500">ASSET TAG</p>
                  <p className="text-xs font-semibold text-gray-900">{asset.assetTag || 'N/A'}</p>
                </div>
                <span className="px-2 py-1 text-[10px] font-semibold rounded-full bg-blue-50 text-blue-700">
                  {String(formatAssetStatus(asset.status || allocationDetails.status)).toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-xs text-gray-800">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-500">BRAND</p>
                  <p className="font-medium">{asset.brand || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-500">MODEL</p>
                  <p className="font-medium">{asset.model || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-500">SPEC LABEL</p>
                  <p className="font-medium">{asset.specLabel || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-500">PROCESSOR</p>
                  <p className="font-medium">{asset.processor || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-500">RAM</p>
                  <p className="font-medium">{asset.ramSizeGB ? `${asset.ramSizeGB} GB` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-500">STORAGE</p>
                  <p className="font-medium">{asset.storageSizeGB ? `${asset.storageSizeGB} GB` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-500">CONDITION</p>
                  <p className="font-medium">{formatAssetStatus(asset.condition)}</p>
                </div>
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-500">SOURCE TYPE</p>
                  <p className="font-medium">{formatAssetStatus(asset.sourceType)}</p>
                </div>
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-500">CHARGER</p>
                  <p className="font-medium">{formatBoolean(asset.charger)}</p>
                </div>
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-500">BAG</p>
                  <p className="font-medium">{formatBoolean(asset.bag)}</p>
                </div>
                <div className="col-span-full">
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-500">SERIAL NUMBER</p>
                  <p className="font-medium break-all">{asset.serialNumber || 'N/A'}</p>
                </div>
                {asset.notes && (
                  <div className="col-span-full">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-500">NOTES</p>
                    <p className="text-xs text-gray-700 whitespace-pre-line">{asset.notes}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    ),
  };

  const sharedHeightClass = 'lg:h-[280px] xl:h-[260px] cursor-default';

  // Left column sections (30%)
  const leftSections = [
    {
      title: 'Allocation Info',
      color: 'theme',
      itemsGrid: true,
      className: sharedHeightClass,
      items: [
        { label: 'Status', value: displayStatus, className: `font-semibold ${getStatusColor()}` },
        { label: 'Reason', value: formatReason(allocationDetails.allocationReason) },
        { label: 'Source Campus', value: sourceCampusDisplay },
        { label: 'Destination Campus', value: destinationCampusDisplay },
        { label: 'Temporary', value: allocationDetails.isTemporary ? 'Yes' : 'No' },
        { label: 'Duration', value: calculateDuration() },
        { label: 'Allocation Notes', value: allocationDetails.notes || 'No additional notes provided', className: 'col-span-2' },
      ],
    },
     {
      title: 'Timeline',
      color: 'theme',
      itemsGrid: true,
      className: sharedHeightClass,
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
      color: 'theme',
      itemsGrid: true,
      className: sharedHeightClass,
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
  ];

  // Right column sections (70%)
  const rightSections = [
    ...(allocationDetails.ticket
      ? [
          {
            title: 'Ticket Information',
            color: 'theme',
            span: 2,
            itemsGrid: true,
            className: sharedHeightClass,
            items: [
              { label: 'Ticket Number', value: allocationDetails.ticket.ticketNumber || 'N/A' },
              { label: 'Ticket Type', value: allocationDetails.ticket.ticketType || 'N/A' },
              { label: 'Priority', value: allocationDetails.ticket.priority || 'N/A' },
              { label: 'Ticket Status', value: allocationDetails.ticket.status || 'N/A' },
              { label: 'Description', value: allocationDetails.ticket.description || 'N/A', className: 'col-span-2 line-clamp-2 break-all' },
            ],
          },
        ]
      : []),
    assetCardsSection,
  ];

  return (
    <>
      <DetailsPage
        title={`ALLOCATION #${allocationDetails.id}`}
        subtitle={`Status: ${displayStatus} | Assigned to: ${userDisplayName}`}
        subtitleColor={getStatusColor()}
        leftSections={leftSections}
        rightSections={rightSections}
        rightGrid={true}
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
        size="xlarge"
        isSubmitting={isSubmitting}
        helpText="Select assets from this allocation to create a new consignment. The allocation is pre-selected and locked."
      />
    </>
  );
}

