'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Autocomplete,
  AutocompleteItem
} from "@heroui/autocomplete";
import { useApiAutocomplete } from '@/app/hooks/useApiAutocomplete';
import { useInfiniteApiAutocomplete } from '@/app/hooks/useInfiniteApiAutocomplete';
import { X } from 'lucide-react';

const SENTINEL_KEY = '__load-more-sentinel__';

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
  enableSearch = false,
  enablePagination = false,
  pageLimit = 10,
  renderItem = null,
  isItemDisabled = null,
}) {
  const isPaginatedMode = enableSearch || enablePagination;

  // Standard hook — disabled in paginated mode by passing staticItems: []
  const { items: standardItems, isLoading: standardLoading } = useApiAutocomplete({
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
    staticItems: isPaginatedMode ? [] : staticItems,
    filterFn,
  });

  const [inputValue, setInputValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const intersectionObserverRef = useRef(null);

  // Debounce inputValue → debouncedSearch (only active in search mode)
  useEffect(() => {
    if (!enableSearch) return;
    const timer = setTimeout(() => {
      setDebouncedSearch(inputValue);
    }, 400);
    return () => clearTimeout(timer);
  }, [inputValue, enableSearch]);

  const {
    items: searchedItems,
    isLoading: searchLoading,
    isFetchingNextPage: isFetchingMore,
    hasNextPage: hasMore,
    fetchNextPage: loadNextPage,
  } = useInfiniteApiAutocomplete({
    apiUrl,
    queryKey,
    dependsOn,
    dependentValue,
    additionalParams,
    filterFn,
    searchTerm: debouncedSearch,
    limit: pageLimit,
    enabled: isPaginatedMode,
  });

  const activeItems = isPaginatedMode ? searchedItems : standardItems;
  const isLoading = isPaginatedMode ? searchLoading : standardLoading;

  // In paginated/search mode only show loading spinner on initial load (no items yet),
  // never disable the input while a background search re-fetch is in flight
  const isInputDisabled = isDisabled || (isPaginatedMode ? false : isLoading);

  // Ensure items is always an array
  const allItems = Array.isArray(activeItems) ? activeItems : [];
  const baseItems = excludeValue
    ? allItems.filter((item) => item[valueKey] !== excludeValue)
    : allItems;

  const getItemLabel = (item) => {
    return formatLabel ? formatLabel(item) : item[labelKey];
  };

  // Sync selected value back to display label
  useEffect(() => {
     if (!value) {
      // In search/paginated mode the inputValue is the search term — never auto-clear it
      if (!isPaginatedMode) {
         setInputValue('');
      }
      return;
    }
    if (allItems.length === 0 || inputValue !== '') return;
    const matchedItem = allItems.find((item) => String(item[valueKey]) === String(value));
    if (matchedItem) {
      setInputValue(String(getItemLabel(matchedItem) ?? ''));
    }
  }, [value, allItems, valueKey]);

  // IntersectionObserver ref callback — triggers next page load when sentinel is visible
  const sentinelRef = (node) => {
    if (intersectionObserverRef.current) {
      intersectionObserverRef.current.disconnect();
      intersectionObserverRef.current = null;
    }
    if (!node || !enablePagination) return;

    intersectionObserverRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingMore) {
          loadNextPage();
        }
      },
      { threshold: 0.5 },
    );
    intersectionObserverRef.current.observe(node);
  };

  // In standard mode: client-side filter by typed input
  // In search mode: server already filtered, show results as-is
  const displayItems = isPaginatedMode ? baseItems : (
    inputValue
      ? baseItems.filter((item) =>
          String(getItemLabel(item) ?? '').toLowerCase().includes(inputValue.toLowerCase())
        )
      : baseItems
  );

  // Append sentinel item when more pages are available
  const itemsWithSentinel = (enablePagination && hasMore)
    ? [...displayItems, { [valueKey]: SENTINEL_KEY, [labelKey]: '' }]
    : displayItems;

  const handleSelectionChange = (selectedKey) => { 
    if (selectedKey === SENTINEL_KEY) return;
    // HeroUI fires null when typed text has no match — ignore it so the input stays intact
    if (!selectedKey) return;
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
    setDebouncedSearch('');
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
          isDisabled={isInputDisabled}
          isInvalid={isInvalid}
          errorMessage={errorMessage}
          items={itemsWithSentinel}
          selectedKey={value || null}
          inputValue={inputValue}
          onInputChange={handleInputChange}
          onSelectionChange={handleSelectionChange}
          onBlur={onBlur}
          isLoading={isLoading || isFetchingMore}
          allowsEmptyCollection
          allowsCustomValue
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
          {(item) => {
            if (item[valueKey] === SENTINEL_KEY) {
              return (
                <AutocompleteItem key={SENTINEL_KEY} textValue=" " isReadOnly>
                  <div ref={sentinelRef} className="py-2 text-center text-gray-400 text-xs">
                    {isFetchingMore ? 'Loading more...' : 'Scroll for more'}
                  </div>
                </AutocompleteItem>
              );
            }
            return (
              <AutocompleteItem 
                key={item[valueKey]} 
                textValue={String(getItemLabel(item) ?? '')}
                isDisabled={isItemDisabled ? isItemDisabled(item) : false}
              >
                {renderItem ? renderItem(item, getItemLabel(item)) : getItemLabel(item)}
              </AutocompleteItem>
            );
          }}
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