"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { Laptop, Monitor, Tablet, Smartphone, Package } from 'lucide-react';
import { setSelectedTicket } from '@/app/store/slices/ticketSlice';
import { selectUserRole } from '@/app/store/slices/appSlice';
import DetailsPage from '@/components/molecules/DetailsPage';
import Modal from '@/components/molecules/Modal';
import FormModal from '@/components/molecules/FormModal';
import GenericForm from '@/components/molecules/GenericForm';
import StateHandler from '@/components/atoms/StateHandler';
import SLAIndicator from '@/components/molecules/SLAIndicator';
import CustomButton from '@/components/atoms/CustomButton';
import AssigneeSelector from './AssigneeSelector';
import { getTicketLeftSections, getTicketRightSections } from './ticketSections';
import config from '@/app/config/env.config';
import { toast } from '@/app/utils/toast';
import apiService from '@/app/utils/apiService';
import useFetch from '@/app/hooks/query/useFetch';
import usePut from '@/app/hooks/query/usePut';
import { useQueryClient } from '@tanstack/react-query';
import {
  ticketUpdateFormFields,
  ticketUpdateValidationSchema,
} from '@/app/config/formConfigs/ticketUpdateFormConfig';

export default function TicketDetails({ ticketId, ticketData, onBack, isLoading, isError, error }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const loggedInUserRole = useSelector(selectUserRole);
  const queryClient = useQueryClient();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState(null);
  const [showAssignTable, setShowAssignTable] = useState(false);
  const [assetModalAction, setAssetModalAction] = useState(null); // 'REPAIR' | 'SCRAP' | null
  const [isAssetSubmitting, setIsAssetSubmitting] = useState(false);

    const loggedInEmail = React.useMemo(() => {
    try {
      const auth = JSON.parse(localStorage.getItem('__AUTH__') || '{}');
      return auth?.user?.email || null;
    } catch {
      return null;
    }
  }, []);

  const { mutateAsync: updateTicket, isPending: isSubmitting } = usePut({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-details', ticketId] });
    },
  });

  const { data: campusInchargeData, isLoading: campusInchargeLoading } = useFetch({
    url: config.getApiUrl(config.endpoints.campusIncharge.list),
    queryKey: ['campus-incharge'],
  });

  const { data: myAssetsData } = useFetch({
    url: config.endpoints.allocations.myAssets,
    queryKey: ['myAssets'],
  });

  const { data: assetTypesData } = useFetch({
    url: '/asset-types',
    queryKey: ['asset-types'],
  });

  const assetTypeMap = React.useMemo(() => {
    const map = {};
    (assetTypesData?.data || []).forEach((t) => { map[t.id] = t.name; });
    return map;
  }, [assetTypesData]);

  const assetGroupCounts = React.useMemo(() => {
    const assets = myAssetsData?.data?.assets ?? myAssetsData?.assets ?? [];
    const counts = {};
    assets.forEach((asset) => {
      const typeName = assetTypeMap[asset.assetTypeId] || asset.brand || 'Other';
      counts[typeName] = (counts[typeName] || 0) + 1;
    });
    return Object.entries(counts);
  }, [myAssetsData, assetTypeMap]);

  // Flatten campus-incharge data into individual people rows, deduplicated by email
  const assigneeRows = React.useMemo(() => {
    const list = campusInchargeData?.data;
    if (!Array.isArray(list)) return [];
    const seen = new Set();
    const rows = [];
    list.forEach((campus) => {
      const roleEntries = [
        { person: campus.itCoordinator, position: 'IT Coordinator' },
        { person: campus.operation,      position: 'Operation'       },
        { person: campus.itLead,         position: 'IT Lead'         },
      ];
      roleEntries.forEach(({ person, position }) => {
        if (person?.email && !seen.has(person.email)) {
          seen.add(person.email);
          rows.push({
            id:       person?.user?.id,
            email:    person.email,
            name:     person.name  || '—',
            phone:    person.phone || '—',
            position,
            campus:   campus.campusName || '—',
          });
        }
      });
    });
    return rows;
  }, [campusInchargeData]);

  if (isLoading) {
    return (
      <StateHandler
        isLoading={true}
        loadingMessage="Loading ticket details..."
      />
    );
  }

  if (isError) {
    return (
      <StateHandler
        isError={true}
        error={error}
        errorMessage="Error loading ticket details"
      />
    );
  }

  if (!ticketData) {
    return (
      <StateHandler
        isLoading={false}
        isError={false}
        isEmpty={true}
        emptyMessage="Ticket not found"
      />
    );
  }

  const ticket = ticketData;

  const historyLogs = ticket.historyLogs || [];

  const formatHistoryDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year}, ${hours}:${mins}`;
  };

  const statusBadgeClass = (status) => {
    switch ((status || '').toUpperCase()) {
      case 'APPROVED':  return 'bg-green-100 text-green-700 border-green-200';
      case 'RAISED':    return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'RESOLVED':  return 'bg-teal-100 text-teal-700 border-teal-200';
      case 'ESCALATED': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'CLOSED':    return 'bg-gray-100 text-gray-600 border-gray-200';
      default:          return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const dotColorClass = (status) => {
    switch ((status || '').toUpperCase()) {
      case 'APPROVED':  return 'bg-green-500 border-green-300';
      case 'RAISED':    return 'bg-blue-500 border-blue-300';
      case 'RESOLVED':  return 'bg-teal-500 border-teal-300';
      case 'ESCALATED': return 'bg-orange-500 border-orange-300';
      case 'CLOSED':    return 'bg-gray-400 border-gray-300';
      default:          return 'bg-gray-400 border-gray-300';
    }
  };

  const historyTimeline = historyLogs.length > 0 ? (
    <div className="relative">
      {historyLogs.map((log, idx) => (
        <div key={idx} className="flex gap-4 relative min-w-0 overflow-hidden">
          {/* Vertical line + dot */}
          <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full border-2 mt-1 shrink-0 z-10 ${dotColorClass(log.status)}`} />
            {idx < historyLogs.length - 1 && (
              <div className="w-0.5 bg-gray-200 flex-1 my-1" />
            )}
          </div>

          {/* Card */}
          <div className={`mb-4 flex-1 min-w-0 overflow-hidden rounded-lg border p-3 bg-white shadow-sm ${idx < historyLogs.length - 1 ? '' : ''}`}>
            <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-800">
                  {log.performedByUser?.firstName || '—'}
                </span>
              </div>
              {log.status && (
                <span className={`text-[10px] font-semibold px-1.5 py-px rounded border leading-tight ${statusBadgeClass(log.status)}`}>
                  {log.status}
                </span>
              )}
            </div>
            {log.resolutionNotes && (
              <p className="text-sm text-gray-600 mb-1 line-clamp-3 break-all cursor-default" title={log.resolutionNotes}>{log.resolutionNotes}</p>
            )}
            {(log.notes) && (
              <p className="text-sm text-gray-600 mb-1 line-clamp-3 break-all cursor-default" title={log.notes}>{log.notes}</p>
            )}
            <p className="text-xs text-gray-400">{formatHistoryDate(log.createdAt)}</p>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="text-sm text-gray-600">No history for this ticket.</div>
  );

  const handleUpdateClick = () => {
    setSelectedAssignee(null);
    setShowAssignTable(false);
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSubmit = async (values, overrideStatus = null) => {
    if (ticket.ticketType?.toUpperCase() !== 'REPAIR' && !selectedAssignee) {
      toast.warning('Please select an assignee before submitting.');
      return;
    }

    if (!values.adminComment?.trim()) {
      toast.warning('Comment is required.');
      return;
    }

    const payload = {};
    const apiFields = ['status', 'timelineDate', 'resolutionNotes', 'description'];
    apiFields.forEach((key) => {
      const val = key === 'status' && overrideStatus ? overrideStatus : values[key];
      if (val !== '' && val !== null && val !== undefined) {
        payload[key] = val;
      }
    });
    if (values.adminComment?.trim()) {
      payload.comment = values.adminComment;
    }

    if (selectedAssignee) {
      payload.assigneeUserId = selectedAssignee.id || selectedAssignee.email;
    }

    if (Object.keys(payload).length === 0) {
      toast.warning('Please update at least one field.');
      return;
    }

    try {
      await updateTicket({
        endpoint: config.endpoints.tickets.update(ticketId),
        body: payload,
      });

      toast.success('Ticket updated successfully!');
      setIsUpdateModalOpen(false);
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast.error(error?.message || 'Failed to update ticket. Please try again.');
    }
  };

  const handleCloseModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedAssignee(null);
    setShowAssignTable(false);
  };

  const handleResolvedClick = (values) => {
    handleUpdateSubmit(values, 'RESOLVED');
  };

  const handleEscalationClick = async (values) => {
    try {
      const payload = {
        status: 'ESCALATED',
        ...(values.timelineDate && { timelineDate: values.timelineDate }),
        ...(values.adminComment?.trim() && { comment: values.adminComment.trim() }),
      };

      await updateTicket({
        endpoint: config.endpoints.tickets.update(ticketId),
        body: payload,
      });

      toast.success('Ticket escalated successfully!');
      setIsUpdateModalOpen(false);
    } catch (error) {
      console.error('Error escalating ticket:', error);
      toast.error(error?.message || 'Failed to escalate ticket. Please try again.');
    }
  };

  const updateInitialValues = {
    status: ticket.status || '',
    description: ticket.description || '',
    resolutionNotes: ticket.resolutionNotes || '',
    timelineDate: ticket.timelineDate ? new Date(ticket.timelineDate).toISOString().split('T')[0] : '',
    adminComment: ticket.adminComment || '',
  };

  const updateFormFieldsModified = ticketUpdateFormFields.map(field => {
    if (field.name === 'timelineDate' && ticket.timelineDate) {
      return {
        ...field,
        disabled: true,
        helperText: 'Timeline is already set and cannot be changed.',
      };
    }
    return field;
  });

  const handleAssetStatusUpdate = async (formData) => {
    const assetId = ticket.asset?.id || ticket.assetId;
    if (!assetId) {
      toast.error('Asset ID not found');
      return;
    }

    setIsAssetSubmitting(true);
    try {
      if (assetModalAction === 'REPAIR') {
        await apiService.post(config.endpoints.assets.repair(assetId), {
          reasonForRepair: formData.description,
        });
        toast.success('Asset moved to repair successfully.');
      } else if (assetModalAction === 'SCRAP') {
        await apiService.post(config.endpoints.assets.scrap(assetId), {
          reasonForScrapping: formData.description,
        });
        toast.success('Asset marked as scrap successfully.');
      }
      setAssetModalAction(null);
      queryClient.invalidateQueries({ queryKey: ['ticket-details', ticketId] });
    } catch (error) {
      toast.error(error?.message || 'Failed to update asset status. Please try again.');
    } finally {
      setIsAssetSubmitting(false);
    }
  };

  const onMarkAsScrap = () => {
    setAssetModalAction('SCRAP');
  };

  const onMoveToRepair = () => {
    setAssetModalAction('REPAIR');
  };

  const hasAsset = !!(ticket.assetId || ticket.asset);
  const assigneeEmail = ticket.assigneeUser?.email;
  const isAssigneeCurrentUser = !!(loggedInEmail && assigneeEmail && loggedInEmail === assigneeEmail);

  const leftSections = getTicketLeftSections(ticket, historyTimeline);
  const rightSections = getTicketRightSections(ticket, hasAsset, onMarkAsScrap, onMoveToRepair, loggedInUserRole);

  const handleCreateAllocation = () => {
    dispatch(setSelectedTicket({ ...ticket, id: ticket?.id || ticketId }));
    router.push(`/allocations/create?ticketId=${ticket?.id || ticketId}`);
  }

  const isStudentOrEmployee = loggedInUserRole === 'STUDENT' || loggedInUserRole === 'EMPLOYEE';

  return (
    <>
      <DetailsPage
        title={`Ticket: ${ticket.ticketNumber || ticket.id}`}
        subtitle={`Created: ${ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : '—'}`}
        leftSections={leftSections}
        rightSections={rightSections}
        rightGrid={true}
        onBack={onBack}
        headerActions={
          <div className="flex items-center gap-3 flex-wrap">
            {assetGroupCounts.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {assetGroupCounts.map(([typeName, count]) => (
                  <div
                    key={typeName}
                    className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5"
                  >
                    <Package className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-700">
                      {typeName}: {count}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {!isStudentOrEmployee && (
              <>
                <CustomButton
                  text="Update Ticket"
                  variant="secondary"
                  size="md"
                  onClick={handleUpdateClick}
                  disabled={ticket.status !== 'APPROVED' && ticket.status !== 'ESCALATED'}
                />
                {ticket.status === 'APPROVED' && ticket.ticketType?.toUpperCase() !== 'REPAIR' ? (
                   isAssigneeCurrentUser ? (
                    <CustomButton
                      text="Create Allocation"
                      variant="primary"
                      size="md"
                      onClick={handleCreateAllocation}
                    />
                  ) : (
                    <span className="text-[10px] text-gray-500">
                      Only &apos;{ticket.assigneeUser ? `${ticket.assigneeUser.firstName} ${ticket.assigneeUser.lastName}`.trim() : 'the assignee'}&apos; can create the allocation
                    </span>
                  )
                ) : ticket.status === 'RAISED' ? (
                  <CustomButton
                    text="Ticket is not approved"
                    variant="warning"
                    size="md"
                    className="border-orange-500 text-orange-500 bg-orange-50 hover:bg-orange-100 cursor-default"
                    onClick={() => {}}
                    title="Please contact your manager"
                  />
                ) : null}
              </>
            )}
          </div>
        }
      />

      <Modal
        isOpen={isUpdateModalOpen}
        onClose={handleCloseModal}
        title="Update Ticket"
        size="large"
      >
        {ticket.ticketType?.toUpperCase() !== 'REPAIR' && (
          <>
            {ticket.assigneeUser && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <span className="font-medium">Currently Assigned To:</span> {ticket.assigneeUser.firstName} {ticket.assigneeUser.lastName}
                </p>
              </div>
            )}

            <AssigneeSelector
              selectedAssignee={selectedAssignee}
              setSelectedAssignee={setSelectedAssignee}
              showAssignTable={showAssignTable}
              setShowAssignTable={setShowAssignTable}
              assigneeRows={assigneeRows}
              campusInchargeLoading={campusInchargeLoading}
            />
          </>
        )}

        <GenericForm
          fields={updateFormFieldsModified}
          initialValues={updateInitialValues}
          validationSchema={ticketUpdateValidationSchema}
          onSubmit={handleUpdateSubmit}
          onCancel={handleCloseModal}
          isSubmitting={isSubmitting}
          submitButtonText="Update Ticket"
          cancelButtonText="Cancel"
          customActions={[
            { label: isSubmitting ? 'Processing...' : 'Update Ticket', variant: 'primary', onClick: (values) => handleUpdateSubmit(values), disabled: isSubmitting || (ticket.ticketType?.toUpperCase() !== 'REPAIR' && !selectedAssignee) },
            ...(ticket.ticketType?.toLowerCase() === 'repair' ? [
              { label: isSubmitting ? 'Processing...' : 'Resolved', variant: 'success', onClick: handleResolvedClick, disabled: isSubmitting },
              { label: isSubmitting ? 'Processing...' : 'Escalation', variant: 'warning', onClick: handleEscalationClick, disabled: isSubmitting },
            ] : []),
          ]}
        />
      </Modal>

      <FormModal
        isOpen={!!assetModalAction}
        onClose={() => setAssetModalAction(null)}
        title={assetModalAction === 'REPAIR' ? 'Move Asset to Repair' : 'Mark Asset as Scrap'}
        fields={[
          {
            name: 'description',
            label: assetModalAction === 'REPAIR' ? 'Reason for Repair' : 'Reason for Scrapping',
            type: 'textarea',
            required: true,
            placeholder: assetModalAction === 'REPAIR' 
              ? 'Describe the issue or reason this asset needs repair...' 
              : 'Describe why this asset is being scrapped...',
          },
        ]}
        initialValues={{ description: '' }}
        onSubmit={handleAssetStatusUpdate}
        isSubmitting={isAssetSubmitting}
      />
    </>
  );
}
