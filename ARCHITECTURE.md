# MMB Frontend Storage Architecture
## Complete Implementation Guide

---

## 1. Storage Solution Decision: **localStorage** (with a clear upgrade path)

### Why localStorage for your case — not the alternatives:

| Solution | Verdict | Why rejected |
|---|---|---|
| **sessionStorage** | ❌ | Data vanishes on tab close / refresh. You explicitly need persistence. |
| **Cookies** | ❌ | 4 KB limit. Sent with every HTTP request (wasteful, leaks data). Designed for server communication, not app state. |
| **Cache API** | ❌ | Designed for caching network responses (SW-related). Not a key-value store for app data. Can't store structured data meaningfully. |
| **IndexedDB** | ⚠️ Overkill for now | Async, complex API, 50MB+ capacity. Correct for high-volume or binary data. See §6 for the migration trigger. |
| **localStorage** | ✅ **Best fit** | Synchronous, 5 MB, JSON-serialisable, persistent, zero-dependency. Exactly right for a catalog-scale admin tool. |

**Your data profile:**
- ~20-100 products (JSON: ~1-5 KB each = ~500 KB total without images)
- ~50-500 orders (JSON: ~200 bytes each = ~100 KB)
- Images are the only risk → solved by canvas compression (§4)
- Admin-only writes (no concurrent multi-user conflicts)
- No real-time sync requirements

localStorage handles this comfortably.

---

## 2. Architecture Overview

```
src/
├── utils/
│   ├── storage.js          ← Primitive get/set/remove (namespaced)
│   ├── id.js               ← Collision-resistant ID generation
│   ├── repository.js       ← Generic CRUD factory (soft delete, restore)
│   ├── repositories.js     ← Typed singletons: ProductRepo, OrderRepo, DesignOrderRepo
│   └── imageStorage.js     ← File → canvas compression → base64
│
├── hooks/
│   ├── useLocalStorage.js  ← Low-level hook (React ↔ localStorage sync)
│   └── useRepository.js    ← High-level hook (repo → React state bridge)
│
├── context/
│   └── StoreContext.jsx    ← Three separate contexts (prevents cross-entity re-renders)
│
└── pages/
    └── Admin.jsx           ← Consumes useProducts / useOrders / useDesignOrders
```

### The Layered Architecture (read top-down):

```
Admin.jsx (UI)
    ↓ calls
useProducts() / useOrders() / useDesignOrders()   (StoreContext.jsx)
    ↓ uses
useRepository(repo)     (hooks/useRepository.js)
    ↓ calls
ProductRepo / OrderRepo / DesignOrderRepo          (utils/repositories.js)
    ↓ uses
createRepository(key, { seed })                    (utils/repository.js)
    ↓ calls
storageGet / storageSet                            (utils/storage.js)
    ↓ wraps
localStorage
```

Each layer has ONE responsibility. Swap any layer independently.

---

## 3. Migration Steps (from CacheContext to StoreProvider)

### Step 1: Replace provider in App.js
```jsx
// BEFORE
import { CacheProvider } from './context/CacheContext';
<CacheProvider>...</CacheProvider>

// AFTER
import { StoreProvider } from './context/StoreContext';
<StoreProvider>...</StoreProvider>
```

### Step 2: Update any component that used useCache()
```jsx
// BEFORE
import { useCache } from '../context/CacheContext';
const { products, addProduct, updateProduct, deleteProduct } = useCache();

// AFTER
import { useProducts } from '../context/StoreContext';
const { records: products, create, update, softDelete } = useProducts();
```

### Step 3: Orders
```jsx
// BEFORE
const { orders, addOrder, updateOrderStatus } = useCache();

// AFTER
import { useOrders } from '../context/StoreContext';
const { records: orders, create: addOrder, update: updateOrder } = useOrders();
```

### Step 4: Design Orders
```jsx
// BEFORE
const { designOrders, addDesignOrder, updateDesignOrder, deleteDesignOrder } = useCache();

// AFTER
import { useDesignOrders } from '../context/StoreContext';
const { records: designOrders, create, update, softDelete } = useDesignOrders();
```

### Step 5: CustomDesign.jsx (submitting a design order)
```jsx
import { useDesignOrders } from '../context/StoreContext';
const { create: addDesignOrder } = useDesignOrders();

// When submitting:
addDesignOrder({
  name: form.name,
  phone: form.phone,
  clothingType: form.type,
  fabric: form.fabric,
  quantity: form.qty,
  image: compressedBase64,   // from processImageFile()
  status: 'pending',
});
```

### Step 6: Cart.jsx (submitting an order)
```jsx
import { useOrders } from '../context/StoreContext';
const { create: addOrder } = useOrders();

addOrder({
  customer: form.name,
  phone: form.phone,
  wilaya: form.wilaya,
  items: cartItems,
  total: cartTotal,
  paymentMethod: form.payment,
  status: 'pending',
});
```

---

## 4. Image Upload — How the Compression Works

