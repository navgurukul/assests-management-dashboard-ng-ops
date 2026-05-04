'use client';

import React, { useState, useEffect } from 'react';
import { Eye, Users, ArrowLeftCircle } from 'lucide-react';
import StatusChip from '@/components/atoms/StatusChip';
import { getConditionChipColor } from '@/app/utils/statusHelpers';
import { useRouter } from 'next/navigation';
import TableWrapper from '@/components/Table/TableWrapper';
import StateHandler from '@/components/atoms/StateHandler';
import FilterDropdown from '@/components/molecules/FilterDropdown';
import ActiveFiltersChips from '@/components/molecules/ActiveFiltersChips';
import ColumnSelector from '@/components/molecules/ColumnSelector';
import SearchInput from '@/components/molecules/SearchInput';
import CustomButton from '@/components/atoms/CustomButton';
import useFetch from '@/app/hooks/query/useFetch';
import { useTableColumns } from '@/app/hooks/useTableColumns';
import { useFilterHandlers } from '@/app/hooks/useFilterHandlers';
import { usePersistentFilters } from '@/app/hooks/usePersistentFilters';
import {
  USER_TABLE_ID,
  userTableColumns,
  defaultVisibleColumns,
} from '@/app/config/tableConfigs/userTableConfig';

// ─── Helper ───────────────────────────────────────────────────────────────────

