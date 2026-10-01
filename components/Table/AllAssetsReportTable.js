"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from 'next/navigation';
import TableWrapper from "./TableWrapper";
import StateHandler from "@/components/atoms/StateHandler";
import FilterDropdown from "@/components/molecules/FilterDropdown";
import ActiveFiltersChips from "@/components/molecules/ActiveFiltersChips";
import useFetch from "@/app/hooks/query/useFetch";
import config from "@/app/config/env.config";

const columns = [
  { key: "campus", label: "Campus" },
  { key: "inStock", label: "In Stock" },
  { key: "allocated", label: "Allocated" },
  { key: "repair", label: "Repair" },
  { key: "scrap", label: "Scrap" },
  { key: "partedOut", label: "Parted Out" },
  { key: "disposed", label: "Disposed" },
  { key: "grandTotal", label: "Grand Total" },
];

function transformRow(item, index) {
  return {
    id: `${item.campus}_${index}`,
    campusId: item.campusId,
    campus: item.campus,
    inStock: item.IN_STOCK ?? 0,
    allocated: item.ALLOCATED ?? 0,
    repair: item.REPAIR ?? 0,
    scrap: item.SCRAP ?? 0,
    partedOut: item.PARTED_OUT ?? 0,
    disposed: item.DISPOSED ?? 0,
    grandTotal: item.grand_total ?? 0,
  };
}

