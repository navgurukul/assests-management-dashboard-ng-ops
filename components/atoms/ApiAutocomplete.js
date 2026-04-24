'use client';

import { useState, useEffect } from 'react';
import {
  Autocomplete,
  AutocompleteItem
} from "@heroui/autocomplete";
import { useApiAutocomplete } from '@/app/hooks/useApiAutocomplete';
import { X } from 'lucide-react';

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
  excludeValue = null,
  onItemSelect = null,
  staticItems = null,
  filterFn = null,
  emptyContent = "No results found",
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
    staticItems,
    filterFn,
  });

  const [inputValue, setInputValue] = useState('');

  // Ensure items is always an array to prevent iteration errors
  const allItems = Array.isArray(items) ? items : [];
  const baseItems = excludeValue
    ? allItems.filter((item) => item[valueKey] !== excludeValue)
    : allItems;

  // Format label for display
  const getItemLabel = (item) => {
    const label = formatLabel ? formatLabel(item) : item[labelKey];
    return label;
  };

  useEffect(() => {
    if (!value) {
      setInputValue('');
      return;
    }
    if (allItems.length === 0 || inputValue !== '') return;
    const matchedItem = allItems.find((item) => String(item[valueKey]) === String(value));
    if (matchedItem) {
      setInputValue(String(getItemLabel(matchedItem) ?? ''));
    }
  }, [value, allItems, valueKey]);

  // Client-side filtering based on typed input
  const safeItems = inputValue
    ? baseItems.filter((item) =>
        String(getItemLabel(item) ?? '').toLowerCase().includes(inputValue.toLowerCase())
      )
    : baseItems;

  // Handle selection change event
  const handleSelectionChange = (selectedKey) => {
    onChange({ target: { name, value: selectedKey } });
    const matchedItem = allItems.find((item) => String(item[valueKey]) === String(selectedKey));
    if (matchedItem) {
      setInputValue(String(getItemLabel(matchedItem) ?? ''));
      if (onItemSelect) onItemSelect(matchedItem);
    }
  };

  const handleInputChange = (val) => {
    setInputValue(val);
  };

  const handleClear = () => {
    setInputValue('');
    onChange({ target: { name, value: '' } });
    if (onItemSelect) onItemSelect(null);
  };

  return (
    <div className="w-full">
      {/* Label */}
      <label id={`${name}-label`} className="block text-xs font-medium text-gray-700 mb-1">
        {label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Autocomplete Wrapper */}
      <div
        className={`api-autocomplete-wrapper relative border rounded-lg transition-colors ${
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
          inputValue={inputValue}
          onInputChange={handleInputChange}
          onSelectionChange={handleSelectionChange}
          onBlur={onBlur}
          isLoading={isLoading}
          radius="lg"
          menuTrigger="focus"
          showScrollIndicators={false}
          aria-labelledby={`${name}-label`}
          classNames={{
            base: "w-full",
            inputWrapper: "border-0 hover:border-0 focus-within:!border-0 shadow-none bg-white",
            input: "text-gray-900",
            selectorButton: "text-gray-400",
          }}
          listboxProps={{
            emptyContent: emptyContent,
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
            <AutocompleteItem key={item[valueKey]} textValue={String(getItemLabel(item) ?? '')}>
              {getItemLabel(item)}
            </AutocompleteItem>
          )}
        </Autocomplete>

        {value && !isDisabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-10 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Clear selection"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}