const formatRole = (role) => {
  if (!role) return 'N/A';
  return role.toUpperCase().replace(/_/g, ' ');
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function UsersList() {
  const router = useRouter();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Filters (persisted)
  const [filters, setFilters] = usePersistentFilters('users-filters', {});

  // Search
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Show All Users State
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [allUsersSearch, setAllUsersSearch] = useState('');
  const [debouncedAllUsersSearch, setDebouncedAllUsersSearch] = useState('');
  const [allUsersPage, setAllUsersPage] = useState(1);
  const [allUsersPageSize, setAllUsersPageSize] = useState(20);

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedAllUsersSearch(allUsersSearch);
      setAllUsersPage(1);
    }, 800);
    return () => clearTimeout(timer);
  }, [allUsersSearch]);

  // Build query string
  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.append('search', debouncedSearch);
    params.append('page', currentPage);
    params.append('limit', pageSize);
    if (filters.role) params.append('role', filters.role);
    return params.toString();
  };

  // Single API: fetch allocations with full user + asset details
  const { data, isLoading, isError, error } = useFetch({
    url: `/allocations/user-assets-details?${buildQueryString()}`,
    queryKey: ['userAssetsDetails', currentPage, pageSize, filters, debouncedSearch],
  });

  const { data: allUsersResponse, isLoading: isAllUsersLoading, isError: isAllUsersError, error: allUsersError } = useFetch({
    url: `/users?page=${allUsersPage}&limit=${allUsersPageSize}${debouncedAllUsersSearch ? `&search=${debouncedAllUsersSearch}` : ''}`,
    queryKey: ['allUsers', allUsersPage, allUsersPageSize, debouncedAllUsersSearch],
    enabled: showAllUsers,
  });

  // Pagination handlers
  const handlePageChange = (page) => setCurrentPage(page);
  const handlePageSizeChange = (size) => { setPageSize(size); setCurrentPage(1); };

  // Filter handlers
  const handleFilterChange = (newFilters) => { setFilters(newFilters); setCurrentPage(1); };
  
  // Uses custom hook for handling filter removal and clearing
  const { handleRemoveFilter, handleClearAllFilters } = useFilterHandlers(
    filters,
    setFilters,
    setCurrentPage
  );

  const getFilterLabel = (filterKey, value) => value;

  const getCategoryName = (filterKey) => {
    const names = { role: 'Role' };
    return names[filterKey] || filterKey;
  };

  const allUsersColumnsConfig = [
    { key: 'name', label: 'NAME', alwaysVisible: true },
    { key: 'email', label: 'EMAIL', alwaysVisible: true },
    { key: 'username', label: 'USERNAME' },
    { key: 'role', label: 'ROLE' },
    { key: 'department', label: 'DEPARTMENT' },
    { key: 'status', label: 'STATUS' },
    { key: 'createdAt', label: 'CREATED AT' },
  ];

  const allUsersListData = React.useMemo(() => {
    const users = allUsersResponse?.data;
    if (!Array.isArray(users)) return [];
    return users.map((user) => ({
      id: user.id,
      name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || 'N/A',
      email: user.email || 'N/A',
      username: user.username || 'N/A',
      role: formatRole(user.role),
      department: user.department || 'N/A',
      status: user.isActive ? 'Active' : 'Inactive',
      createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
      userData: user,
    }));
  }, [allUsersResponse]);

  const renderAllUsersCell = (item, columnKey) => {
    const cellValue = item[columnKey];
    switch (columnKey) {
      case 'name':
        return <span className="font-semibold text-gray-900">{cellValue}</span>;
      case 'email':
      case 'username':
        return <span className="text-blue-600 text-sm">{cellValue}</span>;
      case 'role':
        return <StatusChip value={cellValue} colorFn={() => 'bg-purple-100 text-purple-800'} />;
      case 'status':
        return <StatusChip value={cellValue} colorFn={(v) => v === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} />;
      default:
        return <span className="text-gray-700 text-sm">{cellValue ?? 'N/A'}</span>;
    }
  };

  // Transform allocation data into table rows
  const usersListData = React.useMemo(() => {
    const allocations = data?.data?.allocations;
    if (!Array.isArray(allocations)) return [];
    return allocations.map((alloc) => {
      const user = alloc.user || {};
      const asset = alloc.assets?.[0] || {};
      return {
        id: alloc.id,
        name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || 'N/A',
        email: user.email || 'N/A',
        role: formatRole(user.role),
        campus: user.campusId || 'N/A',
        phone: user.phone || 'N/A',
        department: user.department || 'N/A',
        location: user.location || 'N/A',
        // Asset fields
        assetTag: asset.assetTag || 'N/A',
        assetType: asset.specLabel || 'N/A',
        assetBrand: asset.brand || 'N/A',
        assetModel: asset.model || 'N/A',
        assetCondition: asset.condition || 'N/A',
        assetCampus: asset.campusId || 'N/A',
        assetSerialNumber: asset.serialNumber || 'N/A',
        // Allocation fields
        allocationDate: alloc.createdAt ? new Date(alloc.createdAt).toLocaleDateString() : 'N/A',
        allocationStatus: alloc.status || 'N/A',
        allocationReason: alloc.allocationReason || 'N/A',
        returnDate: alloc.expectedReturnDate ? new Date(alloc.expectedReturnDate).toLocaleDateString() : 'N/A',
        // Raw data reference
        userData: user,
      };
    });
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
        return cellValue && cellValue !== 'N/A' ? (
          <span className="font-mono text-sm font-medium text-gray-800">{cellValue}</span>
        ) : (
          <span className="text-gray-400 text-xs italic">Not Assigned</span>
        );

      case 'allocationDate':
      case 'returnDate':
        return <span className="text-gray-600 text-sm">{cellValue}</span>;

      // case 'actions':
      //   return (
      //     <button
      //       className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm"
      //       onClick={(e) => e.stopPropagation()}
      //     >
      //       <Eye className="w-4 h-4" />
      //       <span>View</span>
      //     </button>
      //   );

      default:
        return <span className="text-gray-700 text-sm">{cellValue ?? 'N/A'}</span>;
    }
  };

  // Handle loading and error states
  if (isError || (showAllUsers && isAllUsersError)) {
    return (
      <StateHandler
        isLoading={false}
        isError={true}
        error={showAllUsers ? allUsersError : error}
        loadingMessage="Loading users..."
        errorMessage="Error loading users"
      />
    );
  }

  const handleRowClick = (user) => {
    const userId = user.userData?.id;
    if (userId) {
      router.push(`/userlist/details?userId=${userId}`);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 flex flex-col">
      <TableWrapper
        data={showAllUsers ? allUsersListData : usersListData}
        columns={showAllUsers ? allUsersColumnsConfig : visibleColumns}
        title={showAllUsers ? "All Users List" : "User List - Assets Allocations"}
        renderCell={showAllUsers ? renderAllUsersCell : renderCell}
        itemsPerPage={showAllUsers ? allUsersPageSize : pageSize}
        showPagination={true}
        ariaLabel={showAllUsers ? "All users table" : "User list table"}
        onRowClick={handleRowClick}
        // Search
        searchComponent={
          showAllUsers ? (
            <SearchInput
              value={allUsersSearch}
              onChange={setAllUsersSearch}
              placeholder="Search by email, username, firstName, lastName, and department..."
            />
          ) : (
            <SearchInput
              value={searchInput}
              onChange={setSearchInput}
              placeholder="Search by name, email..."
            />
          )
        }
        // Filters
        filterComponent={
          <>
            <CustomButton
              text={showAllUsers ? 'Back to Allocations' : 'Show all user'}
              icon={showAllUsers ? ArrowLeftCircle : Users}
              onClick={() => setShowAllUsers(!showAllUsers)}
              variant={showAllUsers ? 'secondary' : 'warning'}
              size="md"
            />
            {!showAllUsers && (
              <FilterDropdown
                onFilterChange={handleFilterChange}
                selectedFilters={filters}
              />
            )}
          </>
        }
        // Column selector
        columnSelectorComponent={
          !showAllUsers && (
            <ColumnSelector
              allColumns={allColumns}
              visibleColumnKeys={visibleColumnKeys}
              alwaysVisibleColumns={alwaysVisibleColumns}
              onToggleColumn={toggleColumn}
              onShowAll={showAllColumns}
              onResetToDefault={resetToDefault}
            />
          )
        }
        // Active filter chips
        activeFiltersComponent={
          !showAllUsers && (
            <ActiveFiltersChips
              filters={filters}
              onRemoveFilter={handleRemoveFilter}
              onClearAll={handleClearAllFilters}
              getCategoryName={getCategoryName}
              getFilterLabel={getFilterLabel}
            />
          )
        }
        // Loading state
        isLoading={showAllUsers ? isAllUsersLoading : isLoading}
        // Pagination
        serverPagination={true}
        paginationData={showAllUsers ? allUsersResponse?.pagination : data?.data?.pagination}
        onPageChange={showAllUsers ? setAllUsersPage : handlePageChange}
        onPageSizeChange={showAllUsers ? (size) => { setAllUsersPageSize(size); setAllUsersPage(1); } : handlePageSizeChange}
      />
      </div>
    </div>
  );
}
