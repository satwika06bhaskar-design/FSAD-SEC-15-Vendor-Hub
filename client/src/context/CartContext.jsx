import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "marketplace_cart";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setItems(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (product) => {
    setItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [...current, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, quantity) => {
    const nextQuantity = Number(quantity);
    setItems((current) =>
      current
        .map((item) =>
          item.id === productId ? { ...item, quantity: nextQuantity } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId) => {
    setItems((current) => current.filter((item) => item.id !== productId));
  };

  const clearCart = () => setItems([]);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        total,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
