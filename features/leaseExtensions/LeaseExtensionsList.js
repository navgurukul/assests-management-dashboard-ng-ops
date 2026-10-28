'use client';

import { useState, useMemo } from 'react';
import { useAppSelector } from '@/app/store/hooks';
import { selectUserRole } from '@/app/store/slices/appSlice';
import { useAuth } from '@/app/context/AuthContext';
import { Check, X } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import FilterDropdown from '@/components/molecules/FilterDropdown';
import TableWrapper from '@/components/Table/TableWrapper';
import ActionMenu from '@/components/molecules/ActionMenu';
import FormModal from '@/components/molecules/FormModal';
import StateHandler from '@/components/atoms/StateHandler';
import StatusChip from '@/components/atoms/StatusChip';
import useFetch from '@/app/hooks/query/useFetch';
import apiService from '@/app/utils/apiService';
import config from '@/app/config/env.config';
import { toast } from '@/app/utils/toast';

const columns = [
  { key: 'requester', label: 'REQUESTED BY', align: 'start' },
  { key: 'asset', label: 'ASSET TAG', align: 'start' },
  { key: 'leaseType', label: 'LEASE TYPE', align: 'start' },
  { key: 'campus', label: 'CAMPUS', align: 'start' },
  { key: 'campusManager', label: 'CAMPUS MANAGER', align: 'start' },
  { key: 'extendUntil', label: 'EXTEND UNTIL', align: 'start' },
  { key: 'remark', label: 'REMARK', align: 'start' },
  { key: 'status', label: 'STATUS', align: 'start' },
  { key: 'actions', label: 'ACTIONS', align: 'center' },
];

const getRequestId = (request) => request.id || request.leaseExtensionId;

const getUserName = (user) => {
  if (!user) return 'Unknown';
  return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unknown';
};

const getRequesterName = (request) =>
  request.requesterName ||
  getUserName(
    request.requestedUser ||
    request.requestedBy ||
    request.requestedByUser ||
    request.requester ||
    request.requesterUser ||
    request.user ||
    request.createdBy
  );

const getAssetName = (request) => {
  const asset = request.asset || request.allocation?.asset;
  return request.assetTag || asset?.assetTag || asset?.name || asset?.serialNumber || 'N/A';
};

const getRequests = (response) => {
  const responseData = response?.data ?? response;
  if (Array.isArray(responseData)) return responseData;
  return responseData?.requests || responseData?.leaseExtensions || responseData?.items || [];
};

const getReviewFields = (actionType) => [
  ...(actionType === 'Approve'
    ? [{
        name: 'conditionCompleted',
        label: 'Bond/Deposit condition completed',
        type: 'checkbox',
        required: true,
        defaultValue: false,
        validation: (value) => value === true ? '' : 'Confirm that the bond/deposit condition is completed',
      }]
    : []),
  {
    name: 'remarks',
    label: 'Remarks',
    type: 'textarea',
    placeholder: `Enter remarks for ${actionType === 'Approve' ? 'approving' : 'rejecting'} this request...`,
    required: actionType === 'Reject',
    rows: 4,
  },
];

