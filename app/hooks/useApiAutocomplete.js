import { useMemo } from 'react';
import useFetch from '@/app/hooks/query/useFetch';

/**
 * Builds the final API URL with query parameters
 * @param {string} baseUrl - Base API URL
 * @param {object|null} dependsOn - Dependency configuration { field, paramKey }
 * @param {any} dependentValue - Value from dependent field
 * @param {object|null} additionalParams - Additional query parameters
 * @returns {string} Final API URL with all parameters
 */
const buildApiUrl = (baseUrl, dependsOn, dependentValue, additionalParams) => {
  let finalUrl = baseUrl;
  const queryParams = [];

  // Handle dependent value - can be path param or query param
  if (dependsOn && dependentValue) {
    if (baseUrl.endsWith('/')) {
      // If URL ends with '/', treat dependent value as path parameter
      finalUrl = `${baseUrl}${dependentValue}`;
    } else {
      // Otherwise, add as query parameter
      queryParams.push(`${dependsOn.paramKey}=${dependentValue}`);
    }
  }

  // Add additional query parameters
  if (additionalParams) {
    Object.entries(additionalParams).forEach(([paramKey, paramValue]) => {
      // Only add non-empty values
      if (paramValue != null && paramValue !== '') {
        queryParams.push(`${paramKey}=${paramValue}`);
      }
    });
  }

  // Append query params to URL if any exist
  if (queryParams.length > 0) {
    const separator = finalUrl.includes('?') ? '&' : '?';
    finalUrl = `${finalUrl}${separator}${queryParams.join('&')}`;
  }

  return finalUrl;
};

/**
 * Builds React Query cache key for proper caching
 * @param {string} name - Field name
 * @param {array|null} queryKey - Custom query key (if provided)
 * @param {object|null} dependsOn - Dependency configuration
 * @param {any} dependentValue - Value from dependent field
 * @param {object|null} additionalParams - Additional query parameters
 * @returns {array} Query key array for React Query
 */
const buildQueryKey = (name, queryKey, dependsOn, dependentValue, additionalParams) => {
  // If custom query key provided, use it
  if (queryKey) return queryKey;

  // Otherwise, build query key from dependencies
  const keyParts = [name];
  
  if (dependsOn && dependentValue) {
    keyParts.push(dependentValue);
  }
  
  if (additionalParams) {
    Object.values(additionalParams).forEach((val) => {
      if (val != null && val !== '') {
        keyParts.push(val);
      }
    });
  }

  return keyParts;
};

/**
 * Extracts nested data from API response using dot notation path
 * @param {object} data - API response data
 * @param {string|null} dataPath - Dot notation path (e.g., 'data.users')
 * @returns {array} Extracted data array
 */
const extractNestedData = (data, dataPath) => {
  if (!dataPath) {
    return data?.data || [];
  }
  
  return dataPath.split('.').reduce((acc, part) => acc?.[part], data) || [];
};

/**
 * Filters items by category if filterCategory is provided
 * @param {array} items - Items to filter
 * @param {string|null} filterCategory - Category to filter by
 * @returns {array} Filtered items
 */
const filterByCategory = (items, filterCategory) => {
  if (!filterCategory) return items;
  return items.filter((item) => item.category === filterCategory);
};

/**
 * Prepares final items list, adding selected item if not already present
 * @param {array} filteredItems - Filtered items
 * @param {object|null} selectedItem - Pre-selected item to include
 * @param {any} value - Current selected value
 * @param {string} valueKey - Key to use for value comparison
 * @returns {array} Final items array
 */
const prepareItems = (filteredItems, selectedItem, value, valueKey) => {
  if (!selectedItem || !value) {
    return filteredItems;
  }
  
  const isItemInList = filteredItems.some(
    (item) => item[valueKey] === value
  );
  
  // If selected item not in list, add it at the beginning
  return isItemInList 
    ? filteredItems 
    : [selectedItem, ...filteredItems];
};

/**
 * Custom hook for API Autocomplete functionality
 * Handles data fetching, URL building, and data processing
 * 
 * @param {object} config - Configuration object
 * @param {string} config.name - Field name
 * @param {string} config.apiUrl - Base API URL
 * @param {array|null} config.queryKey - Custom React Query key
 * @param {object|null} config.dependsOn - Dependency config { field, paramKey }
 * @param {any} config.dependentValue - Value from dependent field
 * @param {object|null} config.additionalParams - Additional query parameters
 * @param {string|null} config.filterCategory - Category to filter by
 * @param {string|null} config.dataPath - Path to nested data in response
 * @param {object|null} config.selectedItem - Pre-selected item
 * @param {any} config.value - Current selected value
 * @param {string} config.valueKey - Key for value comparison
 * 
 * @returns {object} Hook return object
 * @returns {array} returns.items - Processed items for autocomplete
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {boolean} returns.isError - Error state
 * @returns {boolean} returns.shouldEnableFetch - Whether fetch should be enabled
 */
export const useApiAutocomplete = ({
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
  valueKey = 'id',
}) => {
  // Build final API URL with all parameters
  const finalApiUrl = useMemo(
    () => buildApiUrl(apiUrl, dependsOn, dependentValue, additionalParams),
    [apiUrl, dependsOn, dependentValue, additionalParams]
  );

  // Build query key for React Query caching
  const finalQueryKey = useMemo(
    () => buildQueryKey(name, queryKey, dependsOn, dependentValue, additionalParams),
    [name, queryKey, dependsOn, dependentValue, additionalParams]
  );

  // Determine if fetch should be enabled
  // Only fetch if no dependency exists OR dependent value is available
  const shouldEnableFetch = !dependsOn || !!dependentValue;

  // Fetch data from API
  const { data, isLoading, isError } = useFetch({
    url: finalApiUrl,
    queryKey: finalQueryKey,
    enabled: shouldEnableFetch,
  });

  // Process and prepare items for display
  const items = useMemo(() => {
    // Extract data from nested path if specified
    const allItems = extractNestedData(data, dataPath);
    
    // Filter by category if specified
    const filteredItems = filterByCategory(allItems, filterCategory);
    
    // Add selected item if needed
    return prepareItems(filteredItems, selectedItem, value, valueKey);
  }, [data, dataPath, filterCategory, selectedItem, value, valueKey]);

  return {
    items,
    isLoading,
    isError,
    shouldEnableFetch,
  };
};
