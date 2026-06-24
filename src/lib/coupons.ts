import { supabase } from "@/lib/supabase";

export type CouponDiscountType = "percentage" | "fixed";

export interface CouponPreviewItem {
  product_id: string;
  price: number;
  quantity: number;
}

export interface CouponPreview {
  valid: boolean;
  couponId: string | null;
  code: string | null;
  title: string | null;
  discountType: CouponDiscountType | null;
  discountValue: number;
  eligibleSubtotal: number;
  discountAmount: number;
  message: string;
  appliesToAllProducts: boolean;
  minimumSubtotal: number;
  productIds: string[];
}

const num = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const normalizeCouponCode = (code: string) => code.trim().toUpperCase();

export async function previewCouponDiscount(
  couponCode: string,
  items: CouponPreviewItem[],
  subtotal: number,
): Promise<CouponPreview | null> {
  const { data, error } = await supabase.rpc("preview_coupon_discount", {
    p_coupon_code: couponCode,
    p_items: items,
    p_subtotal: subtotal,
  });

  if (error) throw error;

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;

  return {
    valid: Boolean(row.valid),
    couponId: row.coupon_id ?? null,
    code: row.code ?? null,
    title: row.title ?? null,
    discountType: row.discount_type ?? null,
    discountValue: num(row.discount_value),
    eligibleSubtotal: num(row.eligible_subtotal),
    discountAmount: num(row.discount_amount),
    message: row.message ?? "",
    appliesToAllProducts: Boolean(row.applies_to_all_products),
    minimumSubtotal: num(row.minimum_subtotal),
    productIds: Array.isArray(row.product_ids) ? row.product_ids.filter(Boolean) : [],
  };
}

export function formatCouponValue(type: CouponDiscountType, value: number) {
  if (type === "percentage") return `${value.toFixed(0)}% off`;
  return `$${value.toFixed(2)} off`;
}

