'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { List } from 'lucide-react';

const DROPDOWN_WIDTH = 192; // w-48
const DROPDOWN_GAP = 8; // mt-2 equivalent

export default function ActionMenu({ menuOptions = [], disabled = false, className = '' }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);

  // Calculate where the dropdown should appear based on the trigger button's
  // position on screen. Flips upward if there isn't enough space below.
  const calculatePosition = useCallback(() => {
    const buttonEl = buttonRef.current;
    if (!buttonEl) return;

    const rect = buttonEl.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Estimate dropdown height based on number of options (~36px per row + padding)
    const estimatedHeight = menuOptions.length * 36 + 16;

    const spaceBelow = viewportHeight - rect.bottom;
    const shouldFlipUp = spaceBelow < estimatedHeight && rect.top > estimatedHeight;

    const top = shouldFlipUp
      ? rect.top - estimatedHeight - DROPDOWN_GAP
      : rect.bottom + DROPDOWN_GAP;

    // Align right edge of dropdown with right edge of button, but keep it on-screen
    let left = rect.right - DROPDOWN_WIDTH;
    if (left < 8) left = 8;
    if (left + DROPDOWN_WIDTH > viewportWidth - 8) {
      left = viewportWidth - DROPDOWN_WIDTH - 8;
    }

    setPosition({ top, left });
  }, [menuOptions.length]);

  const handleToggle = (event) => {
    event.stopPropagation();
    if (!open) {
      calculatePosition();
    }
    setOpen((prev) => !prev);
  };

  const handleClose = () => setOpen(false);

  const handleOptionClick = (event, option) => {
    event.stopPropagation();
    setOpen(false);
    option.onClick();
  };

  const stopEventBubbling = (event) => event.stopPropagation();

  // Recalculate on scroll/resize while open, and close on scroll of any
  // ancestor to avoid the dropdown drifting away from its trigger.
  useEffect(() => {
    if (!open) return;

    const handleScroll = () => setOpen(false);
    const handleResize = () => calculatePosition();

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [open, calculatePosition]);

  return (
    <div className="relative flex items-left justify-left">
      {/* Three-dots trigger */}
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors" 
        aria-label="Actions menu"
        disabled={disabled}
      >
        <List className="h-7 w-7 text-gray-600" />
      </button>

      {open &&
        createPortal(
          <>
            {/* Backdrop to close menu on outside click */}
            <div className="fixed inset-0 z-[9998]" onClick={handleClose} />

            {/* Dropdown — fixed positioned in document.body, so it's never
                clipped by any parent's overflow:hidden/auto */}
            <div
              onClick={stopEventBubbling}
              className={`fixed w-48 bg-white rounded-md shadow-xl ${className}`}
              style={{ zIndex: 9999, minHeight: '50px', top: `${position.top}px`, left: `${position.left}px` }}
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
          </>,
          document.body
        )}
    </div>
  );
}