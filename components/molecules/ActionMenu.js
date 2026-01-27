'use client';

import React, { useRef, useEffect } from 'react';
export default function ActionMenu({ menuOptions = [], onClose, className = '' }) {
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      onClick={(e) => e.stopPropagation()} // Prevent clicks from bubbling to table row
      className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl ${className}`}
      style={{ zIndex: 9999, minHeight: '50px' }}
    >
      <div className="py-1">
        {menuOptions.length === 0 && (
          <div className="px-4 py-2 text-sm text-gray-500">
            No options available
          </div>
        )}
        {menuOptions.map((option, index) => {
          const IconComponent = option.icon;
          return (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation(); // Stop event from bubbling to parent elements
                option.onClick();
                onClose();
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              {IconComponent && <IconComponent className="h-4 w-4" />}
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
