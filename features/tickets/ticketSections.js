import React from 'react';
import SLAIndicator from '@/components/molecules/SLAIndicator';

export function getTicketLeftSections(ticket, historyTimeline) {
  return [
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
}

export function getTicketRightSections(ticket, hasAsset) {
  return [
    {
      title: 'TICKET INFO',
      color: 'blue',
      span: 2,
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
        { label: 'Manager Comment', value: ticket.resolutionNotes || '—', className: 'col-span-2 line-clamp-2' },
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
      itemsGrid: true,
      items: [
        { label: 'Name', value: ticket.raisedByUser ? `${ticket.raisedByUser.firstName} ${ticket.raisedByUser.lastName}`.trim() : '—' },
        { label: 'Role', value: ticket.raisedByUser?.role || '—' },
        { label: 'Email', value: ticket.raisedByUser?.email || '—' },
      ],
    },
    {
      title: 'ASSIGNEE',
      color: 'purple',
      itemsGrid: true,
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
      title: 'ASSET DETAILS',
      color: 'orange',
      span: 2,
      itemsGrid: true,
      items: [
        { label: 'Asset Tag', value: ticket.asset?.assetTag || ticket.assetId || '—' },
        { label: 'Brand', value: ticket.asset?.brand || '—' },
        { label: 'Model', value: ticket.asset?.model || '—' },
        { label: 'Status', value: ticket.asset?.status || '—' },
        { label: 'Condition', value: ticket.asset?.condition || '—' },
        { label: 'Asset Type', value: ticket.asset?.assetType?.name || '—' },
        { label: 'Category', value: ticket.asset?.assetType?.category || '—' },
        { label: 'Campus', value: ticket.asset?.campus?.name || '—' },
        // { label: 'Campus Code', value: ticket.asset?.campus?.code || '—' },
        { label: 'Campus State', value: ticket.asset?.campus?.state || '—' },
      ],
    }] : []),
  ];
}
