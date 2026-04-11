'use client';

import React, { useState } from 'react';
import useFetch from '@/app/hooks/query/useFetch';
import SummaryCard from '@/components/atoms/SummaryCard';
import { Ticket, AlertCircle, Clock, CheckCircle, XCircle, TrendingUp, BarChart2, AlertTriangle } from 'lucide-react';
import TicketsTable from './TicketsTable';

export default function TicketsList() {
  // Filter state
  const [filters, setFilters] = useState({});

  // Fetch consolidated data by campus
  const { data: consolidatedData } = useFetch({
    url: '/tickets/count',
    queryKey: ['assets-consolidated-by-campus'],
  });

  const summary = consolidatedData?.data?.summary;
  const summaryTotal = consolidatedData?.data?.total;

  const handleCardClick = (status) => {
    const newFilters = { ...filters };
    if (!status) {
      delete newFilters.status;
    } else {
      newFilters.status = status;
    }
    setFilters(newFilters);
  };

  const summaryCards = [
    { label: 'Total', status: null, value: summaryTotal ?? 0, Icon: BarChart2, valueColor: 'text-gray-900', iconColor: 'text-gray-500', borderColor: 'border-[var(--border)]' },
    { label: 'Open', status: 'OPEN', value: summary?.open ?? 0, Icon: Ticket, valueColor: 'text-blue-600', iconColor: 'text-blue-400', borderColor: 'border-[var(--border)]' },
    { label: 'Raised', status: 'RAISED', value: summary?.raised ?? 0, Icon: TrendingUp, valueColor: 'text-indigo-600', iconColor: 'text-indigo-400', borderColor: 'border-[var(--border)]' },
    { label: 'In Progress', status: 'IN_PROGRESS', value: summary?.inProgress ?? 0, Icon: Clock, valueColor: 'text-yellow-600', iconColor: 'text-yellow-400', borderColor: 'border-[var(--border)]' },
    { label: 'Escalated', status: 'ESCALATED', value: summary?.escalated ?? 0, Icon: AlertCircle, valueColor: 'text-orange-600', iconColor: 'text-orange-400', borderColor: 'border-[var(--border)]' },
    { label: 'Overdue', status: 'OVERDUE', value: summary?.overdue ?? 0, Icon: AlertTriangle, valueColor: 'text-red-600', iconColor: 'text-red-400', borderColor: 'border-[var(--border)]' },
    { label: 'Resolved', status: 'RESOLVED', value: summary?.resolved ?? 0, Icon: CheckCircle, valueColor: 'text-green-600', iconColor: 'text-green-400', borderColor: 'border-[var(--border)]' },
    { label: 'Closed', status: 'CLOSED', value: summary?.closed ?? 0, Icon: XCircle, valueColor: 'text-gray-500', iconColor: 'text-gray-400', borderColor: 'border-[var(--border)]' },
  ];

  return (
    <div className="space-y-2">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 p-4 mb-2">
        {summaryCards.map((card) => (
          <SummaryCard
            key={card.label}
            label={card.label}
            value={card.value}
            Icon={card.Icon}
            valueColor={card.valueColor}
            iconColor={card.iconColor}
            clickable={true}
            onClick={() => handleCardClick(card.status)}
            isActive={card.status === null ? !filters.status : filters.status === card.status}
          />
        ))}
      </div>

      <TicketsTable filters={filters} onFilterChange={setFilters} />
    </div>
  );
}
