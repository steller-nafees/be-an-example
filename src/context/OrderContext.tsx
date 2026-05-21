import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { CartItem } from "./CartContext";

export interface Order {
  id: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  items: CartItem[];
  shippingMethod: "standard" | "express" | "overnight";
  deliveryFee: number;
  subtotal: number;
  tax: number;
  total: number;
  date: string; // ISO timestamp
  status: "pending" | "processing" | "shipped" | "delivered";
}

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, "id" | "date" | "status">) => Order;
  getOrderById: (id: string) => Order | undefined;
  deleteOrder: (id: string) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("bae-orders") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("bae-orders", JSON.stringify(orders));
  }, [orders]);

  const addOrder = (orderData: Omit<Order, "id" | "date" | "status">): Order => {
    const newOrder: Order = {
      ...orderData,
      id: `ORD-${Date.now()}`,
      date: new Date().toISOString(),
      status: "pending",
    };
    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const getOrderById = (id: string): Order | undefined => {
    return orders.find((order) => order.id === id);
  };

  const deleteOrder = (id: string) => {
    setOrders((prev) => prev.filter((order) => order.id !== id));
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, getOrderById, deleteOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (!context) throw new Error("useOrder must be used within OrderProvider");
  return context;
}
