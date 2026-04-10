import React from 'react';
export default function SummaryCard({ 
  label, 
  value, 
  Icon, 
  valueColor = 'text-gray-900',
  iconColor = 'text-gray-500',
  clickable = false,
  onClick = null,
  isActive = false
}) {
  const baseClasses = "bg-[var(--surface)] rounded-lg shadow p-4 border-2";
  const clickableClasses = clickable 
    ? "cursor-pointer transition-all hover:shadow-md hover:scale-105" 
    : "";
  const borderStyle = isActive
    ? { borderColor: '#f97316' }
    : { borderColor: 'var(--border)' };

  const handleClick = () => {
    if (clickable && onClick) {
      onClick();
    }
  };

  return (
    <div 
      className={`${baseClasses} ${clickableClasses}`}
      style={borderStyle}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-600">{label}</p>
          <p className={`text-xl font-bold ${valueColor}`}>{value}</p>
        </div>
        {Icon && <Icon className={`w-8 h-8 ${iconColor}`} />}
      </div>
    </div>
  );
}
