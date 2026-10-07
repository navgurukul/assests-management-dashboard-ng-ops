import { useState } from 'react';

export function usePersistentState(key, initialValue = {}) {
  const [state, setState] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const item = sessionStorage.getItem(key);
        if (item) {
          return JSON.parse(item);
        }
      } catch (error) {
        console.warn(`Error reading sessionStorage key "${key}":`, error);
      }
    }
    return initialValue;
  });

  // Update storage & state
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(state) : value;
      setState(valueToStore);
      if (typeof window !== 'undefined') {
        // Handle empty check for both objects and primitive types (e.g. strings)
        const isEmpty =
          valueToStore === null ||
          valueToStore === undefined ||
          valueToStore === '' ||
          (typeof valueToStore === 'object' && Object.keys(valueToStore).length === 0);

        if (isEmpty) {
          sessionStorage.removeItem(key);
        } else {
          sessionStorage.setItem(key, JSON.stringify(valueToStore));
        }
      }
    } catch (error) {
      console.warn(`Error setting sessionStorage key "${key}":`, error);
    }
  };

  return [state, setValue];
}
