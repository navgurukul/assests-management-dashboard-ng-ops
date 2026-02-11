import React from 'react';
export default function SummaryCard({ 
  label, 
  value, 
  Icon, 
  valueColor = 'text-gray-900',
  iconColor = 'text-gray-500'
}) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
        </div>
        {Icon && <Icon className={`w-8 h-8 ${iconColor}`} />}
      </div>
    </div>
  );
}
