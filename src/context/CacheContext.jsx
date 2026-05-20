import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import CacheManager from '../utils/cache';
import { products as staticProducts, orders as staticOrders, designOrders as staticDesignOrders } from '../data/staticData';

const CacheContext = createContext();

export const CacheProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [designOrders, setDesignOrders] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Initialize cache from localStorage
  useEffect(() => {
    const loadedProducts = CacheManager.getProducts(staticProducts);
    const loadedOrders = CacheManager.getOrders(staticOrders);
    const loadedDesignOrders = CacheManager.getDesignOrders(staticDesignOrders);

    setProducts(loadedProducts);
    setOrders(loadedOrders);
    setDesignOrders(loadedDesignOrders);
  }, [refreshTrigger]);

  // Trigger refresh
  const refresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Product operations
  const addProduct = useCallback((product) => {
    CacheManager.setProduct(product);
    refresh();
    return product;
  }, [refresh]);

  const updateProduct = useCallback((productId, updates) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const updated = { ...product, ...updates };
      CacheManager.setProduct(updated);
      refresh();
      return updated;
    }
    return null;
  }, [products, refresh]);

  const deleteProduct = useCallback((productId) => {
    CacheManager.deleteProduct(productId);
    refresh();
  }, [refresh]);

  // Order operations
  const addOrder = useCallback((order) => {
    const result = CacheManager.addOrder(order);
    refresh();
    return result;
  }, [refresh]);

  const updateOrderStatus = useCallback((orderId, status) => {
    CacheManager.updateOrderStatus(orderId, status);
    refresh();
  }, [refresh]);

  // Design order operations
  const addDesignOrder = useCallback((designOrder) => {
    const result = CacheManager.addDesignOrder(designOrder);
    refresh();
    return result;
  }, [refresh]);

  const updateDesignOrder = useCallback((orderId, updates) => {
    CacheManager.updateDesignOrder(orderId, updates);
    refresh();
  }, [refresh]);

  const deleteDesignOrder = useCallback((orderId) => {
    CacheManager.deleteDesignOrder(orderId);
    refresh();
  }, [refresh]);

  const value = {
    // Products
    products,
    addProduct,
    updateProduct,
    deleteProduct,

    // Orders
    orders,
    addOrder,
    updateOrderStatus,

    // Design Orders
    designOrders,
    addDesignOrder,
    updateDesignOrder,
    deleteDesignOrder,

    // Utilities
    refresh,
    CacheManager,
  };

  return <CacheContext.Provider value={value}>{children}</CacheContext.Provider>;
};

export const useCache = () => {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error('useCache must be used within CacheProvider');
  }
  return context;
};
