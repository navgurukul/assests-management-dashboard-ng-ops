import React from 'react';
import * as LucideIcons from 'lucide-react';

const DashboardCard = ({ count, label, icon, bgColor, iconColor }) => {
  const IconComponent = LucideIcons[icon];
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-3 sm:p-5 flex items-center justify-between border-2 border-[var(--border)]">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${bgColor} flex items-center justify-center shrink-0`}>
        {IconComponent && <IconComponent className={iconColor} size={18} strokeWidth={2} />}
      </div>
      <div className='flex flex-col items-end'>
        <div className="text-gray-600 text-xs font-medium leading-tight text-right">{label}</div>
        <div className="text-xl sm:text-2xl font-bold text-gray-800">{count}</div>
      </div>
    </div>
  );
};

export default DashboardCard;
