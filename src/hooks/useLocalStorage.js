import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useLocalStorage — a production-grade hook that keeps React state and
 * localStorage perfectly in sync with zero unnecessary re-renders.
 *
 * Key decisions:
 *  - Lazy initializer: reads storage ONCE on mount, never on re-render.
 *  - storage event listener: syncs across browser tabs automatically.
 *  - Error boundary: gracefully handles QuotaExceededError and JSON parse failures.
 *  - Stable setter identity (useCallback + ref) prevents infinite loops in
 *    useEffect dependency arrays.
 */
export function useLocalStorage(key, initialValue) {
  // Lazy initialization — runs once on mount only
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // Keep a ref so our storage event listener always sees the latest key
  const keyRef = useRef(key);
  useEffect(() => { keyRef.current = key; }, [key]);

  // Write to localStorage whenever storedValue changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('[useLocalStorage] Storage quota exceeded for key:', key);
      }
    }
  }, [key, storedValue]);

  // Sync across browser tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === keyRef.current && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch {
          // ignore malformed values from other tabs
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Stable setter — same reference across renders, safe in useEffect deps
  const setValue = useCallback((value) => {
    setStoredValue((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      return next;
    });
  }, []);

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch {
      // ignore
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
