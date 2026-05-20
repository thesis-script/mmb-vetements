/**
 * repositories.js — Instantiates typed CRUD repositories for each entity.
 *
 * WHY instantiate here instead of inline in the context?
 *  - Repositories are singletons: one instance per entity, shared everywhere.
 *  - They carry no React state — they are pure storage adapters.
 *  - Easy to import individually in utilities, tests, or outside React trees.
 *
 * Each repository gets:
 *  - A unique localStorage key (namespaced via storage.js)
 *  - Its static seed data (so first-launch has demo content)
 */

import { createRepository } from './repository';
import {
  products as staticProducts,
  orders as staticOrders,
  designOrders as staticDesignOrders,
} from '../data/staticData';

export const ProductRepo = createRepository('products', {
  seed: staticProducts,
});

export const OrderRepo = createRepository('orders', {
  seed: staticOrders,
});

export const DesignOrderRepo = createRepository('design_orders', {
  seed: staticDesignOrders,
});
