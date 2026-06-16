import { createContext, useContext, useMemo, useState } from 'react';
import api from '../api/client.js';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [] });

  const loadCart = async () => {
    const { data } = await api.get('/cart');
    setCart(data);
  };

  const addToCart = async (productId, quantity = 1) => {
    const { data } = await api.post('/cart/items', { productId, quantity });
    setCart(data);
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return removeFromCart(productId);
    const { data } = await api.put(`/cart/items/${productId}`, { quantity });
    setCart(data);
  };

  const removeFromCart = async (productId) => {
    const { data } = await api.delete(`/cart/items/${productId}`);
    setCart(data);
  };

  const clearCart = () => setCart({ items: [] });

  const itemCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const subtotal = cart.items?.reduce((sum, item) => sum + item.product.price * item.quantity, 0) || 0;

  const value = useMemo(
    () => ({ cart, itemCount, subtotal, loadCart, addToCart, updateQuantity, removeFromCart, clearCart }),
    [cart, itemCount, subtotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
