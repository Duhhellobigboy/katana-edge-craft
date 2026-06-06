import React, { createContext, useContext, useEffect, useState } from "react";
import { MAX_CHECKOUT_QUANTITY } from "@/lib/product-keys";
import { sumMoneyAmounts } from "@/lib/products";

export type CartItem = {
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (slug: string) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  openCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("katana_edge_cart");
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load cart from localStorage", e);
    }
    setIsHydrated(true);
  }, []);

  // Save cart to localStorage on changes (only after hydration)
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem("katana_edge_cart", JSON.stringify(items));
      } catch (e) {
        console.error("Failed to save cart to localStorage", e);
      }
    }
  }, [items, isHydrated]);

  const addItem = (newItem: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.slug === newItem.slug);
      if (existing) {
        return prev.map((item) =>
          item.slug === newItem.slug
            ? {
                ...item,
                quantity: Math.min(
                  MAX_CHECKOUT_QUANTITY,
                  item.quantity + quantity
                ),
              }
            : item
        );
      }
      return [
        ...prev,
        { ...newItem, quantity: Math.min(MAX_CHECKOUT_QUANTITY, quantity) },
      ];
    });
    setCartOpen(true);
  };

  const removeItem = (slug: string) => {
    setItems((prev) => prev.filter((item) => item.slug !== slug));
  };

  const updateQuantity = (slug: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(slug);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.slug === slug
          ? { ...item, quantity: Math.min(MAX_CHECKOUT_QUANTITY, quantity) }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = sumMoneyAmounts(
    items.map((item) => ({ unitPrice: item.price, quantity: item.quantity })),
  );

  return (
    <CartContext.Provider
      value={{
        items: isHydrated ? items : [],
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        cartCount: isHydrated ? cartCount : 0,
        cartTotal: isHydrated ? cartTotal : 0,
        cartOpen,
        setCartOpen,
        openCart: () => setCartOpen(true),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
