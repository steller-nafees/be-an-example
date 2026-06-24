import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface CartItem {
  id: string;
  variantId?: string;
  printfulSyncVariantId?: number | null;
  name: string;
  price: number;
  size: string;
  color?: string;
  image: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string, size: string, color?: string) => void;
  updateQuantity: (id: string, size: string, quantity: number, color?: string) => void;
  clearCart: () => void;
  couponCode: string;
  setCouponCode: (code: string) => void;
  clearCoupon: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("bae-cart") || "[]");
    } catch {
      return [];
    }
  });
  const [couponCode, setCouponCodeState] = useState(() => localStorage.getItem("bae-coupon-code") || "");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("bae-cart", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (couponCode) localStorage.setItem("bae-coupon-code", couponCode);
    else localStorage.removeItem("bae-coupon-code");
  }, [couponCode]);

  const normalizeColor = (color?: string) => color ?? "";
  const isSameItem = (i: CartItem, id: string, size: string, color?: string) =>
    i.id === id && i.size === size && normalizeColor(i.color) === normalizeColor(color);

  const addItem = (item: Omit<CartItem, "quantity">) => {
    const normalizedItem = { ...item, color: normalizeColor(item.color) };

    setItems((prev) => {
      const existing = prev.find((i) => isSameItem(i, normalizedItem.id, normalizedItem.size, normalizedItem.color));
      if (existing) {
        return prev.map((i) =>
          isSameItem(i, normalizedItem.id, normalizedItem.size, normalizedItem.color)
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...normalizedItem, quantity: 1 }];
    });
    setIsOpen(true);
  };

  const removeItem = (id: string, size: string, color?: string) => {
    setItems((prev) => prev.filter((i) => !isSameItem(i, id, size, color)));
  };

  const updateQuantity = (id: string, size: string, quantity: number, color?: string) => {
    if (quantity <= 0) {
      removeItem(id, size, color);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        isSameItem(i, id, size, color) ? { ...i, quantity } : i
      )
    );
  };

  const clearCoupon = () => setCouponCodeState("");
  const setCouponCode = (code: string) => setCouponCodeState(code);
  const clearCart = () => {
    setItems([]);
    clearCoupon();
  };

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        couponCode,
        setCouponCode,
        clearCoupon,
        isOpen,
        setIsOpen,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