export default function LeaseExtensionsList() {
  const role = useAppSelector(selectUserRole);
  const { user } = useAuth();
  const isAdmin = role === 'ADMIN';
  const isCampusManager = role === 'CAMPUS_MANAGER';

  const [modalState, setModalState] = useState({ isOpen: false, actionType: null, request: null });
  const [processingId, setProcessingId] = useState(null);
  const [filters, setFilters] = useState({});

  const { data: campusInchargesResponse } = useFetch({
    url: config.endpoints.campusIncharge.list,
    queryKey: ['lease-request-campus-incharges'],
    enabled: isAdmin,
  });

  const campusIncharges = campusInchargesResponse?.data || campusInchargesResponse || [];

  const campusOptions = Array.isArray(campusIncharges)
    ? campusIncharges
        .map((campusIncharge) => ({
          value: campusIncharge.campusId || campusIncharge.campus?.id,
          label: campusIncharge.campusName || campusIncharge.campus?.campusName || 'Unknown campus',
        }))
        .filter((campusOption) => campusOption.value)
    : [];

  const campusId = isAdmin ? filters.campus : undefined;

  const leaseUrl = isAdmin
    ? `${config.endpoints.leaseExtensions.list}${campusId ? `?campusId=${campusId}` : ''}`
    : config.endpoints.leaseExtensions.byCampusManager(user?.id);

  const { data, isLoading, isError, error, refetch } = useFetch({
    url: leaseUrl,
    queryKey: ['lease-extension-requests', isAdmin ? 'admin' : user?.id, campusId],
    enabled: isAdmin || (isCampusManager && !!user?.id),
  });

  const { mutateAsync: reviewRequest, isPending: isSubmitting } = useMutation({
    mutationFn: ({ endpoint, body }) => apiService.patch(endpoint, body),
  });

  const requests = getRequests(data);

  const reviewFields = useMemo(
    () => (modalState.actionType ? getReviewFields(modalState.actionType) : []),
    [modalState.actionType]
  );

  const handleFilterChange = (nextFilters) => {
    setFilters(nextFilters);
  };

  const closeModal = () => {
    setModalState({ isOpen: false, actionType: null, request: null });
  };

  const handleSubmit = async (formData) => {
    const requestId = getRequestId(modalState.request);
    const actionType = modalState.actionType;

    if (!requestId || !actionType) {
      toast.error('Unable to process lease request. Missing request details.');
      return;
    }

    setProcessingId(requestId);
    try {
      await reviewRequest({
        endpoint: config.endpoints.leaseExtensions.review(requestId),
        body: {
          action: actionType === 'Approve' ? 'APPROVE' : 'REJECT',
          ...(actionType === 'Approve' ? { conditionCompleted: true } : {}),
          remarks: formData.remarks?.trim() || undefined,
        },
      });
      toast.success(`Lease request ${actionType === 'Approve' ? 'approved' : 'rejected'} successfully.`);
      closeModal();
      refetch();
    } catch (submitError) {
      toast.error(submitError?.message || 'Failed to update lease request.');
    } finally {
      setProcessingId(null);
    }
  };

  const renderCell = (request, columnKey) => {
    switch (columnKey) {
      case 'requester':
        return <span className="text-gray-700">{getRequesterName(request)}</span>;
      case 'asset':
        return <span className="font-medium text-(--theme-main)">{getAssetName(request)}</span>;
      case 'leaseType':
        return <span className="text-gray-700">{request.leaseType || 'N/A'}</span>;
      case 'campus': {
        const campusName = request.campus?.campusName || 'N/A';
        const campusCode = request.campus?.campusCode;
        return <span className="text-gray-700">{campusCode ? `${campusName} (${campusCode})` : campusName}</span>;
      }
      case 'campusManager': {
        const manager = request.campusManager;
        return <span className="text-gray-700">{manager ? getUserName(manager) : 'N/A'}</span>;
      }
      case 'extendUntil':
        return <span className="text-gray-500">{request.extendUntil ? new Date(`${request.extendUntil}T00:00:00`).toLocaleDateString('en-IN') : 'N/A'}</span>;
      case 'remark':
        return <span className="text-gray-700 max-w-xs block truncate">{request.remark || request.description || 'N/A'}</span>;
      case 'status':
        return <StatusChip value={request.status || 'PENDING'} />;
      case 'actions':
        if (request.status !== 'PENDING') return null; 
        return (
          <div onClick={(event) => event.stopPropagation()}>
            <ActionMenu
              menuOptions={[
                {
                  label: 'Approve',
                  icon: Check,
                  iconClassName: 'text-green-600',
                  onClick: () => setModalState({ isOpen: true, actionType: 'Approve', request }),
                },
                {
                  label: 'Reject',
                  icon: X,
                  iconClassName: 'text-red-600',
                  onClick: () => setModalState({ isOpen: true, actionType: 'Reject', request }),
                },
              ]}
              disabled={processingId === getRequestId(request)}
            />
          </div>
        );
      default:
        return request[columnKey];
    }
  };

  if (isLoading) {
    return <StateHandler isLoading loadingMessage="Loading lease requests..." />;
  }

  if (isError) {
    return <StateHandler isError error={error} errorMessage="Failed to load lease requests" />;
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <FormModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        componentName={getAssetName(modalState.request || {})}
        actionType={modalState.actionType || ''}
        fields={reviewFields}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        helpText={modalState.request?.remark || modalState.request?.description || ''}
      />
      <TableWrapper
        data={requests}
        columns={columns}
        margin="m-0"
        shadow="shadow-none"
        title={`Lease Requests (${requests.length})`}
        renderCell={renderCell}
        filterComponent={
          isAdmin ? (
            <FilterDropdown
              campusOptions={campusOptions}
              campusLabel="Campus"
              selectedFilters={filters}
              onFilterChange={handleFilterChange}
            />
          ) : undefined
        }
        showPagination
        itemsPerPage={10}
        ariaLabel="Lease extension requests table"
        // emptyContent={<StateHandler isEmpty emptyMessage="No pending lease requests" />}
        emptyContent={<StateHandler isEmpty emptyMessage="No lease requests found" />}
      />
    </div>
  );
}
