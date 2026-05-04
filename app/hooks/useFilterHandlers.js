import { useCallback } from 'react';

export const useFilterHandlers = (filters, setFilters, setCurrentPage) => {
  const handleRemoveFilter = useCallback(
    (filterKey) => {
      const newFilters = { ...filters };
      delete newFilters[filterKey];
      setFilters(newFilters);
      if (setCurrentPage) {
        setCurrentPage(1);
      }
    },
    [filters, setFilters, setCurrentPage]
  );

  const handleClearAllFilters = useCallback(() => {
    setFilters({});
    if (setCurrentPage) {
      setCurrentPage(1);
    }
  }, [setFilters, setCurrentPage]);

  return { handleRemoveFilter, handleClearAllFilters };
};
