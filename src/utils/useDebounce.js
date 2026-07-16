import { useState, useEffect } from 'react';

/**
 * Debounces a value by the given delay.
 * Returns the debounced value that only updates after the specified delay
 * of inactivity on the input value.
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
