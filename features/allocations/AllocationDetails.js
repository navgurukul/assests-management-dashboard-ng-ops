'use client';

import React from 'react';
import DetailsPage from '@/components/molecules/DetailsPage';
import useFetch from '@/app/hooks/query/useFetch';

export default function AllocationDetails({ allocationId, onBack }) {
  // Fetch allocation details from API
  const { data, isLoading, isError, error } = useFetch({
    url: `http://13.203.90.62/allocations/${allocationId}`,
    queryKey: ['allocation', allocationId],
    enabled: !!allocationId,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading allocation details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 font-medium">Error loading allocation details</p>
          <p className="text-gray-600 mt-2">{error?.message || 'Something went wrong'}</p>
        </div>
      </div>
    );
  }

  if (!data || !data.data) {
    return (
      <div className="p-6">
        <p>Allocation not found</p>
      </div>
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
    />
  );
}

