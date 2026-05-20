/**
 * Temporary Cache System
 * Stores data in localStorage with optional expiration
 * All data persists during the session (until browser refresh or session end)
 */

const CACHE_PREFIX = 'mmb_cache_';
const CACHE_EXPIRY_PREFIX = 'mmb_expiry_';
const DEFAULT_EXPIRY_HOURS = 24; // Cache expires after 24 hours

class CacheManager {
  /**
   * Set data in cache with optional expiration
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {number} expiryHours - Expiration time in hours (default: 24)
   */
  static set(key, data, expiryHours = DEFAULT_EXPIRY_HOURS) {
    try {
      const cacheKey = CACHE_PREFIX + key;
      const dataStr = JSON.stringify(data);
      localStorage.setItem(cacheKey, dataStr);

      // Set expiration time
      if (expiryHours > 0) {
        const expiryTime = Date.now() + expiryHours * 60 * 60 * 1000;
        localStorage.setItem(CACHE_EXPIRY_PREFIX + key, expiryTime.toString());
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Get data from cache
   * @param {string} key - Cache key
   * @returns {any|null} - Cached data or null if expired/not found
   */
  static get(key, defaultValue = null) {
    try {
      const cacheKey = CACHE_PREFIX + key;
      const expiryKey = CACHE_EXPIRY_PREFIX + key;

      // Check if cache exists
      const cachedData = localStorage.getItem(cacheKey);
      if (!cachedData) return defaultValue;

      // Check if expired
      const expiryTime = localStorage.getItem(expiryKey);
      if (expiryTime && Date.now() > parseInt(expiryTime)) {
        this.remove(key);
        return defaultValue;
      }

      return JSON.parse(cachedData);
    } catch (error) {
      console.error('Cache get error:', error);
      return defaultValue;
    }
  }

  /**
   * Remove data from cache
   * @param {string} key - Cache key
   */
  static remove(key) {
    try {
      localStorage.removeItem(CACHE_PREFIX + key);
      localStorage.removeItem(CACHE_EXPIRY_PREFIX + key);
    } catch (error) {
      console.error('Cache remove error:', error);
    }
  }

  /**
   * Clear all cache
   */
  static clearAll() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX) || key.startsWith(CACHE_EXPIRY_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  /**
   * Get all cached products (merged with static products)
   */
  static getProducts(staticProducts = []) {
    const cachedProducts = this.get('products', []);
    const mergedMap = new Map();

    // Add static products
    staticProducts.forEach(p => mergedMap.set(p.id, p));

    // Override/add cached products
    cachedProducts.forEach(p => mergedMap.set(p.id, p));

    return Array.from(mergedMap.values());
  }

  /**
   * Add/Update product in cache
   */
  static setProduct(product) {
    const products = this.get('products', []);
    const existingIndex = products.findIndex(p => p.id === product.id);
    
    if (existingIndex >= 0) {
      products[existingIndex] = product;
    } else {
      products.push(product);
    }
    
    this.set('products', products);
    return product;
  }

  /**
   * Delete product from cache
   */
  static deleteProduct(productId) {
    const products = this.get('products', []);
    const filtered = products.filter(p => p.id !== productId);
    this.set('products', filtered);
  }

  /**
   * Get all cached orders
   */
  static getOrders(staticOrders = []) {
    const cachedOrders = this.get('orders', []);
    return [...staticOrders, ...cachedOrders];
  }

  /**
   * Add order to cache
   */
  static addOrder(order) {
    const orders = this.get('orders', []);
    orders.push({
      ...order,
      id: order.id || 'ORD-' + Date.now(),
      date: order.date || new Date().toLocaleDateString('ar-DZ'),
      status: order.status || 'pending',
    });
    this.set('orders', orders);
    return orders[orders.length - 1];
  }

  /**
   * Update order status
   */
  static updateOrderStatus(orderId, newStatus) {
    const orders = this.get('orders', []);
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      this.set('orders', orders);
    }
    return order;
  }

  /**
   * Get all cached design orders
   */
  static getDesignOrders(staticDesignOrders = []) {
    const cachedDesignOrders = this.get('design_orders', []);
    return [...staticDesignOrders, ...cachedDesignOrders];
  }

  /**
   * Add design order to cache
   */
  static addDesignOrder(designOrder) {
    const orders = this.get('design_orders', []);
    const newOrder = {
      ...designOrder,
      id: designOrder.id || 'DSG-' + Date.now(),
      date: designOrder.date || new Date().toLocaleDateString('ar-DZ'),
      status: designOrder.status || 'pending',
    };
    orders.push(newOrder);
    this.set('design_orders', orders);
    return newOrder;
  }

  /**
   * Update design order
   */
  static updateDesignOrder(orderId, updates) {
    const orders = this.get('design_orders', []);
    const order = orders.find(o => o.id === orderId);
    if (order) {
      Object.assign(order, updates);
      this.set('design_orders', orders);
    }
    return order;
  }

  /**
   * Delete design order
   */
  static deleteDesignOrder(orderId) {
    const orders = this.get('design_orders', []);
    const filtered = orders.filter(o => o.id !== orderId);
    this.set('design_orders', filtered);
  }

  /**
   * Convert image file to base64 for caching
   */
  static async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

export default CacheManager;
