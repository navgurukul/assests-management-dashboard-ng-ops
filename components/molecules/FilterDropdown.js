'use client';

import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Filter } from 'lucide-react';
import CustomButton from '@/components/atoms/CustomButton';

// ─── icons ─────────────────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// ─── sub-components ────────────────────────────────────────────────────────────

function FilterOptionItem({ item, isSelected, onSelect }) {
  return (
    <div
      onClick={onSelect}
      className={`px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between ${
        isSelected ? 'bg-blue-50' : ''
      }`}
    >
      <span className="text-sm text-gray-700">{item.label}</span>
      {isSelected && <CheckIcon />}
    </div>
  );
}

function MobileAccordionItems({ filter, selectedValue, onSelect }) {
  return (
    <div className="sm:hidden bg-gray-50 border-t border-b border-gray-100 max-h-48 overflow-y-auto">
      {filter.items.map((item) => (
        <div
          key={item.value}
          onClick={() => onSelect(item.value)}
          className={`px-6 py-2.5 hover:bg-gray-100 active:bg-gray-200 cursor-pointer flex items-center justify-between ${
            selectedValue === item.value ? 'bg-blue-50' : ''
          }`}
        >
          <span className="text-sm text-gray-700">{item.label}</span>
          {selectedValue === item.value && <CheckIcon />}
        </div>
      ))}
    </div>
  );
}

function DesktopFlyout({ filter, selectedValue, onSelect }) {
  return (
    <div className="hidden sm:block absolute right-full top-4 -mr-0.5 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      <div className="py-2 max-h-64 overflow-y-auto">
        {filter.items.map((item) => (
          <FilterOptionItem
            key={item.value}
            item={item}
            isSelected={selectedValue === item.value}
            onSelect={() => onSelect(item.value)}
          />
        ))}
      </div>
    </div>
  );
}

function FilterCategoryRow({ filter, isExpanded, isHovered, selectedValue, onToggle, onHoverEnter, onHoverLeave, onSelect }) {
  return (
    <div onMouseEnter={onHoverEnter} onMouseLeave={onHoverLeave}>
      <div
        className="px-4 py-2.5 sm:py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between gap-2"
        onClick={onToggle}
      >
        <span className="text-sm font-medium text-gray-700 flex-1">{filter.label}</span>
        {selectedValue && <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0" />}
        {/* Mobile: chevron rotates when expanded */}
        <svg
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-150 sm:hidden ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        {/* Desktop: right chevron for flyout */}
        <svg
          className="w-4 h-4 text-gray-400 shrink-0 hidden sm:block"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>

      {isExpanded && filter.items.length > 0 && (
        <MobileAccordionItems filter={filter} selectedValue={selectedValue} onSelect={onSelect} />
      )}
      {isHovered && filter.items.length > 0 && (
        <DesktopFlyout filter={filter} selectedValue={selectedValue} onSelect={onSelect} />
      )}
    </div>
  );
}

// ─── hooks ─────────────────────────────────────────────────────────────────────

function useClickOutside(ref, handler) {
  useEffect(() => {
    function listener(e) {
      if (ref.current && !ref.current.contains(e.target)) handler();
    }
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
}

function useMenuPosition(isOpen, menuRef) {
  useLayoutEffect(() => {
    const el = menuRef.current;
    if (!el) return;
    if (isOpen) {
      const { left } = el.getBoundingClientRect();
      el.style.transform = left < 8 ? `translateX(${8 - left}px)` : '';
    } else {
      el.style.transform = '';
    }
  }, [isOpen, menuRef]);
}

function useFilterOptions({ campusOptions, componentTypeOptions, sourceOptions, conditionOptions, statusOptions, assetTypeOptions }) {
  return [
    { key: 'campus',        label: 'Campus',         items: campusOptions },
    { key: 'componentType', label: 'Component Type',  items: componentTypeOptions },
    { key: 'source',        label: 'Source',          items: sourceOptions },
    { key: 'condition',     label: 'Condition',       items: conditionOptions },
    { key: 'status',        label: 'Status',          items: statusOptions },
    { key: 'type',          label: 'Asset Type',      items: assetTypeOptions },
  ].filter((opt) => opt.items.length > 0);
}

// ─── main component ────────────────────────────────────────────────────────────

export default function FilterDropdown({
  onFilterChange,
  campusOptions = [],
  statusOptions = [],
  assetTypeOptions = [],
  componentTypeOptions = [],
  sourceOptions = [],
  conditionOptions = [],
  selectedFilters = {},
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [expandedItem, setExpandedItem] = useState(null);
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);

  useMenuPosition(isOpen, menuRef);
  const filterOptions = useFilterOptions({ campusOptions, componentTypeOptions, sourceOptions, conditionOptions, statusOptions, assetTypeOptions });

  useClickOutside(dropdownRef, () => {
    setIsOpen(false);
    setHoveredItem(null);
  });

  const handleFilterSelect = (filterKey, value) => {
    const newFilters = { ...selectedFilters };
    if (newFilters[filterKey] === value) {
      delete newFilters[filterKey];
    } else {
      newFilters[filterKey] = value;
    }
    onFilterChange(newFilters);
  };

  const activeFilterCount = Object.keys(selectedFilters).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <CustomButton
        text={`Filter${activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}`}
        icon={Filter}
        onClick={() => setIsOpen(!isOpen)}
        variant={activeFilterCount > 0 ? 'primary' : 'secondary'}
        size="md"
        className="px-2! py-0.5! text-xs! sm:px-3! sm:py-1.5! sm:text-sm!"
      />

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-1rem)] bg-white rounded-lg shadow-lg border border-gray-200 z-50"
        >
          <div className="py-2 relative">
            {filterOptions.map((filter) => (
              <FilterCategoryRow
                key={filter.key}
                filter={filter}
                isExpanded={expandedItem === filter.key}
                isHovered={hoveredItem === filter.key}
                selectedValue={selectedFilters[filter.key]}
                onToggle={() => setExpandedItem(expandedItem === filter.key ? null : filter.key)}
                onHoverEnter={() => setHoveredItem(filter.key)}
                onHoverLeave={() => setHoveredItem(null)}
                onSelect={(value) => handleFilterSelect(filter.key, value)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

