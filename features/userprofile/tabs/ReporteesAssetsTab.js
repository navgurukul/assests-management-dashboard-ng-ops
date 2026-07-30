'use client';

import { useState, useMemo } from 'react';
import { ChevronRight, Users, Package, User } from 'lucide-react';
import StateHandler from '@/components/atoms/StateHandler';
import StatusChip from '@/components/atoms/StatusChip';
import TableWrapper from '@/components/Table/TableWrapper';
import useFetch from '@/app/hooks/query/useFetch';
import config from '@/app/config/env.config';
import { getStatusChipColor, getConditionChipColor } from '@/app/utils/statusHelpers';

const assetColumns = [
  { key: 'assetTag',       label: 'ASSET TAG' },
  { key: 'assetTypeName',  label: 'TYPE' },
  { key: 'brand',          label: 'BRAND' },
  { key: 'model',          label: 'MODEL' },
  { key: 'serialNumber',   label: 'SERIAL NO.' },
  { key: 'status',         label: 'STATUS' },
  { key: 'condition',      label: 'CONDITION' },
  { key: 'campusName',     label: 'CAMPUS' },
  { key: 'allocationDate', label: 'ALLOCATED ON' },
];

export default function ReporteesAssetsTab() {
  const [selectedAssigneeId, setSelectedAssigneeId] = useState(null);

  // Fetch logged-in user to get their ID as managerId
  const { data: userMeResponse, isLoading: isLoadingMe } = useFetch({
    url: config.endpoints.user.me,
    queryKey: ['userMe'],
  });
  const managerId = userMeResponse?.data?.id || userMeResponse?.id || null;

  const {
    data: apiResponse,
    isLoading: isLoadingAssignees,
    isError,
    error,
  } = useFetch({
    url: config.endpoints.users.managerAssets(managerId),
    queryKey: ['manager-assignees-assets', managerId],
    enabled: !!managerId,
  });

  const assignees = useMemo(() => {
    return apiResponse?.data?.assignees || [];
  }, [apiResponse]);

  const isLoading = isLoadingMe || isLoadingAssignees;

  // Auto-select first assignee when data loads
  const activeAssigneeId = selectedAssigneeId ?? assignees[0]?.id ?? null;
  const selectedAssignee = assignees.find((a) => a.id === activeAssigneeId);

  // Flatten allocations → rows: one row per asset inside each allocation
  const tableRows = useMemo(() => {
    if (!selectedAssignee?.allocations) return [];
    const rows = [];
    for (const allocation of selectedAssignee.allocations) {
      const assets = allocation.assets || [];
      if (assets.length === 0) {
        // allocation exists but no asset — show a placeholder row
        rows.push({
          id: allocation.id,
          assetTag: '—',
          assetTypeName: '—',
          brand: '—',
          model: '—',
          serialNumber: '—',
          status: allocation.status || '—',
          condition: '—',
          campusName: '—',
          allocationDate: allocation.createdAt
            ? new Date(allocation.createdAt).toLocaleDateString('en-IN')
            : '—',
        });
      } else {
        for (const asset of assets) {
          rows.push({
            id: `${allocation.id}-${asset.id}`,
            assetTag: asset.assetTag || '—',
            assetTypeName: asset.assetTypeName || '—',
            brand: asset.brand || '—',
            model: asset.model || '—',
            serialNumber: asset.serialNumber || '—',
            status: asset.status || allocation.status || '—',
            condition: asset.condition || '—',
            campusName: asset.campusName || '—',
            allocationDate: allocation.createdAt
              ? new Date(allocation.createdAt).toLocaleDateString('en-IN')
              : '—',
          });
        }
      }
    }
    return rows;
  }, [selectedAssignee]);

  const totalAssets = useMemo(() => {
    if (!selectedAssignee?.allocations) return 0;
    return selectedAssignee.allocations.reduce(
      (sum, alloc) => sum + (alloc.assets?.length || 0),
      0
    );
  }, [selectedAssignee]);

  const renderCell = (row, columnKey) => {
    switch (columnKey) {
      case 'assetTag':
        return (
          <span className="font-mono text-sm font-medium text-(--theme-main)">
            {row.assetTag}
          </span>
        );
      case 'status':
        return row.status && row.status !== '—' ? (
          <StatusChip value={row.status} colorFn={getStatusChipColor} />
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        );
      case 'condition':
        return row.condition && row.condition !== '—' ? (
          <StatusChip value={row.condition} colorFn={getConditionChipColor} />
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        );
      case 'allocationDate':
        return <span className="text-sm text-gray-600">{row.allocationDate}</span>;
      default:
        return <span className="text-sm text-gray-700">{row[columnKey]}</span>;
    }
  };

  if (isLoading || isError) {
    return (
      <StateHandler
        isLoading={isLoading}
        isError={isError}
        error={error}
        loadingMessage="Loading reportees..."
        errorMessage="Failed to load reportees data"
        className="h-64"
      />
    );
  }

  if (assignees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-(--muted)">
        <Users className="w-10 h-10 mb-3 opacity-30" />
        <p className="text-sm">No reportees assigned to you</p>
      </div>
    );
  }

  const getFullName = (assignee) =>
    [assignee.firstName, assignee.lastName].filter(Boolean).join(' ') ||
    assignee.username ||
    'Unknown';

  // Count allocations per assignee for sidebar label
  const getAllocationCount = (assignee) => {
    const allocations = assignee.allocations || [];
    const assetCount = allocations.reduce(
      (sum, alloc) => sum + (alloc.assets?.length || 0),
      0
    );
    return assetCount;
  };

  return (
    <div className="flex gap-4 min-h-[400px]">
      {/* Reportees Sidebar */}
      <div className="w-56 shrink-0 border border-(--border) rounded-lg overflow-hidden bg-(--surface)">
        <div className="px-3 py-2.5 border-b border-(--border) bg-(--surface-soft)">
          <p className="text-xs font-semibold text-(--muted) uppercase tracking-wide">
            Reportees ({assignees.length})
          </p>
        </div>
        <ul className="divide-y divide-(--border)">
          {assignees.map((assignee) => (
            <li key={assignee.id}>
              <button
                onClick={() => setSelectedAssigneeId(assignee.id)}
                className={`w-full flex items-center justify-between px-3 py-3 text-left transition-colors ${
                  activeAssigneeId === assignee.id
                    ? 'bg-(--theme-main)/10 text-(--theme-main)'
                    : 'hover:bg-(--surface-soft) text-foreground'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <User className="w-4 h-4 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{getFullName(assignee)}</p>
                    <p className="text-xs text-(--muted)">
                      {getAllocationCount(assignee)} asset
                      {getAllocationCount(assignee) !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  className={`w-3 h-3 shrink-0 ml-1 transition-transform ${
                    activeAssigneeId === assignee.id ? 'rotate-90' : ''
                  }`}
                />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Assets Panel */}
      <div className="flex-1 min-w-0">
        {selectedAssignee ? (
          <>
            {/* Assignee Header */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  {getFullName(selectedAssignee)}
                </h2>
                <p className="text-xs text-(--muted) mt-0.5">
                  {selectedAssignee.email}
                  {selectedAssignee.campus?.campusName
                    ? ` · ${selectedAssignee.campus.campusName}`
                    : ''}
                  {selectedAssignee.location ? ` · ${selectedAssignee.location}` : ''}
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold border border-(--theme-light) bg-(--surface-soft) text-(--theme-main)">
                {selectedAssignee.role?.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Assets Table */}
            {tableRows.length > 0 ? (
              <TableWrapper
                data={tableRows}
                columns={assetColumns}
                renderCell={renderCell}
                showPagination={tableRows.length > 10}
                margin="m-0"
                shadow="shadow-none"
                title={
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Allocated Assets
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                      {totalAssets}
                    </span>
                  </div>
                }
                ariaLabel={`Assets table for ${getFullName(selectedAssignee)}`}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-(--muted)">
                <Package className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">No assets allocated to this user</p>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-(--muted)">
            <Users className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">Select a reportee to view their assets</p>
          </div>
        )}
      </div>
    </div>
  );
}
