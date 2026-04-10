'use client';

import { useState } from 'react';
import { MoreVertical } from 'lucide-react';

export default function ActionMenu({ menuOptions = [], disabled = false, className = '' }) {
  const [open, setOpen] = useState(false);

  const handleToggle = (event) => {
    event.stopPropagation();
    setOpen((prev) => !prev);
  };

  const handleClose = () => setOpen(false);

  const handleOptionClick = (event, option) => {
    event.stopPropagation();
    setOpen(false);
    option.onClick();
  };

  const stopEventBubbling = (event) => event.stopPropagation();

  return (
    <div className="relative flex items-center justify-center">
      {/* Backdrop to close menu on outside click */}
      {open && (
        <div className="fixed inset-0 z-[9998]" onClick={handleClose} />
      )}

      {/* Three-dots trigger */}
      <button
        onClick={handleToggle}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Actions menu"
        disabled={disabled}
      >
        <MoreVertical className="h-5 w-5 text-gray-600" />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          onClick={stopEventBubbling}
          className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl ${className}`}
          style={{ zIndex: 9999, minHeight: '50px' }}
        >
          <div className="py-1">
            {menuOptions.length === 0 && (
              <div className="px-4 py-2 text-sm text-gray-500">No options available</div>
            )}
            {menuOptions.map((option, index) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={index}
                  onClick={(event) => handleOptionClick(event, option)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  {IconComponent && (
                    <IconComponent className={`h-4 w-4 ${option.iconClassName || ''}`} />
                  )}
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
