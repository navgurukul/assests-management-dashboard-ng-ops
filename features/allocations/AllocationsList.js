'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, UserPlus, Calendar, CheckCircle, XCircle } from 'lucide-react';
import TableWrapper from '@/components/Table/TableWrapper';
import Modal from '@/components/molecules/Modal';
import GenericForm from '@/components/molecules/GenericForm';
import useFetch from '@/app/hooks/query/useFetch';
import config from '@/app/config/env.config';
import {
  allocationFormFields,
  allocationValidationSchema,
  allocationInitialValues,
} from '@/app/config/formConfigs/allocationFormConfig';

const columns = [
  { key: "allocationId", label: "ALLOCATION ID" },
  { key: "assetTag", label: "ASSET TAG" },
  { key: "userName", label: "ASSIGNED TO" },
  { key: "startDate", label: "START DATE" },
  { key: "endDate", label: "END DATE" },
  { key: "reason", label: "REASON" },
  { key: "status", label: "STATUS" },
  { key: "actions", label: "ACTIONS" },
];

const actionOptions = ['View', 'Return', 'Details'];

export default function AllocationsList() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch allocations data from API
  const { data, isLoading, isError, error } = useFetch({
    url: config.getApiUrl(config.endpoints.allocations?.list || '/allocations'),
    queryKey: ['allocations'],
  });

  // Format reason helper function
  const formatReason = (reason) => {
    const reasonMap = {
      'JOINER': 'Joiner',
      'REPAIR': 'Repair',
      'REPLACEMENT': 'Replacement',
      'LOANER': 'Loaner',
    };
    return reasonMap[reason] || reason;
  };

  // Transform API data to match table structure
  const allocationsListData = React.useMemo(() => {
    if (!data || !data.data) return [];
    
    return data.data.map((allocation) => ({
      id: allocation.id,
      allocationId: allocation.id || 'N/A',
      assetTag: allocation.asset?.assetTag || allocation.assetId || 'N/A',
      userName: allocation.user?.name || allocation.userId || 'N/A',
      startDate: allocation.startDate ? new Date(allocation.startDate).toLocaleDateString() : 'N/A',
      endDate: allocation.endDate ? new Date(allocation.endDate).toLocaleDateString() : 'Active',
      reason: formatReason(allocation.allocationReason),
      status: allocation.endDate ? 'Returned' : 'Active',
      isActive: !allocation.endDate,
      // Store full allocation data
      allocationData: allocation
    }));
  }, [data]);

  const renderCell = (item, columnKey) => {
    const cellValue = item[columnKey];

    switch (columnKey) {
      case "allocationId":
        return <span className="font-medium text-blue-600">#{cellValue}</span>;
      case "assetTag":
        return <span className="font-medium text-gray-800">{cellValue}</span>;
      case "userName":
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-medium text-sm">
                {cellValue.charAt(0).toUpperCase()}
              </span>
            </div>
            <span>{cellValue}</span>
          </div>
        );
      case "status":
        const statusColors = {
          'Active': 'bg-green-100 text-green-800',
          'Returned': 'bg-gray-100 text-gray-800',
        };
        const StatusIcon = item.isActive ? CheckCircle : XCircle;
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${statusColors[cellValue] || 'bg-gray-100 text-gray-800'}`}>
            <StatusIcon className="w-3 h-3" />
            {cellValue}
          </span>
        );
      case "reason":
        const reasonColors = {
          'Joiner': 'bg-blue-50 text-blue-700',
          'Repair': 'bg-red-50 text-red-700',
          'Replacement': 'bg-orange-50 text-orange-700',
          'Loaner': 'bg-purple-50 text-purple-700',
        };
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${reasonColors[cellValue] || 'bg-gray-50 text-gray-700'}`}>
            {cellValue}
          </span>
        );
      case "endDate":
        if (cellValue === 'Active') {
          return <span className="text-green-600 font-medium">{cellValue}</span>;
        }
        return cellValue;
      case "actions":
        return (
          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/allocations/${item.id}`);
              }}
              className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            {item.isActive && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleReturnAllocation(item.id);
                }}
                className="text-orange-600 hover:text-orange-800 p-1 hover:bg-orange-50 rounded transition-colors"
                title="Mark as Returned"
              >
                <Calendar className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      default:
        return cellValue;
    }
  };

  const handleRowClick = (allocation) => {
    router.push(`/allocations/${allocation.id}`);
  };

  const handleCreateClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFormSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      // Prepare data for API
      const allocationData = {
        assetId: values.assetId,
        userId: values.userId,
        startDate: values.startDate,
        endDate: values.endDate || null,
        allocationReason: values.allocationReason,
        isTemporary: values.isTemporary,
        expectedReturnDate: values.isTemporary ? values.expectedReturnDate : null,
        notes: values.notes,
      };

      // Make API call to create allocation
      const response = await fetch(config.getApiUrl(config.endpoints.allocations?.create || '/allocations'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(allocationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create allocation');
      }

      const result = await response.json();
      console.log('Allocation created successfully:', result);
      
      // Close modal and refresh data
      setIsModalOpen(false);
      // You might want to refetch the allocations list here
      // queryClient.invalidateQueries(['allocations']);
      
      alert('Allocation created successfully!');
    } catch (error) {
      console.error('Error creating allocation:', error);
      alert(`Failed to create allocation: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturnAllocation = async (allocationId) => {
    const confirmed = confirm('Are you sure you want to mark this allocation as returned?');
    if (!confirmed) return;

    try {
      const response = await fetch(config.getApiUrl(config.endpoints.allocations?.update?.(allocationId) || `/allocations/${allocationId}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endDate: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update allocation');
      }

      alert('Allocation marked as returned successfully!');
      // Refetch data
      // queryClient.invalidateQueries(['allocations']);
    } catch (error) {
      console.error('Error updating allocation:', error);
      alert('Failed to mark allocation as returned. Please try again.');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading allocations...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 font-medium">Error loading allocations</p>
          <p className="text-gray-600 mt-2">{error?.message || 'Something went wrong'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Allocations</p>
              <p className="text-2xl font-bold text-gray-900">{allocationsListData.length}</p>
            </div>
            <UserPlus className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Allocations</p>
              <p className="text-2xl font-bold text-green-600">
                {allocationsListData.filter(a => a.isActive).length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Returned</p>
              <p className="text-2xl font-bold text-gray-600">
                {allocationsListData.filter(a => !a.isActive).length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-gray-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-purple-600">
                {allocationsListData.filter(a => {
                  const startDate = new Date(a.startDate);
                  const now = new Date();
                  return startDate.getMonth() === now.getMonth() && 
                         startDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Table */}
      <TableWrapper
        data={allocationsListData}
        columns={columns}
        title="Allocations"
        renderCell={renderCell}
        itemsPerPage={10}
        showPagination={true}
        ariaLabel="Allocations table"
        onRowClick={handleRowClick}
        showCreateButton={true}
        onCreateClick={handleCreateClick}
      />

      {/* Create Allocation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Create New Allocation"
        size="large"
      >
        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Only one active allocation per asset is allowed at any time. 
            Make sure the asset is available (status: IN_STOCK) before creating an allocation.
          </p>
        </div>
        <GenericForm
          fields={allocationFormFields}
          initialValues={allocationInitialValues}
          validationSchema={allocationValidationSchema}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseModal}
          submitButtonText="Create Allocation"
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
}

