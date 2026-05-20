/**
 * storage.js — Low-level localStorage utilities.
 *
 * WHY a separate layer instead of raw localStorage calls:
 *  - Centralises all JSON serialisation / error handling in ONE place.
 *  - Makes the app trivially swappable to IndexedDB later (swap this file only).
 *  - Every function is pure and synchronous — easy to unit-test.
 *
 * Namespace prefix ('mmb_') guarantees our keys never collide with
 * third-party scripts, analytics SDKs, or browser extensions that also
 * write to localStorage.
 */

const NS = 'mmb_';

// ─── primitive helpers ────────────────────────────────────────────────────────

export const storageGet = (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(NS + key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export const storageSet = (key, value) => {
  try {
    localStorage.setItem(NS + key, JSON.stringify(value));
    return true;
  } catch (err) {
    if (err.name === 'QuotaExceededError') {
      console.error('[storage] Quota exceeded — cannot save key:', key);
    }
    return false;
  }
};

export const storageRemove = (key) => {
  try {
    localStorage.removeItem(NS + key);
    return true;
  } catch {
    return false;
  }
};

/** Wipe ALL mmb_ keys — useful for a "reset app" / debug action */
export const storageClearAll = () => {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(NS))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore
  }
};

// ─── size utility ─────────────────────────────────────────────────────────────

/**
 * Returns approximate storage usage for mmb_ keys in kilobytes.
 * Useful to surface a warning before hitting the ~5 MB browser limit.
 */
export const storageUsageKB = () => {
  try {
    return (
      Object.keys(localStorage)
        .filter((k) => k.startsWith(NS))
        .reduce((sum, k) => sum + (localStorage.getItem(k)?.length ?? 0), 0) / 1024
    ).toFixed(2);
  } catch {
    return 0;
  }
};
