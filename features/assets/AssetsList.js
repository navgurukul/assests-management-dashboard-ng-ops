'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Eye, UserPlus, FileText } from 'lucide-react';
import TableWrapper from '@/components/Table/TableWrapper';
import Modal from '@/components/molecules/Modal';
import GenericForm from '@/components/molecules/GenericForm';
import useFetch from '@/app/hooks/query/useFetch';
import config from '@/app/config/env.config';
import {
  assetFormFields,
  assetValidationSchema,
  assetInitialValues,
} from '@/app/config/formConfigs/assetFormConfig';

const columns = [
  { key: "assetTag", label: "ASSET TAG" },
  { key: "type", label: "TYPE" },
  { key: "campus", label: "CAMPUS" },
  { key: "status", label: "STATUS" },
  { key: "location", label: "LOCATION" },
  { key: "actions", label: "ACTIONS" },
];

const statusOptions = ['Under Repair', 'Allocated', 'In Stock', 'Scrap', 'Parted Out'];
const actionOptions = ['View', 'Assign', 'Details'];

export default function AssetsList() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch assets data from API
  const { data, isLoading, isError, error } = useFetch({
    url: 'https://asset-dashboard.navgurukul.org/api/assets',
    queryKey: ['assets'],
  });

  // Transform API data to match table structure
  const assetsListData = React.useMemo(() => {
    if (!data || !data.data) return [];
    
    return data.data.map((asset) => ({
      id: asset.id,
      assetTag: asset.assetTag,
      type: asset.assetType?.name || 'Unknown',
      campus: asset.campus?.name || 'N/A',
      status: asset.status === 'IN_STOCK' ? 'In Stock' : 
              asset.status === 'ALLOCATED' ? 'Allocated' : 
              asset.status === 'REPAIR' ? 'Under Repair' : 
              asset.status === 'SCRAP' ? 'Scrap' : 
              asset.status === 'PARTED_OUT' ? 'Parted Out' : asset.status,
      location: asset.location?.name || 'N/A',
      actions: actionOptions[0], // Default to 'View'
      // Store full asset data for details page
      assetData: asset
    }));
  }, [data]);

  const renderCell = (item, columnKey) => {
    const cellValue = item[columnKey];

    switch (columnKey) {
      case "assetTag":
        return <span className="font-medium text-gray-800">{cellValue}</span>;
      case "status":
        const statusColors = {
          'Under Repair': 'bg-red-100 text-red-800',
          'Allocated': 'bg-green-100 text-green-800',
          'In Stock': 'bg-blue-100 text-blue-800',
          'Scrap': 'bg-gray-100 text-gray-800',
          'Parted Out': 'bg-orange-100 text-orange-800',
        };
        return (
          <span className={`px-3 py-1 rounded text-xs font-medium ${statusColors[cellValue] || 'bg-gray-100 text-gray-800'}`}>
            {cellValue}
          </span>
        );
      case "actions":
        const actionIcons = {
          'View': <Eye className="w-4 h-4" />,
          'Assign': <UserPlus className="w-4 h-4" />,
          'Details': <FileText className="w-4 h-4" />,
        };
        const actionColors = {
          'View': 'text-blue-600 hover:text-blue-800',
          'Assign': 'text-green-600 hover:text-green-800',
          'Details': 'text-gray-600 hover:text-gray-800',
        };
        return (
          <button className={`flex items-center gap-1 font-medium ${actionColors[cellValue] || 'text-blue-600 hover:text-blue-800'}`}>
            {actionIcons[cellValue]}
            <span>{cellValue}</span>
          </button>
        );
      default:
        return cellValue;
    }
  };

  const handleRowClick = (asset) => {
    router.push(`/assets/${asset.id}?id=${asset.id}`);
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
      // Make API call to create asset
      const response = await fetch(config.getApiUrl(config.endpoints.assets.create), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to create asset');
      }

      const result = await response.json();
      console.log('Asset created successfully:', result);
      
      // Close modal and refresh data
      setIsModalOpen(false);
      // You might want to refetch the assets list here
      // queryClient.invalidateQueries(['assets']);
      
    } catch (error) {
      console.error('Error creating asset:', error);
      alert('Failed to create asset. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assets...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 font-medium">Error loading assets</p>
          <p className="text-gray-600 mt-2">{error?.message || 'Something went wrong'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Bar */} 

      {/* Table */}
      <TableWrapper
        data={assetsListData}
        columns={columns}
        title="Assets"
        renderCell={renderCell}
        itemsPerPage={10}
        showPagination={true}
        ariaLabel="Assets table"
        onRowClick={handleRowClick}
        showCreateButton={true}
        onCreateClick={handleCreateClick}
      />

      {/* Create Asset Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Register New Asset"
        size="large"
      >
        <GenericForm
          fields={assetFormFields}
          initialValues={assetInitialValues}
          validationSchema={assetValidationSchema}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseModal}
          submitButtonText="Create Asset"
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
}
