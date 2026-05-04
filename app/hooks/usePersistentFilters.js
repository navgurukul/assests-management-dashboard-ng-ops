import { useState, useEffect } from 'react';

export function usePersistentFilters(key, initialValue = {}) {
  const [filters, setFilters] = useState(initialValue);

  // Load from storage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const item = sessionStorage.getItem(key);
        if (item) {
          setFilters(JSON.parse(item));
        }
      } catch (error) {
        console.warn(`Error reading sessionStorage key "${key}":`, error);
      }
    }
  }, [key]);

  // Update storage & state
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(filters) : value;
      setFilters(valueToStore);
      if (typeof window !== 'undefined') {
        if (Object.keys(valueToStore).length === 0) {
          sessionStorage.removeItem(key);
        } else {
          sessionStorage.setItem(key, JSON.stringify(valueToStore));
        }
      }
    } catch (error) {
      console.warn(`Error setting sessionStorage key "${key}":`, error);
    }
  };

  return [filters, setValue];
}
