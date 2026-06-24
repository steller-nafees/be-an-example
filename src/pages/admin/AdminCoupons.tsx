import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, CheckSquare2, Loader2, Plus, Search, Trash2, X } from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { useCoupons, useDeleteCoupon, useUpsertCoupon, type Coupon } from "@/hooks/use-coupons";
import { formatCouponValue, normalizeCouponCode, type CouponDiscountType } from "@/lib/coupons";
import { formatCurrency } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";

type Draft = {
  id: string | null;
  code: string;
  title: string;
  description: string;
  discount_type: CouponDiscountType;
  discount_value: number;
  applies_to_all_products: boolean;
  active: boolean;
  minimum_subtotal: number;
  usage_limit: string;
  product_ids: string[];
};

const emptyDraft = (): Draft => ({
  id: null,
  code: "",
  title: "",
  description: "",
  discount_type: "percentage",
  discount_value: 10,
  applies_to_all_products: true,
  active: true,
  minimum_subtotal: 0,
  usage_limit: "",
  product_ids: [],
});

export default function AdminCoupons() {
  const { data: coupons = [], isLoading: couponsLoading, error: couponsError } = useCoupons();
  const { data: products = [] } = useProducts();
  const upsertCoupon = useUpsertCoupon();
  const deleteCoupon = useDeleteCoupon();

  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [search, setSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");

  useEffect(() => {
    if (draft.applies_to_all_products) return;
    if (!draft.id && draft.product_ids.length === 0 && products.length > 0) {
      setDraft((current) => ({ ...current, product_ids: [products[0].id] }));
    }
  }, [draft.applies_to_all_products, draft.id, draft.product_ids.length, products]);

  const filteredProducts = useMemo(
    () => products.filter((product) => product.name.toLowerCase().includes(productSearch.toLowerCase())),
    [products, productSearch],
  );

  const filteredCoupons = useMemo(() => {
    const q = search.toLowerCase();
    return coupons.filter((coupon) => {
      if (!q) return true;
      return (
        coupon.code.toLowerCase().includes(q) ||
        coupon.title.toLowerCase().includes(q) ||
        coupon.description?.toLowerCase().includes(q) ||
        coupon.discount_type.toLowerCase().includes(q)
      );
    });
  }, [coupons, search]);

  const activeCount = coupons.filter((coupon) => coupon.active).length;

  const startEdit = (coupon: Coupon) => {
    setDraft({
      id: coupon.id,
      code: coupon.code,
      title: coupon.title,
      description: coupon.description ?? "",
      discount_type: coupon.discount_type,
      discount_value: Number(coupon.discount_value) || 0,
      applies_to_all_products: coupon.applies_to_all_products,
      active: coupon.active,
      minimum_subtotal: Number(coupon.minimum_subtotal) || 0,
      usage_limit: coupon.usage_limit ? String(coupon.usage_limit) : "",
      product_ids: coupon.coupon_products?.map((link) => link.product_id) ?? [],
    });
  };

  const resetDraft = () => setDraft(emptyDraft());

  const toggleProduct = (productId: string) => {
    setDraft((current) => {
      const exists = current.product_ids.includes(productId);
      return {
        ...current,
        product_ids: exists
          ? current.product_ids.filter((id) => id !== productId)
          : [...current.product_ids, productId],
      };
    });
  };

  const save = async () => {
    const code = normalizeCouponCode(draft.code);
    if (!code) {
      toast({ title: "Coupon code is required", variant: "destructive" });
      return;
    }
    if (!draft.title.trim()) {
      toast({ title: "Coupon title is required", variant: "destructive" });
      return;
    }
    if (draft.discount_value <= 0) {
      toast({ title: "Discount must be greater than zero", variant: "destructive" });
      return;
    }
    if (draft.discount_type === "percentage" && draft.discount_value > 100) {
      toast({ title: "Percentage coupons cannot exceed 100%", variant: "destructive" });
      return;
    }
    const usageLimit = draft.usage_limit.trim() ? Number(draft.usage_limit) : null;
    if (usageLimit !== null && (!Number.isFinite(usageLimit) || usageLimit <= 0)) {
      toast({ title: "Usage limit must be a positive number", variant: "destructive" });
      return;
    }
    if (!draft.applies_to_all_products && draft.product_ids.length === 0) {
      toast({ title: "Select at least one product", variant: "destructive" });
      return;
    }

    try {
      await upsertCoupon.mutateAsync({
        id: draft.id,
        code,
        title: draft.title.trim(),
        description: draft.description.trim(),
        discount_type: draft.discount_type,
        discount_value: Number(draft.discount_value),
        applies_to_all_products: draft.applies_to_all_products,
        active: draft.active,
        minimum_subtotal: Number(draft.minimum_subtotal) || 0,
        usage_limit: usageLimit,
        product_ids: draft.applies_to_all_products ? [] : draft.product_ids,
      });
      toast({
        title: draft.id ? "Coupon updated" : "Coupon created",
        description: `${code} is ready for checkout.`,
      });
      resetDraft();
    } catch (error: any) {
      toast({
        title: "Save failed",
        description: error?.message || "Unable to save coupon.",
        variant: "destructive",
      });
    }
  };

  const remove = async (coupon: Coupon) => {
    if (!confirm(`Delete coupon "${coupon.code}"?`)) return;
    try {
      await deleteCoupon.mutateAsync(coupon.id);
      if (draft.id === coupon.id) resetDraft();
      toast({ title: "Coupon deleted", description: coupon.code });
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error?.message || "Unable to delete coupon.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Coupons</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {couponsLoading ? "Loading…" : `${coupons.length} coupons · ${activeCount} active`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetDraft}
            className="inline-flex items-center gap-2 px-4 py-2 border border-border text-sm font-semibold rounded-md hover:border-foreground/40"
          >
            <Plus size={16} />
            New Coupon
          </button>
        </div>
      </div>

      {couponsError && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Coupons could not load. Run the coupon migration and confirm the admin policies are applied.
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search coupons…"
                className="w-full h-9 bg-background border border-border rounded-md pl-8 pr-3 text-sm focus:outline-none focus:border-foreground/30"
              />
            </div>
          </div>

          {filteredCoupons.length === 0 ? (
            <div className="rounded-lg border border-border bg-background px-6 py-14 text-center text-sm text-muted-foreground">
              No coupons yet.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCoupons.map((coupon) => {
                const linkedProducts = coupon.coupon_products?.length ?? 0;
                return (
                  <motion.div
                    key={coupon.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-border bg-background p-4"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-foreground tracking-wide">{coupon.code}</h3>
                          <span className={`text-[10px] uppercase tracking-[0.18em] px-2 py-1 rounded-full border ${coupon.active ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700" : "border-border text-muted-foreground"}`}>
                            {coupon.active ? "Active" : "Inactive"}
                          </span>
                          <span className="text-[10px] uppercase tracking-[0.18em] px-2 py-1 rounded-full border border-border text-muted-foreground">
                            {coupon.applies_to_all_products ? "All products" : `${linkedProducts} products`}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-foreground">{coupon.title}</p>
                        {coupon.description && (
                          <p className="text-xs text-muted-foreground max-w-2xl">{coupon.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span>{formatCouponValue(coupon.discount_type, Number(coupon.discount_value))}</span>
                          <span>Minimum subtotal {formatCurrency(Number(coupon.minimum_subtotal))}</span>
                          <span>Used {coupon.times_used}{coupon.usage_limit ? ` / ${coupon.usage_limit}` : ""} times</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(coupon)}
                          className="px-3 py-2 text-xs font-semibold border border-border rounded-md hover:border-foreground/30"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => remove(coupon)}
                          className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                          title="Delete coupon"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border bg-background p-5 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-foreground">
                {draft.id ? "Edit coupon" : "Create coupon"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Build percent or fixed discounts and target one or more products.
              </p>
            </div>
            <button
              onClick={resetDraft}
              className="p-1.5 text-muted-foreground hover:text-foreground"
              title="Clear form"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Coupon code">
              <input
                value={draft.code}
                onChange={(e) => setDraft((current) => ({ ...current, code: e.target.value }))}
                placeholder="SUMMER20"
                className={inputCls}
              />
            </Field>
            <Field label="Title">
              <input
                value={draft.title}
                onChange={(e) => setDraft((current) => ({ ...current, title: e.target.value }))}
                placeholder="Summer launch"
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              rows={3}
              value={draft.description}
              onChange={(e) => setDraft((current) => ({ ...current, description: e.target.value }))}
              placeholder="Optional note for admins"
              className={`${inputCls} resize-none`}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Discount type">
              <select
                value={draft.discount_type}
                onChange={(e) =>
                  setDraft((current) => ({
                    ...current,
                    discount_type: e.target.value as CouponDiscountType,
                  }))
                }
                className={inputCls}
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed amount</option>
              </select>
            </Field>
            <Field label="Discount value">
              <input
                type="number"
                min={0}
                step="0.01"
                value={draft.discount_value}
                onChange={(e) =>
                  setDraft((current) => ({
                    ...current,
                    discount_value: Number(e.target.value) || 0,
                  }))
                }
                className={inputCls}
              />
            </Field>
            <Field label="Minimum subtotal">
              <input
                type="number"
                min={0}
                step="0.01"
                value={draft.minimum_subtotal}
                onChange={(e) =>
                  setDraft((current) => ({
                    ...current,
                    minimum_subtotal: Number(e.target.value) || 0,
                  }))
                }
                className={inputCls}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ToggleButton
              label="Active"
              checked={draft.active}
              onClick={() => setDraft((current) => ({ ...current, active: !current.active }))}
            />
            <ToggleButton
              label="All products"
              checked={draft.applies_to_all_products}
              onClick={() =>
                setDraft((current) => ({
                  ...current,
                  applies_to_all_products: !current.applies_to_all_products,
                  product_ids: !current.applies_to_all_products ? current.product_ids : [],
                }))
              }
            />
          </div>

          <Field label="Usage limit">
            <input
              type="number"
              min={0}
              step="1"
              value={draft.usage_limit}
              onChange={(e) => setDraft((current) => ({ ...current, usage_limit: e.target.value }))}
              placeholder="Leave empty for unlimited"
              className={inputCls}
            />
          </Field>

          {!draft.applies_to_all_products && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Eligible products</h3>
                  <p className="text-xs text-muted-foreground">Pick the products this coupon should affect.</p>
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {draft.product_ids.length} selected
                </span>
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products…"
                  className="w-full h-9 bg-background border border-border rounded-md pl-8 pr-3 text-sm focus:outline-none focus:border-foreground/30"
                />
              </div>
              <div className="max-h-[320px] overflow-y-auto rounded-lg border border-border">
                <div className="grid gap-2 p-3">
                  {filteredProducts.length === 0 ? (
                    <p className="py-10 text-center text-sm text-muted-foreground">No matching products.</p>
                  ) : (
                    filteredProducts.map((product) => {
                      const selected = draft.product_ids.includes(product.id);
                      return (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => toggleProduct(product.id)}
                          className={`flex items-center gap-3 rounded-md border px-3 py-2 text-left transition-colors ${
                            selected ? "border-foreground bg-foreground/[0.04]" : "border-border hover:border-foreground/30"
                          }`}
                        >
                          <div className="w-10 h-10 overflow-hidden rounded bg-muted flex-shrink-0">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            ) : null}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                            <p className="text-[11px] text-muted-foreground">{formatCurrency(Number(product.price))}</p>
                          </div>
                          {selected ? <Check size={16} className="text-foreground" /> : <CheckSquare2 size={16} className="text-muted-foreground" />}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={save}
              disabled={upsertCoupon.isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background text-sm font-semibold rounded-md hover:bg-foreground/90 transition-colors disabled:opacity-50"
            >
              {upsertCoupon.isPending ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              Save Coupon
            </button>
            <button
              onClick={resetDraft}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-sm font-semibold rounded-md text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function ToggleButton({
  label,
  checked,
  onClick,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-between gap-3 rounded-md border px-3 py-2 transition-colors ${
        checked ? "border-foreground bg-foreground/[0.04]" : "border-border hover:border-foreground/30"
      }`}
    >
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground">{checked ? "Enabled" : "Disabled"}</p>
      </div>
      <span className={`h-5 w-10 rounded-full border p-0.5 transition-colors ${checked ? "border-foreground bg-foreground" : "border-border bg-muted"}`}>
        <span className={`block h-4 w-4 rounded-full bg-background transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
      </span>
    </button>
  );
}

const inputCls =
  "w-full h-10 bg-background border border-border rounded-md px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30";
