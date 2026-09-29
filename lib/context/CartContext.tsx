"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { CartItem } from "@/types/dairy";

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "id">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateVariant: (
    oldId: string,
    newVariantId: string,
    newVariantName: string,
    newPrice: number,
    newUnit: string
  ) => void;
  clearCart: () => void;
  totalCount: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  appliedCoupon: string | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  totalAmount: number;
  isLoaded: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("cart");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Normalize items
          const normalized: CartItem[] = parsed.map((item) => ({
            id: item.id ? String(item.id) : `${item.productId || item.name}-${item.variantId || "default"}`,
            productId: item.productId || String(item.id || item.name),
            variantId: item.variantId || "default",
            name: item.name || "Dairy Item",
            variantName: item.variantName || item.unit || "Standard",
            price: Number(item.price) || 0,
            image: item.image || "/milk.png",
            quantity: Number(item.quantity) > 0 ? Number(item.quantity) : 1,
            unit: item.unit || "unit",
          }));
          setCart(normalized);
        }
      }
    } catch (e) {
      console.error("Failed to load cart", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever cart changes
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    try {
      localStorage.setItem("cart", JSON.stringify(newCart));
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (e) {
      console.error("Failed to save cart", e);
    }
  };

  const addToCart = (newItem: Omit<CartItem, "id">) => {
    const itemId = `${newItem.productId}-${newItem.variantId}`;
    const existingIndex = cart.findIndex((i) => i.id === itemId);

    let updatedCart: CartItem[];
    if (existingIndex > -1) {
      updatedCart = cart.map((item, idx) =>
        idx === existingIndex
          ? { ...item, quantity: item.quantity + (newItem.quantity || 1) }
          : item
      );
    } else {
      updatedCart = [...cart, { ...newItem, id: itemId, quantity: newItem.quantity || 1 }];
    }
    saveCart(updatedCart);
  };

  const removeFromCart = (id: string) => {
    const updated = cart.filter((item) => item.id !== id);
    saveCart(updated);
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    const updated = cart.map((item) =>
      item.id === id ? { ...item, quantity } : item
    );
    saveCart(updated);
  };

  const updateVariant = (
    oldId: string,
    newVariantId: string,
    newVariantName: string,
    newPrice: number,
    newUnit: string
  ) => {
    const existingItem = cart.find((i) => i.id === oldId);
    if (!existingItem) return;

    const newId = `${existingItem.productId}-${newVariantId}`;
    const targetSameVariant = cart.find((i) => i.id === newId && i.id !== oldId);

    let updated: CartItem[];
    if (targetSameVariant) {
      // Merge with existing variant entry
      updated = cart
        .filter((i) => i.id !== oldId)
        .map((i) =>
          i.id === newId
            ? { ...i, quantity: i.quantity + existingItem.quantity }
            : i
        );
    } else {
      updated = cart.map((i) =>
        i.id === oldId
          ? {
              ...i,
              id: newId,
              variantId: newVariantId,
              variantName: newVariantName,
              price: newPrice,
              unit: newUnit,
            }
          : i
      );
    }
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
    setAppliedCoupon(null);
  };

  const totalCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  // Delivery is free if order >= ₹199, otherwise ₹25
  const deliveryFee = useMemo(() => {
    if (subtotal === 0) return 0;
    return subtotal >= 199 ? 0 : 25;
  }, [subtotal]);

  // Coupons
  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;
    const code = appliedCoupon.toUpperCase();
    if (code === "PALLETOORI50") {
      return subtotal >= 200 ? 50 : 0;
    }
    if (code === "FARM20") {
      return Math.round(subtotal * 0.2);
    }
    return 0;
  }, [appliedCoupon, subtotal]);

  const applyCoupon = (code: string) => {
    const normalized = code.trim().toUpperCase();
    if (normalized === "PALLETOORI50") {
      if (subtotal < 200) {
        return { success: false, message: "Code requires minimum order of ₹200." };
      }
      setAppliedCoupon("PALLETOORI50");
      return { success: true, message: "₹50 discount applied successfully!" };
    }
    if (normalized === "FARM20") {
      setAppliedCoupon("FARM20");
      return { success: true, message: "20% farm fresh discount applied!" };
    }
    return { success: false, message: "Invalid coupon code. Try PALLETOORI50" };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const totalAmount = useMemo(() => {
    const total = subtotal + deliveryFee - discount;
    return total > 0 ? total : 0;
  }, [subtotal, deliveryFee, discount]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateVariant,
        clearCart,
        totalCount,
        subtotal,
        deliveryFee,
        discount,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        totalAmount,
        isLoaded,
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
