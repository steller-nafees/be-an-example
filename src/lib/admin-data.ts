import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface AdminOrderLite {
  id: string;
  user_id: string | null;
  email: string;
  first_name: string | null;
  last_name: string | null;
  total: number;
  status: string;
  created_at: string;
}

export const useAdminOrders = () => {
  return useQuery({
    queryKey: ["admin-orders-lite"],
    queryFn: async (): Promise<AdminOrderLite[]> => {
      const { data } = await supabase
        .from("orders")
        .select("id,user_id,email,first_name,last_name,total,status,created_at")
        .order("created_at", { ascending: false });
      return (data as AdminOrderLite[]) ?? [];
    },
  });
};

export interface AdminProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
}

export const useAdminProfiles = () => {
  return useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async (): Promise<AdminProfile[]> => {
      const { data } = await supabase
        .from("profiles")
        .select("id,email,full_name,created_at")
        .order("created_at", { ascending: false });
      return (data as AdminProfile[]) ?? [];
    },
  });
};

export interface AdminAffiliate {
  id: string;
  user_id: string;
  name: string;
  email: string;
  code: string;
  status: "pending" | "approved" | "rejected";
  audience_size: string | null;
  commission_rate: number;
  paypal_email?: string | null;
  withdrawal_frequency?: "monthly" | "weekly";
  payment_method?: "paypal" | "bank";
  created_at: string;
}

export const useAdminAffiliates = () => {
  return useQuery({
    queryKey: ["admin-affiliates"],
    queryFn: async (): Promise<AdminAffiliate[]> => {
      const { data } = await supabase
        .from("affiliates")
        .select("*")
        .order("created_at", { ascending: false });
      return (data as AdminAffiliate[]) ?? [];
    },
  });
};

export function computeMetrics(orders: AdminOrderLite[]) {
  const totalRevenue = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + Number(o.total), 0);
  const totalOrders = orders.length;
  const customers = new Set(orders.map((o) => o.email)).size;
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 86400000;
  const sixtyDaysAgo = now - 60 * 86400000;
  const last30 = orders.filter((o) => new Date(o.created_at).getTime() >= thirtyDaysAgo);
  const prev30 = orders.filter((o) => {
    const t = new Date(o.created_at).getTime();
    return t < thirtyDaysAgo && t >= sixtyDaysAgo;
  });
  const rev30 = last30.reduce((s, o) => s + Number(o.total), 0);
  const revPrev = prev30.reduce((s, o) => s + Number(o.total), 0);
  const growth = (a: number, b: number) => (b === 0 ? (a > 0 ? 100 : 0) : ((a - b) / b) * 100);
  return {
    totalRevenue,
    totalOrders,
    totalCustomers: customers,
    revenueGrowth: Math.round(growth(rev30, revPrev) * 100) / 100,
    orderGrowth: Math.round(growth(last30.length, prev30.length) * 100) / 100,
    customerGrowth: 0,
  };
}

export function revenueByDay(orders: AdminOrderLite[], days = 30) {
  const buckets: Record<string, number> = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    buckets[d.toISOString().slice(0, 10)] = 0;
  }
  orders.forEach((o) => {
    const k = o.created_at.slice(0, 10);
    if (k in buckets) buckets[k] += Number(o.total);
  });
  return Object.entries(buckets).map(([date, revenue]) => ({ date, revenue }));
}

export interface OrderItemWithCost {
  id: string;
  order_id: string;
  price: number;
  cost_snapshot: number | null;
  quantity: number;
}

export const useOrderItemsWithCosts = () => {
  return useQuery({
    queryKey: ["order-items-with-costs"],
    queryFn: async (): Promise<OrderItemWithCost[]> => {
      const { data } = await supabase
        .from("order_items")
        .select("id,order_id,price,cost_snapshot,quantity")
        .order("id", { ascending: false });
      return (data as OrderItemWithCost[]) ?? [];
    },
  });
};

export function computeProfitabilityMetrics(items: OrderItemWithCost[]) {
  let totalCost = 0;
  let totalRevenue = 0;
  let itemsWithCost = 0;
  let itemsWithoutCost = 0;

  items.forEach((item) => {
    const lineRevenue = item.price * item.quantity;
    totalRevenue += lineRevenue;

    if (item.cost_snapshot !== null) {
      const lineCost = item.cost_snapshot * item.quantity;
      totalCost += lineCost;
      itemsWithCost++;
    } else {
      itemsWithoutCost++;
    }
  });

  const grossProfit = totalRevenue - totalCost;
  const marginPercentage = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
  const avgMarginPerItem = itemsWithCost > 0 ? marginPercentage : 0;

  return {
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    grossProfit: Math.round(grossProfit * 100) / 100,
    marginPercentage: Math.round(marginPercentage * 100) / 100,
    avgMarginPerItem: Math.round(avgMarginPerItem * 100) / 100,
    itemsWithCost,
    itemsWithoutCost,
    coveragePercentage: items.length > 0 ? Math.round((itemsWithCost / items.length) * 100) : 0,
  };
}
