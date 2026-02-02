import React from 'react';
import * as LucideIcons from 'lucide-react';

const DashboardCard = ({ count, label, icon, bgColor, iconColor, borderColor }) => {
  const IconComponent = LucideIcons[icon];
  
  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 flex items-center justify-between border-2 ${borderColor}`}>
      <div className={`w-14 h-14 rounded-full ${bgColor} flex items-center justify-center`}>
        {IconComponent && <IconComponent className={iconColor} size={24} strokeWidth={2} />}
      </div>
      <div className='flex flex-col items-end' >
        <div className="text-3xl font-bold text-gray-800">{count}</div>
        <div className="text-gray-600 text-xs font-medium">{label}</div>
      </div>
    </div>
  );
};

export default DashboardCard;
