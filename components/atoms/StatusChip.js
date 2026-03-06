'use client';

import { CHIP_CLASSES, getStatusChipColor } from '@/app/utils/statusHelpers';

 
export default function StatusChip({ value, colorFn, className = '', icon }) {
  if (value === null || value === undefined || value === '') {
    return <span className="text-gray-400 text-xs">—</span>;
  }

  const colorClass = colorFn ? colorFn(value) : getStatusChipColor(value);

  return (
    <span className={`${CHIP_CLASSES} ${colorClass} ${className}`.trim()}>
      {icon && <span className="mr-1 inline-flex items-center">{icon}</span>}
      {value}
    </span>
  );
}
