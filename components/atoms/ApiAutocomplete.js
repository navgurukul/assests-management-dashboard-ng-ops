'use client';

import React from 'react';
import {
  Autocomplete,
  AutocompleteItem
} from "@heroui/autocomplete";
import { useApiAutocomplete } from '@/app/hooks/useApiAutocomplete';

/**
 * ApiAutocomplete Component
 * 
 * A reusable autocomplete component that fetches data from an API endpoint
 * and displays it in a searchable dropdown format.
 * 
 * @param {object} props - Component props
 * @param {string} props.name - Field name for form handling
 * @param {string} props.label - Label text displayed above the input
 * @param {string} props.placeholder - Placeholder text for the input
 * @param {string} props.apiUrl - Base API URL to fetch data from
 * @param {array|null} props.queryKey - Custom React Query cache key
 * @param {any} props.value - Current selected value
 * @param {function} props.onChange - Callback when selection changes
 * @param {function} props.onBlur - Callback when field loses focus
 * @param {boolean} props.isInvalid - Whether the field has validation errors
 * @param {string} props.errorMessage - Error message to display
 * @param {boolean} props.isRequired - Whether the field is required
 * @param {boolean} props.isDisabled - Whether the field is disabled
 * @param {string} props.labelKey - Key in data object to use as display label
 * @param {string} props.valueKey - Key in data object to use as value
 * @param {object|null} props.dependsOn - Dependency config { field, paramKey }
 * @param {any} props.dependentValue - Value from dependent field
 * @param {object|null} props.additionalParams - Additional query parameters
 * @param {string|null} props.filterCategory - Category to filter items by
 * @param {string|null} props.dataPath - Path to nested data in response
 * @param {function|null} props.formatLabel - Custom function to format item labels
 * @param {object|null} props.selectedItem - Pre-selected item to include
 */
export default function ApiAutocomplete({
  name,
  label,
  placeholder,
  apiUrl,
  queryKey,
  value,
  onChange,
  onBlur,
  isInvalid,
  errorMessage,
  isRequired = false,
  isDisabled = false,
  labelKey = 'name',
  valueKey = 'id',
  dependsOn = null,
  dependentValue = null,
  additionalParams = null,
  filterCategory = null,
  dataPath = null,
  formatLabel = null,
  selectedItem = null,
}) {
  // Use custom hook to handle data fetching and processing
  const { items, isLoading } = useApiAutocomplete({
    name,
    apiUrl,
    queryKey,
    dependsOn,
    dependentValue,
    additionalParams,
    filterCategory,
    dataPath,
    selectedItem,
    value,
    valueKey,
  });

  // Ensure items is always an array to prevent iteration errors
  const safeItems = Array.isArray(items) ? items : [];

  // Handle selection change event
  const handleSelectionChange = (selectedKey) => {
    onChange({ target: { name, value: selectedKey } });
  };

  // Format label for display
  const getItemLabel = (item) => {
    return formatLabel ? formatLabel(item) : item[labelKey];
  };

  return (
    <div className="w-full">
      {/* Label */}
      <label className="block text-xs font-medium text-gray-700 mb-1">
        {label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Autocomplete Wrapper */}
      <div
        className={`border rounded-lg transition-colors ${
          isInvalid 
            ? 'border-red-500 focus-within:border-red-600' 
            : 'border-gray-300 focus-within:border-blue-500'
        }`}
      >
        <Autocomplete
          name={name}
          placeholder={placeholder}
          isRequired={isRequired}
          isDisabled={isDisabled || isLoading}
          isInvalid={isInvalid}
          errorMessage={errorMessage}
          items={safeItems}
          selectedKey={value || null}
          onSelectionChange={handleSelectionChange}
          onBlur={onBlur}
          isLoading={isLoading}
          radius="lg"
          menuTrigger="focus"
          showScrollIndicators={false}
          classNames={{
            base: "w-full",
            inputWrapper: "border-0 hover:border-0 focus-within:!border-0 shadow-none bg-white",
            input: "text-gray-900",
            selectorButton: "text-gray-400",
          }}
          listboxProps={{
            emptyContent: "No results found",
            itemClasses: {
              base: "text-gray-900 data-[hover=true]:bg-gray-100 data-[selected=true]:bg-blue-50",
            },
          }}
          popoverProps={{
            classNames: {
              content: "bg-white border border-gray-200 rounded-lg shadow-lg",
            },
          }}
        >
          {(item) => (
            <AutocompleteItem key={item[valueKey]}>
              {getItemLabel(item)}
            </AutocompleteItem>
          )}
        </Autocomplete>
      </div>
    </div>
  );
}
