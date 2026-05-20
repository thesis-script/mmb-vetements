import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(
        i => i.productId === action.item.productId && i.color === action.item.color && i.size === action.item.size
      );
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.productId === action.item.productId && i.color === action.item.color && i.size === action.item.size
              ? { ...i, quantity: i.quantity + action.item.quantity }
              : i
          ),
        };
      }
      return { ...state, items: [...state.items, action.item] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((_, idx) => idx !== action.index) };
    case 'UPDATE_QTY':
      return {
        ...state,
        items: state.items.map((item, idx) =>
          idx === action.index ? { ...item, quantity: action.qty } : item
        ),
      };
    case 'CLEAR':
      return { items: [] };
    case 'LOAD':
      return { items: action.items };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  useEffect(() => {
    const saved = localStorage.getItem('mmb_cart');
    if (saved) dispatch({ type: 'LOAD', items: JSON.parse(saved) });
  }, []);

  useEffect(() => {
    localStorage.setItem('mmb_cart', JSON.stringify(state.items));
  }, [state.items]);

  const total = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = state.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items: state.items, total, count, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
