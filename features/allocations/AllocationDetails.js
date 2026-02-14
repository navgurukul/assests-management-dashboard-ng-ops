'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import DetailsPage from '@/components/molecules/DetailsPage';
import CustomButton from '@/components/atoms/CustomButton';
import StateHandler from '@/components/atoms/StateHandler';
import useFetch from '@/app/hooks/query/useFetch';
import config from '@/app/config/env.config';

export default function AllocationDetails({ allocationId, onBack }) {
  const router = useRouter();
  
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

  return (
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
          text="View Consignments"
          variant="primary"
          size="md"
          onClick={() => router.push('/consignments')}
        />
      }
    />
  );
}

