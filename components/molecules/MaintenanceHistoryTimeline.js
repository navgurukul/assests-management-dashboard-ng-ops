import React, { useState } from 'react';
import { Paperclip } from 'lucide-react';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function getHealthBadgeColor(status) {
  const s = (status || '').toUpperCase();
  if (s === 'HEALTHY' || s === 'ACTIVE') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
  if (s === 'SERVICE_DUE' || s === 'NEED_ATTENTION' || s === 'INSPECTION_DUE') {
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }
  if (s === 'EXPIRING_SOON') {
    return 'bg-orange-50 text-orange-700 border-orange-200';
  }
  if (s === 'EXPIRED') {
    return 'bg-rose-50 text-rose-700 border-rose-200';
  }
  return 'bg-gray-50 text-gray-600 border-gray-200';
}

function typeBadgeColor(type) {
  if (type === 'SERVICE') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (type === 'INSPECTION') return 'bg-indigo-100 text-indigo-700 border-indigo-200';
  if (type === 'AMC') return 'bg-amber-100 text-amber-700 border-amber-200';
  return 'bg-gray-100 text-gray-600 border-gray-200';
}

function dotColor(type) {
  if (type === 'SERVICE') return 'bg-emerald-500 border-emerald-300';
  if (type === 'INSPECTION') return 'bg-indigo-500 border-indigo-300';
  if (type === 'AMC') return 'bg-amber-500 border-amber-300';
  return 'bg-gray-400 border-gray-300';
}

function formatCost(cost) {
  if (cost === null || cost === undefined || cost === '') return null;
  const num = Number(cost);
  if (isNaN(num)) return null;
  return `₹${num.toLocaleString('en-IN')}`;
}

