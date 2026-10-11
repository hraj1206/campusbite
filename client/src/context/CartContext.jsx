import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cb_cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [canteen, setCanteen] = useState(() => {
    try {
      const saved = localStorage.getItem('cb_cart_canteen');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('cb_cart', JSON.stringify(items));
    localStorage.setItem('cb_cart_canteen', JSON.stringify(canteen));
  }, [items, canteen]);

  const addToCart = (dish, dishCanteen) => {
    // Single Canteen Enforcement to prevent 409 Conflict
    if (canteen && canteen._id !== dish.canteenId) {
      const confirmed = window.confirm(
        `Your tray currently contains items from "${canteen.name}".\n\nEach order must be from a single canteen.\nDo you want to discard your tray and start adding from "${dishCanteen?.name || 'this canteen'}"?`
      );
      if (!confirmed) return false;
      // Clear and proceed with new canteen
      setItems([{ menuItemId: dish._id, name: dish.name, price: dish.price, quantity: 1 }]);
      setCanteen(dishCanteen || { _id: dish.canteenId, name: 'Canteen' });
      return true;
    }

    if (!canteen && dishCanteen) {
      setCanteen(dishCanteen);
    }

    setItems((prev) => {
      const existing = prev.find((i) => i.menuItemId === dish._id);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === dish._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { menuItemId: dish._id, name: dish.name, price: dish.price, quantity: 1 }];
    });
    return true;
  };

  const updateQuantity = (menuItemId, delta) => {
    setItems((prev) => {
      const next = prev
        .map((i) => {
          if (i.menuItemId === menuItemId) {
            const nextQty = i.quantity + delta;
            return nextQty > 0 ? { ...i, quantity: nextQty } : null;
          }
          return i;
        })
        .filter(Boolean);

      if (next.length === 0) {
        setCanteen(null);
      }
      return next;
    });
  };

  const removeFromCart = (menuItemId) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.menuItemId !== menuItemId);
      if (next.length === 0) setCanteen(null);
      return next;
    });
  };

  const clearCart = () => {
    setItems([]);
    setCanteen(null);
  };

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        canteen,
        isDrawerOpen,
        setIsDrawerOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalAmount,
        totalCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
