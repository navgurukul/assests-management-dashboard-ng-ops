'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import DetailsPage from '@/components/molecules/DetailsPage';
import CustomButton from '@/components/atoms/CustomButton';
import StateHandler from '@/components/atoms/StateHandler';
import FormModal from '@/components/molecules/FormModal';
import useFetch from '@/app/hooks/query/useFetch';
import post from '@/app/api/post/post';
import config from '@/app/config/env.config';
import { createConsignmentFieldsFromAllocation } from '@/app/config/formConfigs/consignmentFormConfig';
import { toast } from '@/app/utils/toast';
import { allocationsListData } from '@/dummyJson/dummyJson';

export default function AllocationDetails({ allocationId, onBack }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  // Format status
  const isActive = !allocationDetails.endDate;
  const displayStatus = isActive ? 'Active' : 'Returned';

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

  // Calculate duration
  const calculateDuration = () => {
    const start = new Date(allocationDetails.startDate);
    const end = allocationDetails.endDate ? new Date(allocationDetails.endDate) : new Date();
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days`;
  };

  // Left column sections (30%)
  const leftSections = [
    {
      title: 'Allocation Info',
      items: [
        { label: 'Status', value: displayStatus, className: `font-semibold ${getStatusColor()}` },
        { label: 'Allocation ID', value: `#${allocationDetails.id || 'N/A'}` },
        { label: 'Reason', value: formatReason(allocationDetails.allocationReason) },
        { label: 'Temporary', value: allocationDetails.isTemporary ? 'Yes' : 'No' },
        { label: 'Duration', value: calculateDuration() },
      ],
    },
    {
      title: 'Asset Information',
      items: [
        { label: 'Asset ID', value: allocationDetails.assetId || 'N/A' },
        { label: 'Asset Tag', value: allocationDetails.asset?.assetTag || 'N/A' },
        { label: 'Brand', value: allocationDetails.asset?.brand || 'N/A' },
        { label: 'Model', value: allocationDetails.asset?.model || 'N/A' },
      ],
    },
    {
      title: 'User Information',
      items: [
        { label: 'User ID', value: allocationDetails.userId || 'N/A' },
        { label: 'User Name', value: allocationDetails.user?.name || 'N/A' },
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
          value: allocationDetails.startDate 
            ? new Date(allocationDetails.startDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })
            : 'N/A' 
        },
        { 
          label: 'End Date', 
          value: allocationDetails.endDate 
            ? new Date(allocationDetails.endDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })
            : 'Still Active' 
        },
        { 
          label: 'Expected Return Date', 
          value: allocationDetails.expectedReturnDate 
            ? new Date(allocationDetails.expectedReturnDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })
            : 'Not Applicable' 
        },
      ],
    },
    {
      title: 'Administrative Information',
      items: [
        { label: 'Created By', value: allocationDetails.createdByUserId || 'N/A' },
        { label: 'Verified By', value: allocationDetails.verifiedByUserId || 'Not Yet Verified' },
        { 
          label: 'Created At', 
          value: allocationDetails.createdAt 
            ? new Date(allocationDetails.createdAt).toLocaleString()
            : 'N/A' 
        },
        { 
          label: 'Updated At', 
          value: allocationDetails.updatedAt 
            ? new Date(allocationDetails.updatedAt).toLocaleString()
            : 'N/A' 
        },
      ],
    },
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

  // Handle create consignment
  const handleCreateConsignment = async (formData) => {
    setIsSubmitting(true);
    const loadingToastId = toast.loading('Creating consignment...');
    
    try {
      // Validate that we have allocation and assets
      if (!formData.allocationId) {
        throw new Error('Please select an allocation');
      }
      
      if (!formData.selectedAssets || formData.selectedAssets.length === 0) {
        throw new Error('Please select at least one asset');
      }
      
      const payload = {
        allocationId: formData.allocationId,
        assetIds: formData.selectedAssets.map(asset => asset.id || asset.assetId),
      };

      const response = await post({
        url: config.getApiUrl(config.endpoints.consignments.create),
        data: payload,
      });
      
      toast.dismiss(loadingToastId);
      toast.success(response?.message || 'Consignment created successfully with status: Draft');
      
      setIsCreateModalOpen(false);
      queryClient.invalidateQueries(['consignments']);
      
    } catch (error) {
      console.error('Error creating consignment:', error);
      toast.dismiss(loadingToastId);
      toast.error(error?.message || 'Failed to create consignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Use API allocation details to pre-populate the modal
  const currentAllocation = allocationDetails;

  return (
    <>
      <DetailsPage
        title={`ALLOCATION #${allocationDetails.id}`}
        subtitle={`Status: ${displayStatus} | Assigned to: ${allocationDetails.user?.name || allocationDetails.userId || 'Unknown'}`}
        subtitleColor={getStatusColor()}
        leftSections={leftSections}
        rightSections={rightSections}
        showTimeline={false}
        onBack={onBack}
        headerActions={
          <CustomButton
            text="Create Consignment"
            variant="primary"
            size="md"
            onClick={() => setIsCreateModalOpen(true)}
          />
        }
      />

      {/* Create Consignment Modal */}
      <FormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        actionType="Create"
        fields={createConsignmentFieldsFromAllocation}
        onSubmit={handleCreateConsignment}
        size="large"
        isSubmitting={isSubmitting}
        initialValues={{
          allocationSelector: {
            allocationId: String(allocationDetails.id || allocationId),
            selectedAssets: [],
            allocationDetails: currentAllocation,
          },
          allocationId: String(allocationDetails.id || allocationId),
          selectedAssets: [],
          allocationDetails: currentAllocation,
        }}
        helpText="Select assets from this allocation to create a new consignment. The allocation is pre-selected and locked."
      />
    </>
  );
}

