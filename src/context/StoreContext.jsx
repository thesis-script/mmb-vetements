/**
 * StoreContext.jsx — The single source of truth for all app data.
 *
 * ── Architecture Decision: Context vs. Zustand / Redux ───────────────────────
 * For this app, React Context + useRepository is the right choice because:
 *  - No extra library dependency
 *  - Data mutations are infrequent (admin panel CRUD, not real-time)
 *  - The tree is shallow enough that context re-renders are acceptable
 *  - If performance becomes an issue, replace with Zustand in ONE file
 *
 * ── Why NOT prop-drilling the repo hooks down from App? ───────────────────────
 * Three entities × multiple pages = deeply nested props.
 * Context is the idiomatic React answer. Any component can access
 * useStore() without threading props through intermediate components.
 *
 * ── Preventing unnecessary re-renders ────────────────────────────────────────
 * Each entity has its OWN context value object. A change to products
 * does NOT re-render components that only consume orders.
 * This is the most impactful performance optimisation for context-based apps.
 */

import React, { createContext, useContext, useMemo } from 'react';
import { useRepository } from '../hooks/useRepository';
import { ProductRepo, OrderRepo, DesignOrderRepo } from '../utils/repositories';

// ── Three separate contexts = three separate re-render trees ──────────────────

const ProductContext = createContext(null);
const OrderContext   = createContext(null);
const DesignContext  = createContext(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function StoreProvider({ children }) {
  const products     = useRepository(ProductRepo);
  const orders       = useRepository(OrderRepo);
  const designOrders = useRepository(DesignOrderRepo);

  // Memoize each value independently.
  // useMemo keyed on the repo state arrays means the context object only
  // changes when the underlying data changes — not on every parent render.
  const productValue = useMemo(() => products, [products.records, products.error]); // eslint-disable-line
  const orderValue   = useMemo(() => orders,   [orders.records, orders.error]);     // eslint-disable-line
  const designValue  = useMemo(() => designOrders, [designOrders.records, designOrders.error]); // eslint-disable-line

  return (
    <ProductContext.Provider value={productValue}>
      <OrderContext.Provider value={orderValue}>
        <DesignContext.Provider value={designValue}>
          {children}
        </DesignContext.Provider>
      </OrderContext.Provider>
    </ProductContext.Provider>
  );
}

// ── Typed hooks — use these everywhere, never useContext directly ─────────────

export function useProducts() {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error('useProducts must be used inside <StoreProvider>');
  return ctx;
}

export function useOrders() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrders must be used inside <StoreProvider>');
  return ctx;
}

export function useDesignOrders() {
  const ctx = useContext(DesignContext);
  if (!ctx) throw new Error('useDesignOrders must be used inside <StoreProvider>');
  return ctx;
}
