import React from 'react';
import StatusChip from '@/components/atoms/StatusChip';
import SLAIndicator from '@/components/molecules/SLAIndicator';

export default function GenericCellRenderer({ item, column }) {
  const cellValue = item[column?.key];

  // Handle empty states first to prevent duplication
  if (!cellValue || cellValue === 'N/A') {
    if (column?.type === 'user') return <span className="text-gray-400">Not assigned</span>;
    return <span className="text-gray-400">—</span>;
  }

  // Render based on column type
  switch (column?.type) {
    case 'id':
      return <span className="font-medium text-blue-600">{column.prefix || ''}{cellValue}</span>;
      
    case 'boldText':
      return <span className="font-medium text-gray-800">{cellValue}</span>;
      
    case 'chip':
      return <StatusChip value={cellValue} colorFn={column.colorFn} />;
      
    case 'user':
      return (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 shadow-sm">
            <span className="text-blue-700 font-semibold text-xs text-center leading-none">
              {cellValue.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <span className="font-medium text-gray-700">{cellValue}</span>
        </div>
      );
      
    case 'userWithEmail':
      const userName = typeof cellValue === 'object' ? (cellValue?.name || '—') : (cellValue || '—');
      const userEmail = typeof cellValue === 'object' ? cellValue?.email : '';
      return (
        <div className="flex flex-col">
          <span className="text-gray-700 text-sm font-medium">{userName}</span>
          {userEmail && (
            <span className="text-gray-500 text-xs">{userEmail}</span>
          )}
        </div>
      );

    case 'sla':
      return (
        <SLAIndicator 
          allocationDate={cellValue.allocationDate}
          expectedResolutionDate={cellValue.expectedResolutionDate}
          status={cellValue.status}
          compact={true}
        />
      );

    case 'truncate':
      return (
        <span 
          className="text-gray-700 text-sm truncate block" 
          style={{ maxWidth: column.maxWidth || '180px' }} 
          title={cellValue}
        >
          {cellValue}
        </span>
      );

    case 'date':
      if (cellValue === 'Active') {
        return <span className="text-green-600 font-medium">{cellValue}</span>;
      }
      return <span className="text-gray-600 text-sm">{cellValue}</span>;

    case 'badge':
      return (
        <StatusChip
          value={cellValue}
          colorFn={() => cellValue === 'Yes' ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-50 text-gray-600'}
        />
      );

    default:
      // Default plain text rendering
      return <span className="text-gray-700 text-sm">{cellValue}</span>;
  }
}
