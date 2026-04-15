import React from 'react';

function formatMovementDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year}, ${hours}:${mins}`;
}

function movementDotColor(movementType) {
  const type = (movementType || '').toUpperCase();
  if (type.includes('TRANSFER'))  return 'bg-blue-500 border-blue-300';
  if (type.includes('ACCEPTED'))  return 'bg-green-500 border-green-300';
  if (type.includes('REPAIR'))    return 'bg-orange-500 border-orange-300';
  if (type.includes('SCRAP'))     return 'bg-red-500 border-red-300';
  if (type.includes('ALLOCATED')) return 'bg-purple-500 border-purple-300';
  return 'bg-gray-400 border-gray-300';
}

function movementBadgeColor(movementType) {
  const type = (movementType || '').toUpperCase();
  if (type.includes('TRANSFER'))  return 'bg-blue-100 text-blue-700 border-blue-200';
  if (type.includes('ACCEPTED'))  return 'bg-green-100 text-green-700 border-green-200';
  if (type.includes('REPAIR'))    return 'bg-orange-100 text-orange-700 border-orange-200';
  if (type.includes('SCRAP'))     return 'bg-red-100 text-red-700 border-red-200';
  if (type.includes('ALLOCATED')) return 'bg-purple-100 text-purple-700 border-purple-200';
  return 'bg-gray-100 text-gray-600 border-gray-200';
}

export default function MovementTimeline({ movements = [] }) {
  if (movements.length === 0) {
    return <div className="text-sm text-gray-600">No movement history for this asset.</div>;
  }

  return (
    <div className="relative">
      {movements.map((movement, idx) => (
        <div key={movement.id} className="flex gap-4 relative min-w-0 overflow-hidden">
          {/* Vertical line + dot */}
          <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full border-2 mt-1 shrink-0 z-10 ${movementDotColor(movement.movementType)}`} />
            {idx < movements.length - 1 && (
              <div className="w-0.5 bg-gray-200 flex-1 my-1" />
            )}
          </div>

          {/* Card */}
          <div className="mb-4 flex-1 min-w-0 overflow-hidden rounded-lg border p-2.5 sm:p-3 bg-white shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
              <span className="text-xs sm:text-sm font-medium text-gray-800">
                {movement.movedBy
                  ? `${movement.movedBy.firstName} ${movement.movedBy.lastName}`.trim()
                  : '—'}
              </span>
              <span className={`text-[9px] sm:text-[10px] font-semibold px-1.5 py-px rounded border leading-tight ${movementBadgeColor(movement.movementType)}`}>
                {movement.movementType}
              </span>
            </div>
            {movement.previousAssetTag !== movement.newAssetTag && (
              <p className="text-xs text-gray-500 mb-1">
                Tag: <span className="line-through">{movement.previousAssetTag}</span>{' '}
                → <span className="font-medium text-gray-700">{movement.newAssetTag}</span>
              </p>
            )}
            {movement.allocationReason && (
              <p className="text-xs text-gray-500 mb-1">Reason: {movement.allocationReason}</p>
            )}
            {movement.notes && (
              <p
                className="text-xs sm:text-sm text-gray-600 mb-1 line-clamp-3 break-all cursor-default"
                title={movement.notes}
              >
                {movement.notes}
              </p>
            )}
            <p className="text-[10px] sm:text-xs text-gray-400">
              {formatMovementDate(movement.movedAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