export default function MaintenanceHistoryTimeline({
  maintenanceHistory = [],
  inspectionHistory = [],
  insurance = [],
}) {
  const [activeTab, setActiveTab] = useState('service'); // 'service' | 'inspection' | 'amc'

  // Sort utility descending
  const sortDesc = (arr, dateKey) => {
    return [...arr].sort((a, b) => {
      const dateA = new Date(a[dateKey] || a.createdAt || 0);
      const dateB = new Date(b[dateKey] || b.createdAt || 0);
      return dateB - dateA;
    });
  };

  const services = sortDesc(maintenanceHistory, 'serviceDate');
  const inspections = sortDesc(inspectionHistory, 'inspectionDate');
  const amcs = sortDesc(insurance, 'amcStartDate');

  const tabs = [
    { id: 'service', label: 'Service', count: services.length },
    { id: 'inspection', label: 'Inspection', count: inspections.length },
    { id: 'amc', label: 'AMC', count: amcs.length },
  ];

  const renderActiveList = () => {
    if (activeTab === 'service') {
      if (services.length === 0) {
        return <div className="text-sm text-gray-500 py-2">No service history available.</div>;
      }
      return (
        <div className="relative">
          {services.map((item, idx) => {
            const providerName =
              item.serviceProvider ||
              (item.performedByUserId
                ? `${item.performedByUserId.name} ${item.performedByUserId.lastName}`.trim()
                : '—');
            const costFormatted = formatCost(item.cost);

            return (
              <div key={item.id} className="flex gap-4 relative min-w-0 overflow-hidden">
                {/* Timeline connector */}
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full border-2 mt-1 shrink-0 z-10 ${dotColor('SERVICE')}`} />
                  {idx < services.length - 1 && (
                    <div className="w-0.5 bg-gray-200 flex-1 my-1" />
                  )}
                </div>

                {/* Card — matches MovementTimeline's border/padding/shadow */}
                <div className="mb-4 flex-1 min-w-0 overflow-hidden rounded-lg border p-2.5 sm:p-3 bg-white shadow-sm">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
                    <span className="text-xs sm:text-sm font-medium text-gray-800">
                      {providerName}
                    </span>
                    <span className={`text-[9px] sm:text-[10px] font-semibold px-1.5 py-px rounded border leading-tight ${typeBadgeColor('SERVICE')}`}>
                      SERVICE
                    </span>
                  </div>

                  {item.notes && (
                    <p className="text-xs sm:text-sm text-gray-600 mb-1 line-clamp-3 break-all cursor-default" title={item.notes}>
                      {item.notes}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mb-1">
                    {item.healthStatus && (
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${getHealthBadgeColor(item.healthStatus)}`}>
                        {item.healthStatus}
                      </span>
                    )}
                    {costFormatted && (
                      <span className="font-medium text-gray-700">
                        Cost: <span className="font-bold">{costFormatted}</span>
                      </span>
                    )}
                    {item.nextServiceDate && (
                      <span>
                        Next service: <span className="font-medium text-gray-700">{formatDate(item.nextServiceDate)}</span>
                      </span>
                    )}
                  </div>

                  {item.bill?.url && (
                    <a
                      href={item.bill.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1.5 font-medium break-all mb-1"
                    >
                      <Paperclip className="w-3.5 h-3.5 shrink-0" />
                      {item.bill.name || 'View Bill'}
                    </a>
                  )}

                  <p className="text-[10px] sm:text-xs text-gray-400">
                    {formatDate(item.serviceDate)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (activeTab === 'inspection') {
      if (inspections.length === 0) {
        return <div className="text-sm text-gray-500 py-2">No inspection history available.</div>;
      }
      return (
        <div className="relative">
          {inspections.map((item, idx) => {
            const performerName = item.performedByUser
              ? `${item.performedByUser.name} ${item.performedByUser.lastName}`.trim()
              : '—';
            const costFormatted = formatCost(item.cost);

            return (
              <div key={item.id} className="flex gap-4 relative min-w-0 overflow-hidden">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full border-2 mt-1 shrink-0 z-10 ${dotColor('INSPECTION')}`} />
                  {idx < inspections.length - 1 && (
                    <div className="w-0.5 bg-gray-200 flex-1 my-1" />
                  )}
                </div>

                <div className="mb-4 flex-1 min-w-0 overflow-hidden rounded-lg border p-2.5 sm:p-3 bg-white shadow-sm">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
                    <span className="text-xs sm:text-sm font-medium text-gray-800">
                      {performerName}
                    </span>
                    <span className={`text-[9px] sm:text-[10px] font-semibold px-1.5 py-px rounded border leading-tight ${typeBadgeColor('INSPECTION')}`}>
                      INSPECTION
                    </span>
                  </div>

                  {item.notes && (
                    <p className="text-xs sm:text-sm text-gray-600 mb-1 line-clamp-3 break-all cursor-default" title={item.notes}>
                      {item.notes}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mb-1">
                    {item.healthStatus && (
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${getHealthBadgeColor(item.healthStatus)}`}>
                        {item.healthStatus}
                      </span>
                    )}
                    {costFormatted && (
                      <span className="font-medium text-gray-700">
                        Cost: <span className="font-bold">{costFormatted}</span>
                      </span>
                    )}
                    {item.nextInspectionDate && (
                      <span>
                        Next inspection: <span className="font-medium text-gray-700">{formatDate(item.nextInspectionDate)}</span>
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] sm:text-xs text-gray-400">
                    {formatDate(item.inspectionDate)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (activeTab === 'amc') {
      if (amcs.length === 0) {
        return <div className="text-sm text-gray-500 py-2">No AMC / Insurance history available.</div>;
      }
      return (
        <div className="relative">
          {amcs.map((item, idx) => {
            const providerName =
              item.insuranceProvider ||
              (item.performedByUser
                ? `${item.performedByUser.name} ${item.performedByUser.lastName}`.trim()
                : '—');
            const costFormatted = formatCost(item.cost);

            return (
              <div key={item.id} className="flex gap-4 relative min-w-0 overflow-hidden">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full border-2 mt-1 shrink-0 z-10 ${dotColor('AMC')}`} />
                  {idx < amcs.length - 1 && (
                    <div className="w-0.5 bg-gray-200 flex-1 my-1" />
                  )}
                </div>

                <div className="mb-4 flex-1 min-w-0 overflow-hidden rounded-lg border p-2.5 sm:p-3 bg-white shadow-sm">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
                    <span className="text-xs sm:text-sm font-medium text-gray-800">
                      {providerName}
                    </span>
                    <span className={`text-[9px] sm:text-[10px] font-semibold px-1.5 py-px rounded border leading-tight ${typeBadgeColor('AMC')}`}>
                      AMC
                    </span>
                  </div>

                  {item.notes && (
                    <p className="text-xs sm:text-sm text-gray-600 mb-1 line-clamp-3 break-all cursor-default" title={item.notes}>
                      {item.notes}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mb-1">
                    {item.healthStatus && (
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${getHealthBadgeColor(item.healthStatus)}`}>
                        {item.healthStatus}
                      </span>
                    )}
                    {costFormatted && (
                      <span className="font-medium text-gray-700">
                        Cost: <span className="font-bold">{costFormatted}</span>
                      </span>
                    )}
                    {item.amcExpiryDate && (
                      <span>
                        Expiry: <span className="font-medium text-gray-700">{formatDate(item.amcExpiryDate)}</span>
                      </span>
                    )}
                  </div>

                  {item.policyDocument?.url && (
                    <a
                      href={item.policyDocument.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1.5 font-medium break-all mb-1"
                    >
                      <Paperclip className="w-3.5 h-3.5 shrink-0" />
                      {item.policyDocument.name || 'View Policy'}
                    </a>
                  )}

                  <p className="text-[10px] sm:text-xs text-gray-400">
                    {formatDate(item.amcStartDate)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Tabs list */}
      <div className="flex gap-2 border-b border-gray-100 pb-2 mb-1 flex-wrap">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-500 hover:text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tab.label} <span className="text-[10px] ml-0.5 opacity-90">({tab.count})</span>
            </button>
          );
        })}
      </div>

      {/* List container */}
      <div className="flex-1">
        {renderActiveList()}
      </div>
    </div>
  );
}