import React, { createContext, useContext, useEffect, useState } from "react";
import { MAX_CHECKOUT_QUANTITY } from "@/lib/product-keys";
import { sumMoneyAmounts } from "@/lib/products";

export type CartItem = {
  slug: string;
  productKey: string;
  variantKey: string; // Unique line identity in the cart
  name: string;
  image: string;
  price: number;
  quantity: number;
  selectedSize?: string;
  selectedHandle?: string;
  selectedStyle?: string;
  sku?: string;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (variantKey: string) => void;
  updateQuantity: (variantKey: string, quantity: number) => void;
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

  // Load cart from localStorage on mount and parse/migrate safely
  useEffect(() => {
    try {
      const stored = localStorage.getItem("katana_edge_cart");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const migrated = parsed.map((item: any) => {
            // Already migrated / uses new structure
            if (item.variantKey) {
              return item;
            }

            // Map legacy unambiguous checkout items
            if (item.slug === "fujisan-thinning-shears" || item.slug === "fujisan-thinning-scissors") {
              return {
                ...item,
                slug: "fujisan-thinning-shears",
                productKey: "fujisan",
                variantKey: "fujisan",
              };
            }
            if (item.slug === "naruto-shears") {
              return {
                ...item,
                slug: "naruto-shears",
                productKey: "naruto",
                variantKey: "naruto",
              };
            }
            
            // Micro Slit requires sizing, map to legacy flag so user is prompted to reselect
            if (item.slug === "micro-slit-shears" || item.slug === "micro-slit-scissors") {
              return {
                ...item,
                slug: "micro-slit-shears",
                productKey: "microslit",
                variantKey: "legacy_microslit",
              };
            }

            // Default safe fallback map
            const rawKey = item.slug.replace("-shears", "").replace("-thinning", "").replace("-", "_");
            return {
              ...item,
              productKey: rawKey,
              variantKey: `${rawKey}_default`,
            };
          });
          setItems(migrated);
        }
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
      const existing = prev.find((item) => item.variantKey === newItem.variantKey);
      if (existing) {
        return prev.map((item) =>
          item.variantKey === newItem.variantKey
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

  const removeItem = (variantKey: string) => {
    setItems((prev) => prev.filter((item) => item.variantKey !== variantKey));
  };

  const updateQuantity = (variantKey: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(variantKey);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.variantKey === variantKey
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
