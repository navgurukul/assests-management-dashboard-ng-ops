'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Download, Eye } from 'lucide-react';
import TableWrapper from '@/components/Table/TableWrapper';
import CustomButton from '@/components/atoms/CustomButton';
import useFetch from '@/app/hooks/query/useFetch';

const columns = [
  { key: "componentTag", label: "COMPONENT TAG" },
  { key: "type", label: "TYPE" },
  { key: "status", label: "STATUS" },
  { key: "installedOn", label: "INSTALLED ON" },
  { key: "action", label: "ACTION" },
];

export default function ComponentsPage() {
  const router = useRouter();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Fetch components data from API with pagination
  const { data, isLoading, isError, error } = useFetch({
    url: `https://asset-dashboard.navgurukul.org/api/components?page=${currentPage}&limit=${pageSize}`,
    queryKey: ['components', currentPage, pageSize],
  });

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle page size change
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Transform API data to match table structure
  const componentsListData = React.useMemo(() => {
    if (!data || !data.data) return [];
    
    return data.data.map((component) => ({
      id: component.id,
      componentTag: component.componentTag || component.id,
      type: component.componentType?.name || component.type || 'Unknown',
      status: component.status === 'IN_STOCK' ? 'In Stock' : 
              component.status === 'WORKING' ? 'Working' : 
              component.status === 'INSTALLED' ? 'Installed' :
              component.status === 'SCRAP' ? 'Scrap' : component.status,
      installedOn: component.asset?.assetTag || 'Not Installed',
      action: component.asset ? 'Remove' : 'Install',
    }));
  }, [data]);

  const handleViewDetails = (componentId) => {
    router.push(`/components/${componentId}?id=${componentId}`);
  };

  const renderCell = (item, columnKey) => {
    const cellValue = item[columnKey];

    switch (columnKey) {
      case "componentTag":
        return (
          <button 
            onClick={() => handleViewDetails(item.componentTag)}
            className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
          >
            {cellValue}
          </button>
        );
      case "status":
        const statusColors = {
          'Working': 'bg-green-100 text-green-800',
          'In Stock': 'bg-blue-100 text-blue-800',
          'Scrap': 'bg-gray-100 text-gray-800',
        };
        return (
          <span className={`px-3 py-1 rounded text-xs font-medium ${statusColors[cellValue] || 'bg-gray-100 text-gray-800'}`}>
            {cellValue}
          </span>
        );
      case "action":
        const actionIconMap = {
          'Remove': Trash2,
          'Install': Download,
          'Details': Eye,
        };
        const actionVariantMap = {
          'Remove': 'danger',
          'Install': 'success',
          'Details': 'info',
        };
        
        const handleAction = () => {
          if (cellValue === 'Details') {
            handleViewDetails(item.componentTag);
          } else {
            console.log(`Action: ${cellValue} for ${item.componentTag}`);
          }
        };
        
        return (
          <CustomButton
            text={cellValue}
            icon={actionIconMap[cellValue]}
            onClick={handleAction}
            variant={actionVariantMap[cellValue] || 'info'}
            size="sm"
          />
        );
      case "installedOn":
        return <span className="text-gray-600">{cellValue}</span>;
      default:
        return cellValue;
    }
  };

  const handleCreateClick = () => {
    router.push('/components/create');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 overflow-y-auto h-full">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading components...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="p-6 overflow-y-auto h-full">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 font-medium">Error loading components</p>
            <p className="text-gray-600 mt-2">{error?.message || 'Something went wrong'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 overflow-y-auto h-full">
      <TableWrapper
        data={componentsListData}
        columns={columns}
        title="Components"
        renderCell={renderCell}
        itemsPerPage={pageSize}
        showPagination={true}
        ariaLabel="Components table"
        showCreateButton={true}
        onCreateClick={handleCreateClick}
        // Server-side pagination props
        serverPagination={true}
        paginationData={data?.pagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}
