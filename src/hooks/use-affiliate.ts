import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export interface AffiliateRow {
  id: string;
  user_id: string;
  name: string;
  email: string;
  code: string;
  status: "pending" | "approved" | "rejected";
  instagram: string | null;
  tiktok: string | null;
  audience_size: string | null;
  commission_rate: number;
  paypal_email: string | null;
  withdrawal_frequency?: "monthly" | "weekly";
  payment_method?: "paypal" | "bank";
  created_at: string;
}

export interface CommissionRow {
  id: string;
  affiliate_id: string;
  order_id: string | null;
  amount: number;
  rate: number;
  status: "pending" | "approved" | "paid" | "rejected";
  created_at: string;
  orders?: { id: string; email: string; total: number; first_name: string | null; last_name: string | null } | null;
}

export interface PayoutRow {
  id: string;
  affiliate_id: string;
  amount: number;
  method: string;
  status: "pending" | "processed" | "rejected";
  requested_at: string;
  processed_at: string | null;
}

export const useMyAffiliate = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-affiliate", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<AffiliateRow | null> => {
      const { data } = await supabase.from("affiliates").select("*").eq("user_id", user!.id).maybeSingle();
      return (data as AffiliateRow) ?? null;
    },
  });
};

export const useMyCommissions = (affiliateId?: string) => {
  return useQuery({
    queryKey: ["my-commissions", affiliateId],
    enabled: !!affiliateId,
    queryFn: async (): Promise<CommissionRow[]> => {
      const { data } = await supabase
        .from("commissions")
        .select("*, orders(id, email, total, first_name, last_name)")
        .eq("affiliate_id", affiliateId!)
        .order("created_at", { ascending: false });
      return (data as CommissionRow[]) ?? [];
    },
  });
};

export const useMyPayouts = (affiliateId?: string) => {
  return useQuery({
    queryKey: ["my-payouts", affiliateId],
    enabled: !!affiliateId,
    queryFn: async (): Promise<PayoutRow[]> => {
      const { data } = await supabase
        .from("payouts")
        .select("*")
        .eq("affiliate_id", affiliateId!)
        .order("requested_at", { ascending: false });
      return (data as PayoutRow[]) ?? [];
    },
  });
};

export const useMyClicks = (affiliateId?: string) => {
  return useQuery({
    queryKey: ["my-clicks", affiliateId],
    enabled: !!affiliateId,
    queryFn: async (): Promise<{ id: string; created_at: string }[]> => {
      const { data } = await supabase
        .from("referral_clicks")
        .select("id, created_at")
        .eq("affiliate_id", affiliateId!)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });
};

export function computeEarnings(commissions: CommissionRow[]) {
  const pending = commissions.filter((c) => c.status === "pending").reduce((s, c) => s + Number(c.amount), 0);
  const approved = commissions.filter((c) => c.status === "approved").reduce((s, c) => s + Number(c.amount), 0);
  const paid = commissions.filter((c) => c.status === "paid").reduce((s, c) => s + Number(c.amount), 0);
  return { pending, approved, paid, total: approved + paid };
}
