/**
 * createRepository(storageKey, options)
 *
 * A factory that generates a full CRUD + soft-delete repository for any
 * data collection stored in localStorage.
 *
 * WHY a factory?
 *  - DRY: products, orders, designOrders all need identical CRUD logic.
 *    Write it once, generate typed repos, never duplicate code.
 *  - Consistent: every collection gets the same field contract
 *    (id, createdAt, updatedAt, deletedAt, isDeleted).
 *  - Replaceable: if you later migrate to IndexedDB, you replace this
 *    factory only — all consumers stay unchanged.
 *
 * Soft delete:
 *  Instead of removing the record, we set  { isDeleted: true, deletedAt }
 *  This lets admins restore items and preserves referential integrity
 *  (e.g. orders referencing a "deleted" product still render correctly).
 */

import { storageGet, storageSet } from './storage';
import { generateId } from './id';

export function createRepository(storageKey, { seed = [] } = {}) {
  // ── internal helpers ────────────────────────────────────────────────────────

  function readAll() {
    // On first load, if nothing is in storage yet, seed with static data.
    const stored = storageGet(storageKey, null);
    if (stored === null) {
      const seeded = seed.map((item) => ({
        ...item,
        isDeleted: false,
        deletedAt: null,
        // Don't overwrite createdAt if seed data already has it
        createdAt: item.createdAt ?? new Date().toISOString(),
        updatedAt: item.updatedAt ?? new Date().toISOString(),
      }));
      storageSet(storageKey, seeded);
      return seeded;
    }
    return stored;
  }

  function writeAll(records) {
    storageSet(storageKey, records);
  }

  // ── public API ──────────────────────────────────────────────────────────────

  return {
    /**
     * READ — returns only non-deleted records by default.
     * Pass { includeDeleted: true } to see the trash too.
     */
    getAll({ includeDeleted = false } = {}) {
      const all = readAll();
      return includeDeleted ? all : all.filter((r) => !r.isDeleted);
    },

    getById(id) {
      return readAll().find((r) => r.id === id) ?? null;
    },

    /**
     * CREATE — merges caller's partial object with system fields.
     * The caller never needs to worry about id / timestamps.
     */
    create(data) {
      const all = readAll();
      const now = new Date().toISOString();
      const record = {
        ...data,
        id: data.id ?? generateId(),
        createdAt: now,
        updatedAt: now,
        isDeleted: false,
        deletedAt: null,
      };
      writeAll([...all, record]);
      return record;
    },

    /**
     * UPDATE — shallow-merges updates, bumps updatedAt.
     * Returns null if the record doesn't exist.
     */
    update(id, updates) {
      const all = readAll();
      let updated = null;
      const next = all.map((r) => {
        if (r.id !== id) return r;
        updated = { ...r, ...updates, id, updatedAt: new Date().toISOString() };
        return updated;
      });
      if (!updated) return null;
      writeAll(next);
      return updated;
    },

    /**
     * SOFT DELETE — marks isDeleted = true, preserves the record.
     * Use this by default everywhere in the UI.
     */
    softDelete(id) {
      return this.update(id, { isDeleted: true, deletedAt: new Date().toISOString() });
    },

    /**
     * RESTORE — un-deletes a soft-deleted record.
     */
    restore(id) {
      return this.update(id, { isDeleted: false, deletedAt: null });
    },

    /**
     * HARD DELETE — permanently removes the record. Use with caution.
     * Suitable only for drafts or items with no referential integrity needs.
     */
    hardDelete(id) {
      const all = readAll();
      writeAll(all.filter((r) => r.id !== id));
    },

    /**
     * UPSERT — create if not exists, update if exists.
     * Useful when syncing static seed data with user edits.
     */
    upsert(data) {
      const existing = this.getById(data.id);
      return existing ? this.update(data.id, data) : this.create(data);
    },

    /**
     * RESET — wipes stored data and re-seeds from static data.
     * Useful for a "restore defaults" admin action.
     */
    reset() {
      storageSet(storageKey, null);
      return readAll(); // triggers re-seed
    },

    /** Raw read — useful for debugging / export features */
    _raw: readAll,
  };
}
