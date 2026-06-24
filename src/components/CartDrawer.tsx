import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Tag, ChevronDown, ChevronUp } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Link } from "react-router-dom";
import { previewCouponDiscount, type CouponPreview } from "@/lib/coupons";

function QuantitySelector({ quantity, onUpdate }: { quantity: number; onUpdate: (q: number) => void }) {
  return (
    <div className="flex items-center border border-border">
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={() => onUpdate(quantity - 1)}
        className="w-8 h-8 flex items-center justify-center text-foreground hover:bg-muted transition-colors"
      >
        <Minus size={12} />
      </motion.button>
      <AnimatePresence mode="wait">
        <motion.span
          key={quantity}
          initial={{ scale: 1.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.6, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="w-8 h-8 flex items-center justify-center text-xs font-semibold text-foreground"
        >
          {quantity}
        </motion.span>
      </AnimatePresence>
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={() => onUpdate(quantity + 1)}
        className="w-8 h-8 flex items-center justify-center text-foreground hover:bg-muted transition-colors"
      >
        <Plus size={12} />
      </motion.button>
    </div>
  );
}

export default function CartDrawer() {
  const {
    items,
    isOpen,
    setIsOpen,
    updateQuantity,
    removeItem,
    totalPrice,
    couponCode,
    setCouponCode,
    clearCoupon,
  } = useCart();
  const [coupon, setCoupon] = useState("");
  const [couponError, setCouponError] = useState("");
  const [showCoupon, setShowCoupon] = useState(false);
  const [couponPreview, setCouponPreview] = useState<CouponPreview | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    setCoupon(couponCode);
  }, [couponCode]);

  useEffect(() => {
    let active = true;
    if (!couponCode || items.length === 0) {
      setCouponPreview(null);
      setCouponLoading(false);
      return () => {
        active = false;
      };
    }

    setCouponLoading(true);
    previewCouponDiscount(
      couponCode,
      items.map((item) => ({
        product_id: item.id,
        price: item.price,
        quantity: item.quantity,
      })),
      totalPrice,
    )
      .then((preview) => {
        if (!active) return;
        setCouponPreview(preview);
        if (preview && !preview.valid) {
          setCouponError(preview.message || "Coupon code is not valid.");
        } else {
          setCouponError("");
        }
      })
      .catch(() => {
        if (!active) return;
        setCouponPreview(null);
      })
      .finally(() => {
        if (active) setCouponLoading(false);
      });

    return () => {
      active = false;
    };
  }, [couponCode, items, totalPrice]);

  const handleApplyCoupon = () => {
    const code = coupon.trim().toUpperCase();

    if (!code) {
      setCouponError("Please enter a coupon code.");
      return;
    }

    previewCouponDiscount(
      code,
      items.map((item) => ({
        product_id: item.id,
        price: item.price,
        quantity: item.quantity,
      })),
      totalPrice,
    )
      .then((preview) => {
        if (!preview?.valid) {
          clearCoupon();
          setCouponPreview(preview);
          setCouponError(preview?.message || "Coupon code is not valid.");
          return;
        }

        setCouponPreview(preview);
        setCouponError("");
        setCouponCode(code);
        setCoupon(code);
      })
      .catch((error: any) => {
        clearCoupon();
        setCouponPreview(null);
        setCouponError(error?.message || "Coupon code is not valid.");
      });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[70] bg-foreground/40 backdrop-blur-[2px]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 bottom-0 z-[80] w-full max-w-[420px] bg-background border-l border-border flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold tracking-widest uppercase text-foreground">Your Cart</h2>
                {items.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5 flex items-center justify-center bg-foreground text-primary-foreground text-[10px] font-bold rounded-full"
                  >
                    {items.reduce((s, i) => s + i.quantity, 0)}
                  </motion.span>
                )}
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center text-foreground hover:bg-muted transition-colors"
              >
                <X size={18} strokeWidth={1.5} />
              </motion.button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col items-center justify-center h-full text-center px-6"
                >
                  <div className="w-20 h-20 flex items-center justify-center border border-border mb-6">
                    <ShoppingBag size={32} className="text-muted-foreground" strokeWidth={1} />
                  </div>
                  <p className="text-foreground font-semibold text-sm mb-1">Your cart is empty</p>
                  <p className="text-muted-foreground text-xs mb-8">Looks like you haven't added anything yet.</p>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setIsOpen(false)}
                    className="px-10 py-3.5 bg-foreground text-primary-foreground text-xs font-semibold tracking-widest uppercase hover:bg-foreground/90 transition-colors"
                  >
                    Start Shopping
                  </motion.button>
                </motion.div>
              ) : (
                <div className="px-6 py-4">
                  <AnimatePresence initial={false}>
                    {items.map((item, index) => (
                      <motion.div
                        key={`${item.id}-${item.size}-${item.color ?? ""}`}
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 60, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
                        transition={{
                          layout: { duration: 0.3 },
                          delay: index * 0.05,
                        }}
                        className="flex gap-4 py-5 border-b border-border last:border-0"
                      >
                        {/* Image with hover zoom */}
                        <div className="w-[88px] h-[110px] bg-muted overflow-hidden flex-shrink-0 group cursor-pointer">
                          <motion.img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            whileHover={{ scale: 1.08 }}
                            transition={{ duration: 0.4 }}
                            loading="lazy"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div>
                            <h3 className="text-sm font-semibold text-foreground leading-tight truncate">{item.name}</h3>
                            <p className="text-[11px] text-muted-foreground mt-1">
                              Size: {item.size}{item.color ? ` · ${item.color}` : ""}
                            </p>
                          </div>
                          <div className="flex items-end justify-between mt-2">
                            <QuantitySelector
                              quantity={item.quantity}
                              onUpdate={(q) => updateQuantity(item.id, item.size, q, item.color)}
                            />
                            <motion.span
                              key={item.price * item.quantity}
                              initial={{ opacity: 0.5 }}
                              animate={{ opacity: 1 }}
                              className="text-sm font-bold text-foreground"
                            >
                              ${(item.price * item.quantity).toFixed(2)}
                            </motion.span>
                          </div>
                        </div>

                        {/* Remove */}
                        <motion.button
                          whileTap={{ scale: 0.8 }}
                          onClick={() => removeItem(item.id, item.size, item.color)}
                          className="self-start mt-0.5 w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <X size={13} />
                        </motion.button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.06)]">
                {/* Coupon */}
                <div className="px-6 pt-4">
                  <button
                    onClick={() => setShowCoupon(!showCoupon)}
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
                  >
                    <Tag size={12} />
                    <span>Have a coupon?</span>
                    {showCoupon ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                  <AnimatePresence>
                    {showCoupon && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="flex gap-2 mb-4">
                          <input
                            type="text"
                            value={coupon}
                            onChange={(e) => {
                              setCoupon(e.target.value);
                              setCouponError("");
                            }}
                            placeholder="Enter code"
                            className="flex-1 h-10 px-3 border border-border bg-background text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
                          />
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleApplyCoupon}
                            className="h-10 px-4 bg-foreground text-primary-foreground text-xs font-semibold tracking-wider uppercase hover:bg-foreground/90 transition-colors"
                          >
                            Apply
                          </motion.button>
                        </div>
                        {couponLoading ? (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-xs text-muted-foreground font-medium mb-3"
                          >
                            Checking coupon...
                          </motion.p>
                        ) : couponError ? (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-xs text-destructive font-medium mb-3"
                          >
                            {couponError}
                          </motion.p>
                        ) : couponPreview?.valid ? (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-xs text-foreground font-medium mb-3"
                          >
                            Coupon applied{couponPreview.discountAmount > 0 ? ` • saved $${couponPreview.discountAmount.toFixed(2)}` : ""}
                          </motion.p>
                        ) : null}
                        {couponPreview?.valid && (
                          <button
                            type="button"
                            onClick={() => {
                              clearCoupon();
                              setCoupon("");
                              setCouponPreview(null);
                              setCouponError("");
                            }}
                            className="text-[11px] text-muted-foreground hover:text-foreground transition-colors mb-3"
                          >
                            Remove coupon
                          </button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Totals */}
                <div className="px-6 pb-2 space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Subtotal</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  {couponPreview?.valid && couponPreview.discountAmount > 0 && (
                    <div className="flex justify-between text-xs text-foreground">
                      <span>Coupon {couponPreview.code ?? couponCode}</span>
                      <span>- ${couponPreview.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Merchandise total</span>
                    <span>
                      ${(Math.max(totalPrice - (couponPreview?.valid ? couponPreview.discountAmount : 0), 0)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-foreground pt-2 border-t border-border mt-2">
                    <span>Total</span>
                    <motion.span
                      key={Math.max(totalPrice - (couponPreview?.valid ? couponPreview.discountAmount : 0), 0)}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                    >
                      ${(Math.max(totalPrice - (couponPreview?.valid ? couponPreview.discountAmount : 0), 0)).toFixed(2)}
                    </motion.span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <div className="px-6 pb-6 pt-3">
                  <Link
                    to="/checkout"
                    onClick={() => setIsOpen(false)}
                  >
                    <motion.div
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-4 bg-foreground text-primary-foreground text-xs font-bold tracking-[0.2em] uppercase hover:bg-foreground/90 transition-colors text-center"
                    >
                      Checkout
                    </motion.div>
                  </Link>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center text-[11px] text-muted-foreground hover:text-foreground transition-colors mt-3 tracking-wide"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
