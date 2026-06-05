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
    revenueGrowth: Math.round(growth(rev30, revPrev) * 10) / 10,
    orderGrowth: Math.round(growth(last30.length, prev30.length) * 10) / 10,
    customerGrowth: 0,
  };
}

export function revenueByDay(orders: AdminOrderLite[], days = 14) {
  const buckets: Record<string, number> = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const k = d.toISOString().slice(5, 10);
    buckets[k] = 0;
  }
  orders.forEach((o) => {
    const k = o.created_at.slice(5, 10);
    if (k in buckets) buckets[k] += Number(o.total);
  });
  return Object.entries(buckets).map(([date, revenue]) => ({ date, revenue }));
}
