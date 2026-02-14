import React from 'react';
export default function SummaryCard({ 
  label, 
  value, 
  Icon, 
  valueColor = 'text-gray-900',
  iconColor = 'text-gray-500',
  borderColor = 'border-gray-200',
  clickable = false,
  onClick = null,
  isActive = false
}) {
  const baseClasses = "bg-white rounded-lg shadow p-4";
  const clickableClasses = clickable 
    ? "cursor-pointer transition-all hover:shadow-md hover:scale-105" 
    : "";
  const borderClasses = isActive ? "border border-orange-500" : `border-2 ${borderColor}`;
  
  const handleClick = () => {
    if (clickable && onClick) {
      onClick();
    }
  };

  return (
    <div 
      className={`${baseClasses} ${borderClasses} ${clickableClasses}`}
      onClick={handleClick}
    >
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