```jsx
import { processImageFile } from '../utils/imageStorage';

// In any component with an <input type="file">:
const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  try {
    const base64 = await processImageFile(file);
    // base64 is now a compressed JPEG data URL, typically 30-100 KB
    // Store it in your product's images[] array
    updateProduct(id, { images: [base64] });
  } catch (err) {
    // err.message is already in Arabic — display it directly
    setError(err.message);
  }
};
```

**What processImageFile does:**
1. Validates file type (must be image/*)
2. Rejects files > 5 MB before processing
3. Draws onto an off-screen `<canvas>` at max 800px
4. Re-encodes as JPEG at 75% quality
5. Returns a data URL (~30-100 KB)

**Compression ratio: typically 30:1 to 60:1** for typical product photos.

---

## 5. Soft Delete Flow

```
Admin clicks "Delete" button
    → deleteProduct(id)          [calls repo.softDelete(id)]
    → sets { isDeleted: true, deletedAt: timestamp }
    → product disappears from main list immediately (optimistic UI)
    → product appears in "Trash" tab

Admin clicks "Restore" button in Trash
    → restoreProduct(id)         [calls repo.restore(id)]
    → sets { isDeleted: false, deletedAt: null }
    → product reappears in main list

Admin clicks "Permanent Delete" in Trash
    → hardDelete(id)             [calls repo.hardDelete(id)]
    → record removed from storage forever
```

---

## 6. When to Switch from localStorage to IndexedDB

Switch when you hit ANY of these:

| Trigger | Why it matters |
|---|---|
| `QuotaExceededError` in console | You've hit the ~5 MB limit |
| More than 80 compressed product images | Image base64 dominates storage |
| Design reference images uploaded by users | These can be 5-20 MB originals |
| Need to store PDFs, invoices, documents | Binary data → IndexedDB Blobs |
| Admin panel feels sluggish during saves | JSON.stringify of large arrays is O(n) |
| You want background sync / Service Worker | localStorage is synchronous, blocks main thread |

**Migration cost:** Replace `storageGet`/`storageSet` in `storage.js` with `idb-keyval` calls (< 1 KB library, identical API). All layers above it stay unchanged.

```js
// idb-keyval drop-in (example)
import { get, set } from 'idb-keyval';

export const storageGet = async (key, fallback) => {
  const val = await get(NS + key);
  return val ?? fallback;
};
```

---

## 7. Security Limitations (frontend-only storage)

Be explicit about what this architecture CANNOT do:

| Risk | Reality |
|---|---|
| **Any JS on the page can read localStorage** | XSS attack → full data exposure. Mitigated by keeping dependencies minimal and CSP headers. |
| **Auth is fake** | `AuthManager` stores a "token" in localStorage. This is not real authentication — any user who opens DevTools can bypass it by writing the token manually. Acceptable for a local admin panel. Unacceptable for production multi-user systems. |
| **Data is visible in DevTools** | Any person with physical browser access sees all data. |
| **No encryption** | localStorage is plaintext. Do not store passwords, payment info, or PII in production. |
| **No backup** | Browser clear-data or `storageReset()` wipes everything. Consider periodic JSON export as a backup feature. |

**What "professional" frontend-only apps actually do:**
- Use localStorage for non-sensitive UI state and preferences
- Use a backend API for any real data (even serverless/BaaS like Supabase or Firebase)
- Never store credentials, PII, or business-critical data in localStorage
- Your setup is appropriate because it's an internal admin tool, not a public-facing authenticated service

---

## 8. Performance Optimisations Built In

### A. Three separate contexts
Each entity has its own React context. Updating a product does NOT re-render components that consume `useOrders()`. This is the highest-impact optimisation.

### B. Optimistic state updates
After every mutation, we update React state in-memory directly:
```js
// We DON'T do this (2× serialisation):
repo.update(id, data);
setRecords(repo.getAll()); // reads storage again

// We DO this (0× extra reads):
const updated = repo.update(id, data); // writes to storage
setRecords(prev => prev.map(r => r.id === id ? updated : r)); // updates memory
```

### C. Stable hook references
All CRUD functions in `useRepository` are wrapped in `useCallback` with correct dependency arrays. Passing them as props won't trigger child re-renders.

### D. Lazy state initialisation
```js
// useState(() => ...) runs ONCE on mount, not on every render
const [records, setRecords] = useState(() => repo.getAll());
```

### E. Storage usage indicator
The `<StorageUsage />` component shows a real-time progress bar. Warn users before they hit the limit, not after.

---

## 9. Adding a New Data Entity (e.g., "Suppliers")

1. Add seed data to `staticData.js`
2. Add one line to `repositories.js`:
   ```js
   export const SupplierRepo = createRepository('suppliers', { seed: staticSuppliers });
   ```
3. Add one context to `StoreContext.jsx`:
   ```jsx
   const SupplierContext = createContext(null);
   // inside StoreProvider:
   const suppliers = useRepository(SupplierRepo);
   // wrap children:
   <SupplierContext.Provider value={suppliers}>...</SupplierContext.Provider>
   // export hook:
   export const useSuppliers = () => useContext(SupplierContext);
   ```
4. Use in any component: `const { records, create, update, softDelete } = useSuppliers();`

Total time: ~10 minutes, zero duplication.
