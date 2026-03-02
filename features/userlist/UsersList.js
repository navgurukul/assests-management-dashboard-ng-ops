'use client';

import React, { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import StatusChip from '@/components/atoms/StatusChip';
import { getConditionChipColor } from '@/app/utils/statusHelpers';
import { useRouter } from 'next/navigation';
import TableWrapper from '@/components/Table/TableWrapper';
import StateHandler from '@/components/atoms/StateHandler';
import FilterDropdown from '@/components/molecules/FilterDropdown';
import ActiveFiltersChips from '@/components/molecules/ActiveFiltersChips';
import ColumnSelector from '@/components/molecules/ColumnSelector';
import SearchInput from '@/components/molecules/SearchInput';
import useFetch from '@/app/hooks/query/useFetch';
import { useTableColumns } from '@/app/hooks/useTableColumns';
import {
  USER_TABLE_ID,
  userTableColumns,
  defaultVisibleColumns,
} from '@/app/config/tableConfigs/userTableConfig';

// ─── Static filter options ────────────────────────────────────────────────────

const roleOptions = [
  { value: 'STUDENT', label: 'Student' },
  { value: 'STAFF', label: 'Staff' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'MENTOR', label: 'Mentor' },
];

// ─── Helper ───────────────────────────────────────────────────────────────────

const formatRole = (role) => {
  if (!role) return 'N/A';
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function UsersList() {
  const router = useRouter();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

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

  // Debounce search (800 ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCurrentPage(1);
    }, 800);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Build query string
  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.append('search', debouncedSearch);
    params.append('page', currentPage);
    params.append('limit', pageSize);
    if (filters.role) params.append('role', filters.role);
    if (filters.campus) params.append('campusId', filters.campus);
    return params.toString();
  };

  // Fetch users from API
  const { data, isLoading, isError, error } = useFetch({
    url: `/users?${buildQueryString()}`,
    queryKey: ['users', currentPage, pageSize, filters, debouncedSearch],
  });

  // Fetch campus options from API
  const { data: campusData } = useFetch({
    url: '/campuses',
    queryKey: ['campuses'],
  });

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

  // Dynamic campus options from API
  const campusOptions = React.useMemo(() => {
    if (!campusData?.data) return [];
    return campusData.data.map((c) => ({ value: c.id, label: c.campusName }));
  }, [campusData]);

  const getFilterLabel = (filterKey, value) => {
    if (filterKey === 'campus') return campusOptions.find((o) => o.value === value)?.label ?? value;
    if (filterKey === 'role') return roleOptions.find((o) => o.value === value)?.label ?? value;
    return value;
  };

  const getCategoryName = (filterKey) => {
    const names = { campus: 'Campus', role: 'Role' };
    return names[filterKey] || filterKey;
  };

  // Transform API user data into table rows
  const usersListData = React.useMemo(() => {
    if (!data?.data) return [];
    return data.data.map((user) => ({
      id: user.id,
      name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || 'N/A',
      email: user.email || 'N/A',
      role: formatRole(user.role),
      campus: user.campusId || 'N/A',
      isActive: user.isActive,
      phone: user.phone || 'N/A',
      department: user.department || 'N/A',
      location: user.location || 'N/A',
      createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
      // Allocation fields — not in /users response
      assetTag: 'N/A',
      assetType: 'N/A',
      assetBrand: 'N/A',
      assetModel: 'N/A',
      assetCondition: 'N/A',
      assetCampus: 'N/A',
      allocationDate: 'N/A',
      allocationStatus: 'N/A',
      allocationReason: 'N/A',
      returnDate: 'N/A',
      assetSerialNumber: 'N/A',
      // Raw data reference
      userData: user,
    }));
  }, [data]);

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
          <StatusChip value={cellValue} colorFn={() => 'bg-purple-100 text-purple-800'} />
        );

      case 'allocationStatus':
        return <StatusChip value={cellValue} />;

      case 'assetCondition':
        return cellValue !== 'N/A' ? (
          <StatusChip value={cellValue} colorFn={getConditionChipColor} />
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

  // Handle loading and error states
  if (isLoading || isError) {
    return (
      <StateHandler
        isLoading={isLoading}
        isError={isError}
        error={error}
        loadingMessage="Loading users..."
        errorMessage="Error loading users"
      />
    );
  }

  const handleRowClick = (user) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('currentUserData', JSON.stringify(user.userData));
    }
    router.push('/userlist/details');
  };

  return (
    <div className="space-y-6">
      <TableWrapper
        data={usersListData}
        columns={visibleColumns}
        title="User List"
        renderCell={renderCell}
        itemsPerPage={pageSize}
        showPagination={true}
        ariaLabel="User list table"
        onRowClick={handleRowClick}
        // Search
        searchComponent={
          <SearchInput
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Search by name, email..."
          />
        }
        // Filters
        filterComponent={
          <FilterDropdown
            onFilterChange={handleFilterChange}
            campusOptions={campusOptions}
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
        // Server-side pagination
        serverPagination={true}
        paginationData={data?.pagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}
