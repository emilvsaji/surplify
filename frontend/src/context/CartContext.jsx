import { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartShopId, setCartShopId] = useState(null);

  const addToCart = (food, shopId) => {
    // Cart can only contain items from one shop at a time
    if (cartShopId && cartShopId !== shopId) {
      setCartItems([]);
      setCartShopId(shopId);
    }

    if (!cartShopId) setCartShopId(shopId);

    setCartItems((prev) => {
      const existing = prev.find((item) => item._id === food._id);
      if (existing) {
        return prev.map((item) =>
          item._id === food._id
            ? { ...item, quantity: Math.min(item.quantity + 1, food.quantityAvailable) }
            : item
        );
      }
      return [...prev, { ...food, quantity: 1 }];
    });
  };

  const removeFromCart = (foodId) => {
    setCartItems((prev) => {
      const updated = prev.filter((item) => item._id !== foodId);
      if (updated.length === 0) setCartShopId(null);
      return updated;
    });
  };

  const updateQuantity = (foodId, quantity) => {
    if (quantity <= 0) return removeFromCart(foodId);
    setCartItems((prev) =>
      prev.map((item) => (item._id === foodId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setCartShopId(null);
  };

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.discountedPrice * item.quantity,
    0
  );

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartShopId,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
