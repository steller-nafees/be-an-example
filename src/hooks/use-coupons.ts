import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { CouponDiscountType } from "@/lib/coupons";

export interface CouponProductLink {
  product_id: string;
}

export interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string | null;
  discount_type: CouponDiscountType;
  discount_value: number;
  applies_to_all_products: boolean;
  active: boolean;
  minimum_subtotal: number;
  usage_limit: number | null;
  times_used: number;
  created_at?: string;
  updated_at?: string;
  coupon_products?: CouponProductLink[];
}

export interface CouponInput {
  id?: string | null;
  code: string;
  title: string;
  description: string;
  discount_type: CouponDiscountType;
  discount_value: number;
  applies_to_all_products: boolean;
  active: boolean;
  minimum_subtotal: number;
  usage_limit: number | null;
  product_ids: string[];
}

export const useCoupons = () =>
  useQuery({
    queryKey: ["coupons"],
    queryFn: async (): Promise<Coupon[]> => {
      const { data, error } = await supabase
        .from("coupons")
        .select("*, coupon_products(product_id)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as Coupon[]) ?? [];
    },
  });

export const useUpsertCoupon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (coupon: CouponInput) => {
      const { data, error } = await supabase.rpc("upsert_coupon", {
        p_id: coupon.id ?? null,
        p_code: coupon.code,
        p_title: coupon.title,
        p_description: coupon.description,
        p_discount_type: coupon.discount_type,
        p_discount_value: coupon.discount_value,
        p_applies_to_all_products: coupon.applies_to_all_products,
        p_active: coupon.active,
        p_minimum_subtotal: coupon.minimum_subtotal,
        p_usage_limit: coupon.usage_limit,
        p_product_ids: coupon.product_ids,
      });

      if (error) throw error;
      return data as Coupon;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coupons"] }),
  });
};

export const useDeleteCoupon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("coupons").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coupons"] }),
  });
};

