"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { Laptop, Monitor, Tablet, Smartphone, Package } from 'lucide-react';
import { setSelectedTicket } from '@/app/store/slices/ticketSlice';
import DetailsPage from '@/components/molecules/DetailsPage';
import Modal from '@/components/molecules/Modal';
import GenericForm from '@/components/molecules/GenericForm';
import StateHandler from '@/components/atoms/StateHandler';
import SLAIndicator from '@/components/molecules/SLAIndicator';
import CustomButton from '@/components/atoms/CustomButton';
import post from '@/app/api/post/post';
import config from '@/app/config/env.config';
import { toast } from '@/app/utils/toast';
import useFetch from '@/app/hooks/query/useFetch';
import { useQueryClient } from '@tanstack/react-query';
import {
  ticketUpdateFormFields,
  ticketUpdateValidationSchema,
} from '@/app/config/formConfigs/ticketUpdateFormConfig';

export default function TicketDetails({ ticketId, ticketData, onBack, isLoading, isError, error }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState(null);
  const [showAssignTable, setShowAssignTable] = useState(false);

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
              <p className="text-sm text-gray-600 mb-1 line-clamp-2 break-all cursor-default" title={log.resolutionNotes}>{log.resolutionNotes}</p>
            )}
            {(log.notes) && (
              <p className="text-sm text-gray-600 mb-1 line-clamp-2 break-all cursor-default" title={log.notes}>{log.notes}</p>
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
    setIsSubmitting(true);

    if (!selectedAssignee) {
      toast.warning('Please select an assignee before submitting.');
      setIsSubmitting(false);
      return;
    }

    if (!values.adminComment?.trim()) {
      toast.warning('Admin comment is required.');
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {};
      const apiFields = ['status', 'timelineDate', 'resolutionNotes', 'description', 'adminComment'];
      apiFields.forEach((key) => {
        const val = key === 'status' && overrideStatus ? overrideStatus : values[key];
        if (val !== '' && val !== null && val !== undefined) {
          payload[key] = val;
        }
      });

      if (selectedAssignee) {
        payload.assigneeUserId = selectedAssignee.id || selectedAssignee.email;
      }

      if (Object.keys(payload).length === 0) {
        toast.warning('Please update at least one field.');
        setIsSubmitting(false);
        return;
      }

      await post({
        url: config.getApiUrl(config.endpoints.tickets.update(ticketId)),
        method: 'PUT',
        data: payload,
      });

      toast.success('Ticket updated successfully!');
      setIsUpdateModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['ticket-details', ticketId] });

    } catch (error) {
      console.error('Error updating ticket:', error);
      toast.error(error?.message || 'Failed to update ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
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

  const handleEscalationClick = (values) => {
    handleUpdateSubmit(values, 'ESCALATED');
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
        helperText: 'SLA timeline is already set and cannot be changed.',
      };
    }
    return field;
  });

  const hasAsset = !!(ticket.assetId || ticket.asset);

  const leftSections = [
    {
      title: 'SLA / TIMELINE',
      color: 'orange',
      content: (
        <SLAIndicator 
          allocationDate={ticket.assignDate}
          expectedResolutionDate={ticket.timelineDate}
          status={ticket.status}
          compact={false}
        />
      ),
    },
    {
      title: 'HISTORY LOG',
      color: 'gray',
      content: historyTimeline,
    },
  ];

  const rightSections = [
    {
      title: 'TICKET INFO',
      color: 'blue',
      itemsGrid: true,
      items: [
        { label: 'Ticket ID', value: ticket.ticketNumber || '—' },
        { label: 'Ticket Type', value: ticket.ticketType || '—' },
        { label: 'Priority', value: ticket.priority || '—' },
        { label: 'Status', value: ticket.status || '—' },
        { label: 'Is Escalated', value: ticket.isEscalated ? 'Yes' : 'No' },
        { label: 'Manager Email', value: ticket.managerEmail || '—' },
        { label: 'Address', value: ticket.address || '—', className: 'col-span-2 line-clamp-2 break-all', title: ticket.address || undefined },
        { label: 'Description', value: ticket.description || '—', className: 'col-span-2 line-clamp-2 break-all', title: ticket.description || undefined },
        { label: 'Resolution Notes', value: ticket.resolutionNotes || '—', className: 'col-span-2 line-clamp-2' },
      ],
    },
    {
      title: 'CAMPUS INFO',
      color: 'teal',
      itemsGrid: true,
      items: [
        { label: 'Campus', value: ticket.campus?.name || ticket.campusId || '—' },
        { label: 'Campus Code', value: ticket.campus?.code || '—' },
        { label: 'Campus ID', value: ticket.campus?.id || ticket.campusId || '—' },
        { label: 'Campus Name', value: ticket.campus?.name || '—' },
      ],
    },
    {
      title: 'RAISED BY',
      color: 'green',
      items: [
        { label: 'Name', value: ticket.raisedByUser ? `${ticket.raisedByUser.firstName} ${ticket.raisedByUser.lastName}`.trim() : '—' },
        { label: 'Role', value: ticket.raisedByUser?.role || '—' },
        { label: 'Email', value: ticket.raisedByUser?.email || '—' },
      ],
    },
    {
      title: 'ASSIGNEE',
      color: 'purple',
      items: [
        { label: 'Assigned To', value: ticket.assigneeUser ? `${ticket.assigneeUser.firstName} ${ticket.assigneeUser.lastName}`.trim() : (ticket.assigneeName || '—') },
        { label: 'Username', value: ticket.assigneeUser?.username || '—' },
        { label: 'Role', value: ticket.assigneeUser?.role || '—' },
        { label: 'Email', value: ticket.assigneeUser?.email || '—' },
      ],
    },
    {
      title: 'DATES',
      color: 'indigo',
      span: hasAsset ? 1 : 2,
      itemsGrid: true,
      items: [
        { label: 'Raised On', value: ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : '—' },
        { label: 'Last Updated On', value: ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleString() : '—' },
        { label: 'Assignment Date', value: ticket.assignDate ? new Date(ticket.assignDate).toLocaleString() : '—' },
        { label: 'Timeline Date', value: ticket.timelineDate ? new Date(ticket.timelineDate).toLocaleString() : '—' },
        { label: 'Resolved On', value: ticket.resolvedAt ? new Date(ticket.resolvedAt).toLocaleString() : '—' },
        { label: 'Closed On', value: ticket.closedAt ? new Date(ticket.closedAt).toLocaleString() : '—' },
      ],
    },
    ...(hasAsset ? [{
      title: 'ASSET / DEVICE',
      color: 'gray',
      itemsGrid: true,
      items: [
        { label: 'Asset Tag', value: ticket.asset?.assetTag || ticket.assetId || '—' },
        { label: 'Brand', value: ticket.asset?.brand || '—' },
        { label: 'Location', value: ticket.asset?.location?.name || '—' },
        { label: 'Condition', value: ticket.asset?.condition || '—' },
      ],
    }] : []),
  ];

  const handleCreateAllocation = () => {
    dispatch(setSelectedTicket({ ...ticket, id: ticket?.id || ticketId }));
    router.push(`/allocations/create?ticketId=${ticket?.id || ticketId}`);
  }

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
          <div className="flex items-center gap-3">
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
            {ticket.status === 'APPROVED' && (
              <CustomButton
                text="Update Ticket"
                variant="secondary"
                size="md"
                onClick={handleUpdateClick}
              />
            )}
            {ticket.status === 'APPROVED' ? (
              <CustomButton
                text="Create Allocation"
                variant="primary"
                size="md"
                onClick={handleCreateAllocation}
                disabled={!ticket.assigneeUser?.email}
                title={!ticket.assigneeUser?.email ? 'Ticket must be assigned before creating an allocation' : undefined}
              />
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
          </div>
        }
      />

      <Modal
        isOpen={isUpdateModalOpen}
        onClose={handleCloseModal}
        title="Update Ticket"
        size="large"
      >
        {ticket.assigneeUser && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <span className="font-medium">Currently Assigned To:</span> {ticket.assigneeUser.firstName} {ticket.assigneeUser.lastName}
            </p>
          </div>
        )}

        {/* Assign To — selection table */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">Assign To</p>
            <CustomButton
              text={showAssignTable ? 'Hide' : 'Select Assignee'}
              variant={showAssignTable ? 'secondary' : 'primary'}
              size="sm"
              onClick={() => setShowAssignTable((prev) => !prev)}
            />
          </div>
          {selectedAssignee && (
            <p className="text-xs text-blue-700 mb-2">
              Selected: <span className="font-medium">{selectedAssignee.name} ({selectedAssignee.email})</span>
            </p>
          )}
          {showAssignTable && (
            campusInchargeLoading ? (
              <div className="text-sm text-gray-500 py-2">Loading...</div>
            ) : assigneeRows.length === 0 ? (
              <div className="text-sm text-gray-500 py-2">No coordinators available.</div>
            ) : (
              <div className="overflow-auto max-h-52 border border-gray-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 w-10"></th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Name</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Email</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Position</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Campus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assigneeRows.map((row) => (
                      <tr
                        key={row.email}
                        onClick={() => setSelectedAssignee(selectedAssignee?.email === row.email ? null : row)}
                        className={`cursor-pointer border-t border-gray-100 transition-colors hover:bg-blue-50 ${
                          selectedAssignee?.email === row.email ? 'bg-blue-50' : ''
                        }`}
                      >
                        <td className="px-3 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={selectedAssignee?.email === row.email}
                            onChange={() => setSelectedAssignee(selectedAssignee?.email === row.email ? null : row)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 accent-blue-600"
                          />
                        </td>
                        <td className="px-3 py-2 text-gray-800">{row.name}</td>
                        <td className="px-3 py-2 text-gray-600">{row.email}</td>
                        <td className="px-3 py-2 text-gray-600">{row.position}</td>
                        <td className="px-3 py-2 text-gray-600">{row.campus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>

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
            { label: isSubmitting ? 'Processing...' : 'Update Ticket', variant: 'primary', onClick: (values) => handleUpdateSubmit(values), disabled: isSubmitting || !selectedAssignee },
            ...(ticket.ticketType?.toLowerCase() === 'repair' ? [
              { label: isSubmitting ? 'Processing...' : 'Resolved', variant: 'success', onClick: handleResolvedClick, disabled: isSubmitting },
              { label: isSubmitting ? 'Processing...' : 'Escalation', variant: 'warning', onClick: handleEscalationClick, disabled: isSubmitting },
            ] : []),
          ]}
        />
      </Modal>
    </>
  );
}