export default function AllAssetsReportTable() {
  const router = useRouter();
  const [filters, setFilters] = useState({});

  // Fetch asset categories
  const { data: categoriesResponse, isLoading: categoriesLoading } = useFetch({
    url: '/asset-categories',
    queryKey: ['asset-categories'],
  });

  const assetCategories = categoriesResponse?.data || [];

  // Fetch asset types based on selected category
  const selectedCategoryId = filters.category; 
  const assetTypesUrl = selectedCategoryId ? `/asset-categories/${selectedCategoryId}` : null;
  
  const { data: assetTypesResponse, isLoading: typesLoading } = useFetch({
    url: assetTypesUrl,
    queryKey: ['asset-types', selectedCategoryId],
    enabled: Boolean(selectedCategoryId),
  });

  const assetTypes = assetTypesResponse?.data?.assetTypes || [];

  // Set default filters on component mount
  useEffect(() => {
    if (assetCategories.length > 0 && !filters.category) {
      // Find "IT and Electronics" category or fallback to 1st category
      const itCategory = assetCategories.find(cat => 
        cat.name.toLowerCase().includes('it') && cat.name.toLowerCase().includes('electronics')
      ) || assetCategories[0];
      
      if (itCategory) {
        setFilters(prev => ({ ...prev, category: itCategory.id }));
      }
    }
  }, [assetCategories, filters.category]);

  // Set default asset type when types are loaded
  useEffect(() => {
    if (assetTypes.length > 0 && filters.category && !filters.type) {
      // Find "Desktop" asset type or fallback to 1st asset type in selected category
      const defaultType = assetTypes.find(type =>
        type.name.toLowerCase().includes('desktop')
      ) || assetTypes[0];
      
      if (defaultType) {
        setFilters(prev => ({ ...prev, type: defaultType.id }));
      }
    }
  }, [assetTypes, filters.category, filters.type]);

  // Create filter options for dropdown
  const assetCategoryOptions = assetCategories.map(category => ({
    value: category.id,
    label: category.name
  }));

  const assetTypeOptions = assetTypes.map(type => ({
    value: type.id,
    label: type.name
  }));

  // Fetch report data when both type and category are selected
  const reportUrl = filters.type && filters.category
    ? `${config.endpoints.assets.categoryAndType}?assetTypeId=${filters.type}&assetCategoryId=${filters.category}`
    : null;

  const { data: reportResponse, isLoading: reportLoading, isError: reportError, error } = useFetch({
    url: reportUrl,
    queryKey: ['assets', 'category-and-type', filters.type, filters.category],
    enabled: Boolean(filters.type && filters.category),
  });

  const reportData = reportResponse?.data || [];

  const tableData = useMemo(() => {
    return reportData.map(transformRow);
  }, [reportData]);

  // Filter handling functions
  const handleFilterChange = (newFilters) => {
    setFilters(prevFilters => {
      const updatedFilters = { ...newFilters };
      
      // If category changed, clear the type filter to force reselection
      if (prevFilters.category !== updatedFilters.category) {
        delete updatedFilters.type;
      }
      
      return updatedFilters;
    });
  };

  const handleRemoveFilter = (filterKey) => {
    setFilters(prev => {
      const updated = { ...prev };
      delete updated[filterKey];
      
      // If removing category, also remove type
      if (filterKey === 'category') {
        delete updated.type;
      }
      
      return updated;
    });
  };

  const handleClearAllFilters = () => {
    setFilters({});
  };

  // Function to get filter category names
  const getCategoryName = (key) => {
    switch (key) {
      case 'type': return 'Asset Type';
      case 'category': return 'Asset Category';
      default: return key;
    }
  };

  // Function to get filter labels
  const getFilterLabel = (key, value) => {
    switch (key) {
      case 'type':
        const type = assetTypes.find(t => t.id === value);
        return type?.name || value;
      case 'category':
        const category = assetCategories.find(c => c.id === value);
        return category?.name || value;
      default:
        return value;
    }
  };

  // Function to handle cell clicks and navigate to assets page with filters
  const handleCellClick = (item, columnKey) => {
    const cellValue = item[columnKey];

    // Don't allow clicks on total row or zero values
    if (item.id === "total-row" || cellValue === 0) return;

    const queryParams = new URLSearchParams();

    if (item.campusId) {
      queryParams.set('campusId', item.campusId);
    }

    // Add status filter based on the column clicked
    const columnToStatusMapping = {
      inStock: 'IN_STOCK',
      allocated: 'ALLOCATED',
      repair: 'REPAIR',
      scrap: 'SCRAP',
      partedOut: 'PARTED_OUT',
      disposed: 'DISPOSED',
    };

    if (columnToStatusMapping[columnKey]) {
      queryParams.set('status', columnToStatusMapping[columnKey]);
    }

    // Add type and category filters
    if (filters.type) {
      queryParams.set('type', filters.type);
    }
  
    // Navigate to assets page with filters
    const queryString = queryParams.toString();
    router.push(`/assets${queryString ? `?${queryString}` : ''}`);
  };

  // Calculate totals across all rows
  const totals = tableData.reduce(
    (acc, row) => {
      acc.inStock += row.inStock || 0;
      acc.allocated += row.allocated || 0;
      acc.repair += row.repair || 0;
      acc.scrap += row.scrap || 0;
      acc.partedOut += row.partedOut || 0;
      acc.disposed += row.disposed || 0;
      acc.grandTotal += row.grandTotal || 0;
      return acc;
    },
    {
      id: "total-row",
      campus: "Total",
      inStock: 0,
      allocated: 0,
      repair: 0,
      scrap: 0,
      partedOut: 0,
      disposed: 0,
      grandTotal: 0,
    }
  );

  // Append totals row at the bottom
  const finalTableData = [...tableData];
  if (tableData.length > 0) {
    finalTableData.push(totals);
  }

  const renderCell = (item, columnKey) => {
    const cellValue = item[columnKey];
    const isTotalRow = item.id === "total-row";

    // Helper to determine if cell should be clickable
    const isClickable = !isTotalRow && cellValue > 0 && filters.type && filters.category && 
      ['inStock', 'allocated', 'repair', 'scrap', 'partedOut', 'disposed'].includes(columnKey);

    if (isTotalRow) {
      if (columnKey === "campus") {
        return <span className="font-extrabold text-blue-800 uppercase">TOTAL</span>;
      }
      return <span className="font-extrabold text-blue-800">{cellValue}</span>;
    }

    switch (columnKey) {
      case "campus":
        return <span className="font-semibold text-gray-900">{cellValue}</span>;
      case "grandTotal":
        return <span className="font-bold text-blue-600">{cellValue}</span>;
      case "inStock":
      case "allocated":
      case "repair":
      case "scrap":
      case "partedOut":
      case "disposed":
        return (
          <span
            className={`text-gray-700 text-center ${
              isClickable
                ? 'cursor-pointer hover:text-blue-600 hover:underline transition-colors font-medium'
                : ''
            }`}
            onClick={isClickable ? () => handleCellClick(item, columnKey) : undefined}
            title={isClickable ? `Click to view ${columnKey} assets in ${item.campus}` : ''}
          >
            {cellValue}
          </span>
        );
      default:
        return <span className="text-gray-700 text-center">{cellValue}</span>;
    }
  };

  // const isLoading = categoriesLoading || typesLoading || reportLoading;
  const isDataLoading = reportLoading || typesLoading;
  const hasError = reportError;
  const showEmptyMessage = !isDataLoading && !hasError && (!filters.type || !filters.category);
  const showNoResults = !isDataLoading && !hasError && filters.type && filters.category && reportData.length === 0;

  // if (isLoading) {
  //   return (
  //     <StateHandler
  //       isLoading={true}
  //       loadingMessage="Loading all assets report..."
  //     />
  //   );
  // }

  if (categoriesLoading) {
    return (
      <div className="p-6 text-sm text-gray-500">
        Loading categories...
      </div>
    );
  }

  if (hasError) {
    return (
      <StateHandler
        isError={true}
        error={error}
        errorMessage="Failed to load all assets report data"
      />
    );
  }

  // Custom empty content
  const emptyContent = showEmptyMessage ? (
    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
      <p className="text-sm font-semibold text-gray-700 mb-2">Select Asset Type and Category</p>
      <p className="text-xs text-gray-500">Please use the filters above to select both Asset Type and Asset Category to view the report.</p>
    </div>
  ) : showNoResults ? (
    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
      <p className="text-sm font-semibold text-gray-700 mb-2">No Assets Found</p>
      <p className="text-xs text-gray-500">No assets found for the selected type and category combination.</p>
    </div>
  ) : null;

  return (
    <TableWrapper
      data={finalTableData}
      columns={columns}
      // title={`All Assets Report${filters.type && filters.category ? ` - ${getFilterLabel('category', filters.category)} / ${getFilterLabel('type', filters.type)}` : ''}`}
      title={ filters.type && filters.category ? `Consolidated ${getFilterLabel('type', filters.type)} Data` : 'All Assets Report'}
      renderCell={renderCell}
      margin="m-0"
      shadow="shadow-none"
      isLoading={reportLoading}
      showPagination={false}
      ariaLabel="All assets report table"
      emptyContent={emptyContent}
      // Filter components
      filterComponent={
        <FilterDropdown
          onFilterChange={handleFilterChange}
          assetCategoryOptions={assetCategoryOptions} 
          assetTypeOptions={assetTypeOptions}
          selectedFilters={filters}
        />
      }
      activeFiltersComponent={
        <ActiveFiltersChips
          filters={filters}
          onRemoveFilter={handleRemoveFilter}
          onClearAll={handleClearAllFilters}
          getCategoryName={getCategoryName}
          getFilterLabel={getFilterLabel}
        />
      }
    />
  );
}