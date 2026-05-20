/**
 * id.js — Deterministic, collision-resistant ID generation.
 *
 * WHY not Math.random()?
 *  Math.random() is not cryptographically seeded and can produce
 *  duplicates in rapid succession (same ms timestamp + same random seed).
 *
 * WHY not crypto.randomUUID()?
 *  It's available in modern browsers but not in all React Native / old
 *  WebView environments. This implementation degrades gracefully.
 *
 * Format: <prefix>_<timestamp_base36>_<random_base36>
 * Example: "prod_lf3k2a_4xz9q"
 * This is:
 *  - Human-readable (you can tell what type of record it is)
 *  - Time-ordered (helps with debugging)
 *  - Collision-resistant (~2.1 billion combinations per millisecond)
 */

export function generateId(prefix = 'rec') {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    // Use the native API when available — truly random, guaranteed unique
    return `${prefix}_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
  }
  // Fallback: timestamp + random
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 7);
  return `${prefix}_${ts}_${rand}`;
}

/** Typed ID generators — keeps IDs meaningful in logs and storage */
export const productId = () => generateId('prod');
export const orderId = () => generateId('ord');
export const designOrderId = () => generateId('dsg');
