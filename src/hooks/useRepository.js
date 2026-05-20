/**
 * useRepository — Connects a repository instance to live React state.
 *
 * ── The Core Problem it Solves ────────────────────────────────────────────────
 * Repositories read/write localStorage (synchronous, no events).
 * React needs state changes to trigger re-renders.
 * We need a bridge that:
 *  1. Initialises state from the repository on mount.
 *  2. After every mutation, writes to the repo AND updates React state
 *     atomically — no extra read(), no double-render.
 *  3. Exposes a stable API so child components can subscribe to it without
 *     worrying about whether it causes re-renders.
 *
 * ── Why "update state directly" instead of re-reading localStorage? ───────────
 * After a mutation we already know the new record.
 * We can update React state in-memory (O(1)) instead of serialising to
 * localStorage and then immediately deserialising back (O(n)).
 * This halves the serialisation work and is especially noticeable with
 * large product catalogs.
 *
 * @param {object} repo — A repository created by createRepository()
 * @param {{ includeDeleted: boolean }} options
 */

import { useState, useCallback } from 'react';

export function useRepository(repo, { includeDeleted = false } = {}) {
  const [records, setRecords] = useState(() => repo.getAll({ includeDeleted }));
  const [error, setError] = useState(null);

  /** Reload from storage (needed after external changes, e.g. another tab) */
  const refresh = useCallback(() => {
    try {
      setRecords(repo.getAll({ includeDeleted }));
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }, [repo, includeDeleted]);

  const create = useCallback((data) => {
    try {
      const created = repo.create(data);
      setRecords((prev) => [...prev, created]);
      setError(null);
      return created;
    } catch (e) {
      setError(e.message);
      return null;
    }
  }, [repo]);

  const update = useCallback((id, updates) => {
    try {
      const updated = repo.update(id, updates);
      if (!updated) throw new Error(`Record ${id} not found`);
      setRecords((prev) => prev.map((r) => (r.id === id ? updated : r)));
      setError(null);
      return updated;
    } catch (e) {
      setError(e.message);
      return null;
    }
  }, [repo]);

  /** Soft delete — keeps record in storage, hides from default list */
  const softDelete = useCallback((id) => {
    try {
      const deleted = repo.softDelete(id);
      // If includeDeleted is false, remove from visible list immediately
      setRecords((prev) =>
        includeDeleted
          ? prev.map((r) => (r.id === id ? deleted : r))
          : prev.filter((r) => r.id !== id)
      );
      setError(null);
      return deleted;
    } catch (e) {
      setError(e.message);
      return null;
    }
  }, [repo, includeDeleted]);

  /** Restore a soft-deleted record */
  const restore = useCallback((id) => {
    try {
      const restored = repo.restore(id);
      setRecords((prev) => prev.map((r) => (r.id === id ? restored : r)));
      setError(null);
      return restored;
    } catch (e) {
      setError(e.message);
      return null;
    }
  }, [repo]);

  /** Hard delete — permanent, use only for items with no references */
  const hardDelete = useCallback((id) => {
    try {
      repo.hardDelete(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }, [repo]);

  const upsert = useCallback((data) => {
    try {
      const result = repo.upsert(data);
      setRecords((prev) => {
        const exists = prev.find((r) => r.id === result.id);
        return exists
          ? prev.map((r) => (r.id === result.id ? result : r))
          : [...prev, result];
      });
      setError(null);
      return result;
    } catch (e) {
      setError(e.message);
      return null;
    }
  }, [repo]);

  const reset = useCallback(() => {
    try {
      const fresh = repo.reset();
      setRecords(includeDeleted ? fresh : fresh.filter((r) => !r.isDeleted));
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }, [repo, includeDeleted]);

  return {
    records,
    error,
    refresh,
    create,
    update,
    softDelete,
    restore,
    hardDelete,
    upsert,
    reset,
  };
}
