'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Eye } from 'lucide-react';
import TableWrapper from '@/components/Table/TableWrapper';
import FilterDropdown from '@/components/molecules/FilterDropdown';
import ActiveFiltersChips from '@/components/molecules/ActiveFiltersChips';
import ColumnSelector from '@/components/molecules/ColumnSelector';
import SearchInput from '@/components/molecules/SearchInput';
import { useTableColumns } from '@/app/hooks/useTableColumns';
import {
  USER_TABLE_ID,
  userTableColumns,
  defaultVisibleColumns,
} from '@/app/config/tableConfigs/userTableConfig';
import { userListData } from '@/dummyJson/dummyJson';

// ─── Static filter options ────────────────────────────────────────────────────

const campusOptions = [
  { value: 'Bangalore', label: 'Bangalore' },
  { value: 'Pune', label: 'Pune' },
  { value: 'Dharamshala', label: 'Dharamshala' },
  { value: 'Sarjapur', label: 'Sarjapur' },
];

const roleOptions = [
  { value: 'Student', label: 'Student' },
  { value: 'Staff', label: 'Staff' },
  { value: 'Admin', label: 'Admin' },
  { value: 'Mentor', label: 'Mentor' },
];

const allocationStatusOptions = [
  { value: 'Active', label: 'Active' },
  { value: 'Returned', label: 'Returned' },
  { value: 'No Allocation', label: 'No Allocation' },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function UsersList() {
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filters
  const [filters, setFilters] = useState({});

  // Search
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Column visibility
  const {
    visibleColumns,
    visibleColumnKeys,
    allColumns,
    toggleColumn,
    showAllColumns,
    resetToDefault,
    alwaysVisibleColumns,
  } = useTableColumns(USER_TABLE_ID, userTableColumns, defaultVisibleColumns);

  // Debounce search (400 ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Client-side filter + search on dummy data
  const filteredData = useMemo(() => {
    let result = [...userListData];

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.assetTag.toLowerCase().includes(q) ||
          u.campus.toLowerCase().includes(q)
      );
    }

    if (filters.campus) result = result.filter((u) => u.campus === filters.campus);
    if (filters.role) result = result.filter((u) => u.role === filters.role);
    if (filters.allocationStatus) result = result.filter((u) => u.allocationStatus === filters.allocationStatus);

    return result;
  }, [debouncedSearch, filters]);

  // Pagination helpers
  const totalPages = Math.ceil(filteredData.length / pageSize);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const paginationData = {
    page: currentPage,
    limit: pageSize,
    totalCount: filteredData.length,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };

  // Pagination handlers
  const handlePageChange = (page) => setCurrentPage(page);
  const handlePageSizeChange = (size) => { setPageSize(size); setCurrentPage(1); };

  // Filter handlers
  const handleFilterChange = (newFilters) => { setFilters(newFilters); setCurrentPage(1); };
  const handleRemoveFilter = (key) => {
    const updated = { ...filters };
    delete updated[key];
    setFilters(updated);
    setCurrentPage(1);
  };

  const getFilterLabel = (filterKey, value) => {
    if (filterKey === 'campus') return campusOptions.find((o) => o.value === value)?.label ?? value;
    if (filterKey === 'role') return roleOptions.find((o) => o.value === value)?.label ?? value;
    if (filterKey === 'allocationStatus') return allocationStatusOptions.find((o) => o.value === value)?.label ?? value;
    return value;
  };

  const getCategoryName = (filterKey) => {
    const names = { campus: 'Campus', role: 'Role', allocationStatus: 'Allocation Status' };
    return names[filterKey] || filterKey;
  };

  // Cell renderer
  const renderCell = (item, columnKey) => {
    const cellValue = item[columnKey];

    switch (columnKey) {
      case 'name':
        return <span className="font-semibold text-gray-900">{cellValue}</span>;

      case 'email':
        return <span className="text-blue-600 text-sm">{cellValue}</span>;

      case 'role':
        return (
          <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
            {cellValue}
          </span>
        );

      case 'allocationStatus':
        const statusColors = {
          Active: 'bg-green-100 text-green-800',
          Returned: 'bg-gray-100 text-gray-700',
          'No Allocation': 'bg-yellow-100 text-yellow-800',
        };
        return (
          <span className={`px-3 py-1 rounded text-xs font-medium ${statusColors[cellValue] || 'bg-gray-100 text-gray-800'}`}>
            {cellValue}
          </span>
        );

      case 'assetCondition':
        const conditionColors = {
          Working: 'bg-green-100 text-green-800',
          New: 'bg-blue-100 text-blue-800',
          Damaged: 'bg-orange-100 text-orange-800',
          Faulty: 'bg-red-100 text-red-800',
        };
        return cellValue !== 'N/A' ? (
          <span className={`px-3 py-1 rounded text-xs font-medium ${conditionColors[cellValue] || 'bg-gray-100 text-gray-800'}`}>
            {cellValue}
          </span>
        ) : (
          <span className="text-gray-400 text-xs">N/A</span>
        );

      case 'assetTag':
        return cellValue !== 'Not Assigned' ? (
          <span className="font-mono text-sm font-medium text-gray-800">{cellValue}</span>
        ) : (
          <span className="text-gray-400 text-xs italic">Not Assigned</span>
        );

      case 'allocationDate':
      case 'returnDate':
        return <span className="text-gray-600 text-sm">{cellValue}</span>;

      case 'actions':
        return (
          <button
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <Eye className="w-4 h-4" />
            <span>View</span>
          </button>
        );

      default:
        return <span className="text-gray-700 text-sm">{cellValue ?? 'N/A'}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <TableWrapper
        data={paginatedData}
        columns={visibleColumns}
        title="User List"
        renderCell={renderCell}
        itemsPerPage={pageSize}
        showPagination={true}
        ariaLabel="User list table"
        // Search
        searchComponent={
          <SearchInput
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Search by name, email, asset tag..."
          />
        }
        // Filters
        filterComponent={
          <FilterDropdown
            onFilterChange={handleFilterChange}
            campusOptions={campusOptions}
            statusOptions={allocationStatusOptions}
            roleOptions={roleOptions}
            selectedFilters={filters}
          />
        }
        // Column selector
        columnSelectorComponent={
          <ColumnSelector
            allColumns={allColumns}
            visibleColumnKeys={visibleColumnKeys}
            alwaysVisibleColumns={alwaysVisibleColumns}
            onToggleColumn={toggleColumn}
            onShowAll={showAllColumns}
            onResetToDefault={resetToDefault}
          />
        }
        // Active filter chips
        activeFiltersComponent={
          <ActiveFiltersChips
            filters={filters}
            onRemoveFilter={handleRemoveFilter}
            getCategoryName={getCategoryName}
            getFilterLabel={getFilterLabel}
          />
        }
        // Pagination (client-side data, server-pagination UI)
        serverPagination={true}
        paginationData={paginationData}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}
