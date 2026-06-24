import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Check, CreditCard, Truck, MapPin, ClipboardList, Loader2, ShieldCheck, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import Invoice from "@/components/Invoice";
import InvoiceDownloadButton from "@/components/InvoiceDownload";
import type { Order } from "@/context/OrderContext";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useBrandSettings } from "@/context/LogoContext";
import { getReferralCode } from "@/hooks/use-referral-tracking";
import { toast } from "@/hooks/use-toast";
import { previewCouponDiscount, type CouponPreview } from "@/lib/coupons";

const steps = [
  { label: "Shipping", icon: MapPin },
  { label: "Delivery", icon: Truck },
  { label: "Payment", icon: CreditCard },
  { label: "Review", icon: ClipboardList },
];

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -40 : 40, opacity: 0 }),
};

function FloatingInput({
  label, value, onChange, type = "text", placeholder = "",
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <div className="relative">
      <motion.label
        className="absolute left-4 text-muted-foreground pointer-events-none origin-left"
        animate={{
          top: active ? 6 : 16,
          fontSize: active ? 10 : 13,
          letterSpacing: active ? "0.06em" : "0em",
        }}
        transition={{ duration: 0.2 }}
      >
        {label}
      </motion.label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={focused ? placeholder : ""}
        className={`w-full h-14 px-4 pt-5 pb-1 border bg-background text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none transition-all duration-200 ${focused ? "border-foreground shadow-[0_0_0_1px_hsl(var(--foreground))]" : "border-border"
          }`}
      />
    </div>
  );
}

// ─── Validation helpers ───────────────────────────────────────────────────────

function validateStep0(shipping: {
  firstName: string; lastName: string; email: string; phone: string;
  address: string; city: string; state: string; zip: string;
}): string | null {
  if (!shipping.firstName.trim()) return "First name is required.";
  if (!shipping.lastName.trim()) return "Last name is required.";
  if (!shipping.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email))
    return "A valid email is required.";
  if (!shipping.phone.trim()) return "Phone number is required.";
  if (!shipping.address.trim()) return "Street address is required.";
  if (!shipping.city.trim()) return "City is required.";
  if (!shipping.state.trim()) return "State is required.";
  if (!shipping.zip.trim()) return "ZIP code is required.";
  return null;
}

function validateStep2(payment: {
  cardName: string; cardNumber: string; expiry: string; cvc: string;
}): string | null {
  if (!payment.cardName.trim()) return "Cardholder name is required.";
  const digits = payment.cardNumber.replace(/\s/g, "");
  if (digits.length < 13) return "Enter a valid card number.";
  if (payment.expiry.replace(/\s/g, "").length < 5) return "Enter a valid expiry date.";
  if (payment.cvc.length < 3) return "Enter a valid CVC.";
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const { items, totalPrice, clearCart, couponCode } = useCart();
  const { user } = useAuth();
  const { settings } = useBrandSettings();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const [shipping, setShipping] = useState({
    firstName: "", lastName: "", email: "", phone: "", address: "", city: "", state: "", zip: "", country: "US",
  });
  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [payment, setPayment] = useState({ cardNumber: "", expiry: "", cvc: "", cardName: "" });
  const [couponPreview, setCouponPreview] = useState<CouponPreview | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const deliveryCost = 0;
  const discountAmount = couponPreview?.valid ? couponPreview.discountAmount : 0;
  const discountedSubtotal = Math.max(totalPrice - discountAmount, 0);
  const tax = discountedSubtotal * 0.1;
  const total = discountedSubtotal + deliveryCost + tax;

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

  const goTo = (newStep: number) => {
    setDirection(newStep > step ? 1 : -1);
    setStep(newStep);
  };

  const countryPhoneMap: Record<string, string> = {
    US: "+1", CA: "+1", GB: "+44", AU: "+61", IN: "+91",
  };

  const formatPhoneForCountry = (country: string, raw: string) => {
    const code = countryPhoneMap[country] ?? "";
    const digits = raw.replace(/\D/g, "");
    const codeDigits = code.replace(/\+/g, "");
    const trimmedRaw = raw.trim();
    const shouldStripCode =
      trimmedRaw.startsWith("+") ||
      trimmedRaw.startsWith(codeDigits + " ") ||
      trimmedRaw === codeDigits;

    const stripped = shouldStripCode && digits.startsWith(codeDigits)
      ? digits.slice(codeDigits.length)
      : digits;

    return code ? `${code} ${stripped}`.trim() : stripped;
  };

  const handlePhoneChange = (val: string) =>
    setShipping((s) => ({ ...s, phone: formatPhoneForCountry(s.country || "US", val) }));

  const handleCountryChange = (country: string) =>
    setShipping((s) => ({ ...s, country, phone: formatPhoneForCountry(country, s.phone) }));

  const formatCardNumber = (raw: string) =>
    raw.replace(/\D/g, "").slice(0, 19).replace(/(.{4})/g, "$1 ").trim();

  const formatExpiry = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
  };

  const handleCardNumberChange = (val: string) =>
    setPayment((p) => ({ ...p, cardNumber: formatCardNumber(val) }));
  const handleExpiryChange = (val: string) =>
    setPayment((p) => ({ ...p, expiry: formatExpiry(val) }));

  const next = async () => {
    // ── Validate before advancing ──────────────────────────────────────────
    if (step === 0) {
      const err = validateStep0(shipping);
      if (err) { toast({ title: "Incomplete details", description: err, variant: "destructive" }); return; }
    }

    if (step === 2) {
      const err = validateStep2(payment);
      if (err) { toast({ title: "Payment details incomplete", description: err, variant: "destructive" }); return; }
    }
    // Step 1 (delivery) always has a default selected, so no validation needed.
    // ──────────────────────────────────────────────────────────────────────

    if (step < 3) {
      goTo(step + 1);
      return;
    }

    // ── Place order ────────────────────────────────────────────────────────
    setLoading(true);
    const affiliateCode = getReferralCode();

    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to complete the checkout.", variant: "destructive" });
      setLoading(false);
      return;
    }

    let couponDetails = couponPreview;
    if (couponCode) {
      try {
        couponDetails = await previewCouponDiscount(
          couponCode,
          items.map((item) => ({
            product_id: item.id,
            price: item.price,
            quantity: item.quantity,
          })),
          totalPrice,
        );
        setCouponPreview(couponDetails);
      } catch (error: any) {
        toast({
          title: "Coupon validation failed",
          description: error?.message || "Unable to validate the coupon.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!couponDetails?.valid) {
        toast({
          title: "Coupon is not valid",
          description: couponDetails?.message || "Please remove the coupon and try again.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
    }

    const orderDiscount = couponDetails?.valid ? couponDetails.discountAmount : 0;
    const orderSubtotal = Math.max(totalPrice - orderDiscount, 0);
    const orderTax = orderSubtotal * 0.1;
    const grandTotal = orderSubtotal + deliveryCost + orderTax;

    const { data: dbOrder, error: orderErr } = await supabase.rpc("create_order_with_items", {
      p_user_id: user.id,
      p_email: shipping.email || user.email,
      p_first_name: shipping.firstName,
      p_last_name: shipping.lastName,
      p_phone: shipping.phone,
      p_address: shipping.address,
      p_city: shipping.city,
      p_state: shipping.state,
      p_zip: shipping.zip,
      p_country: shipping.country,
      p_shipping_method: "standard",
      p_delivery_fee: deliveryCost,
      p_subtotal: totalPrice,
      p_tax: orderTax,
      p_total: grandTotal,
      p_affiliate_code: affiliateCode,
      p_coupon_code: couponDetails?.valid ? couponDetails.code ?? couponCode : null,
      p_items: items.map((it) => ({
        product_id: String(it.id),
        variant_id: it.variantId ?? null,
        printful_sync_variant_id: it.printfulSyncVariantId ?? null,
        name: it.name,
        image: it.image,
        size: it.size ?? "",
        color: it.color ?? "",
        price: it.price,
        quantity: it.quantity,
      })),
    });

    if (orderErr || !dbOrder) {
      toast({ title: "Order failed", description: orderErr?.message ?? "Unable to create order.", variant: "destructive" });
      setLoading(false);
      return;
    }

    const { error: printfulErr } = await supabase.functions.invoke("printful-submit-order", {
      body: { orderId: dbOrder.id },
    });

    if (printfulErr) {
      toast({
        title: "Order saved",
        description: "Printful automation needs attention in admin before fulfillment can continue.",
      });
    }

    const createdLocalOrder: Order = {
      id: dbOrder.id,
      formattedId: dbOrder.formatted_id ?? `BAEO-0000`,
      customerInfo: shipping,
      items,
      shippingMethod: "standard",
      deliveryFee: deliveryCost,
      subtotal: totalPrice,
      tax: orderTax,
      total: grandTotal,
      date: new Date().toISOString(),
      status: "pending",
      couponCode: couponDetails?.valid ? couponDetails.code ?? couponCode : null,
      couponTitle: couponDetails?.valid ? couponDetails.title ?? null : null,
      discountAmount: orderDiscount,
    };

    setCreatedOrder(createdLocalOrder);
    setLoading(false);
    setOrderPlaced(true);
    clearCart();
  };

  const back = () => { if (step > 0) goTo(step - 1); };

  // ── Success screen ─────────────────────────────────────────────────────────
  if (orderPlaced && createdOrder) {
    return (
      <>
        <main className="pt-24 pb-12 bg-background min-h-screen">
          <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-center mb-12"
            >
              <div className="relative w-24 h-24 mx-auto mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-24 h-24 border-2 border-foreground flex items-center justify-center"
                >
                  <motion.div
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                  >
                    <Check size={40} strokeWidth={1.5} className="text-foreground" />
                  </motion.div>
                </motion.div>
              </div>

              <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                className="text-2xl font-black tracking-tight text-foreground mb-3">
                Order Placed Successfully
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                className="text-sm text-muted-foreground mb-2">
                Thank you for shopping with {settings.brandName}.
              </motion.p>
              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                className="text-xs text-muted-foreground mb-10">
                Order ID: <span className="font-semibold">{createdOrder.formattedId}</span>
              </motion.p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="mb-12">
              <Invoice order={createdOrder} />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
              className="flex flex-col sm:flex-row gap-4 justify-center">
              <InvoiceDownloadButton order={createdOrder} contentId="invoice-content" />
              <Link to="/orders"
                className="inline-flex items-center justify-center px-6 py-2 border border-border rounded-md hover:bg-accent transition-colors text-sm font-medium">
                View Order History
              </Link>
              <Link to="/"
                className="inline-block px-12 py-2 bg-foreground text-primary-foreground text-xs font-bold tracking-[0.2em] uppercase hover:bg-foreground/90 transition-colors rounded-md">
                Continue Shopping
              </Link>
            </motion.div>
          </div>
        </main>
      </>
    );
  }

  // ── Main checkout ──────────────────────────────────────────────────────────
  return (
    <>
      {/* pb-36 leaves room for the fixed mobile summary bar */}
      <main className="pt-24 pb-36 lg:pb-24 bg-background min-h-screen overflow-x-hidden">
        {/* ↑ overflow-x-hidden on main prevents any child from causing horizontal scroll */}
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
          <Link to="/"
            className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8 group">
            <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Continue shopping
          </Link>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mb-8 sm:mb-10">Checkout</h1>

          {/* Step indicator */}
          <div className="flex items-center mb-8 sm:mb-12 min-w-0">
            {steps.map((s, i) => (
              <div key={s.label} className="flex items-center flex-1 min-w-0">
                <button
                  onClick={() => i < step && goTo(i)}
                  disabled={i > step}
                  className="flex items-center gap-1.5 sm:gap-3 group flex-shrink-0"
                >
                  <motion.div
                    animate={{
                      backgroundColor: i <= step ? "hsl(var(--foreground))" : "hsl(var(--muted))",
                      color: i <= step ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
                    }}
                    transition={{ duration: 0.3 }}
                    className="w-8 h-8 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold shadow-sm flex-shrink-0"
                  >
                    {i < step ? <Check size={13} /> : i + 1}
                  </motion.div>
                  <span className={`hidden sm:block text-xs sm:text-sm font-semibold transition-colors duration-300 whitespace-nowrap ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>
                    {s.label}
                  </span>
                </button>
                {i < steps.length - 1 && (
                  <div className="flex-1 h-px mx-1.5 sm:mx-4 relative overflow-hidden bg-border min-w-0">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-foreground"
                      animate={{ width: i < step ? "100%" : "0%" }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-12">
            {/* Form area */}
            <div className="lg:col-span-2 min-w-0">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* Step 0: Shipping */}
                  {step === 0 && (
                    <div className="space-y-3 sm:space-y-4">
                      <h2 className="text-xs sm:text-sm font-bold tracking-widest uppercase text-foreground mb-4 sm:mb-6">Shipping Address</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <FloatingInput label="First name" value={shipping.firstName} onChange={(v) => setShipping({ ...shipping, firstName: v })} />
                        <FloatingInput label="Last name" value={shipping.lastName} onChange={(v) => setShipping({ ...shipping, lastName: v })} />
                      </div>
                      <FloatingInput label="Email" value={shipping.email} onChange={(v) => setShipping({ ...shipping, email: v })} type="email" />
                      <div className="grid grid-cols-3 gap-3 sm:gap-4 items-end">
                        <div>
                          <label className="text-[11px] text-muted-foreground mb-1 block">Country</label>
                          <select
                            value={shipping.country}
                            onChange={(e) => handleCountryChange(e.target.value)}
                            className="w-full h-12 px-3 border border-border rounded-lg bg-background text-sm"
                          >
                            <option value="US">United States</option>
                            <option value="CA">Canada</option>
                            <option value="GB">United Kingdom</option>
                            <option value="AU">Australia</option>
                            <option value="IN">India</option>
                          </select>
                        </div>
                        <div className="col-span-2">
                          <FloatingInput label="Phone" value={shipping.phone} onChange={handlePhoneChange} type="tel" />
                        </div>
                      </div>
                      <FloatingInput label="Street address" value={shipping.address} onChange={(v) => setShipping({ ...shipping, address: v })} />
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                        <FloatingInput label="City" value={shipping.city} onChange={(v) => setShipping({ ...shipping, city: v })} />
                        <FloatingInput label="State" value={shipping.state} onChange={(v) => setShipping({ ...shipping, state: v })} />
                        <FloatingInput label="ZIP" value={shipping.zip} onChange={(v) => setShipping({ ...shipping, zip: v })} />
                      </div>
                    </div>
                  )}

                  {/* Step 1: Delivery */}
                  {step === 1 && (
                    <div className="space-y-3 sm:space-y-4">
                      <h2 className="text-xs sm:text-sm font-bold tracking-widest uppercase text-foreground mb-4 sm:mb-6">Delivery Method</h2>
                      {[
                        { id: "standard", label: "Free Shipping", desc: "5–7 business days", price: "Free", badge: "Recommended" },
                      ].map((m) => (
                        <motion.button
                          key={m.id}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => setDeliveryMethod(m.id)}
                          className={`w-full flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 rounded-2xl sm:rounded-3xl border transition-all duration-200 text-left relative overflow-hidden ${deliveryMethod === m.id
                            ? "border-foreground bg-muted/50 shadow-sm"
                            : "border-border hover:border-foreground/30 bg-background"
                            }`}
                        >
                          <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
                            <div className={`w-4 h-4 border-2 flex items-center justify-center transition-colors flex-shrink-0 mt-0.5 sm:mt-0 ${deliveryMethod === m.id ? "border-foreground" : "border-muted-foreground/40"}`}>
                              <AnimatePresence>
                                {deliveryMethod === m.id && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    className="w-2 h-2 bg-foreground"
                                  />
                                )}
                              </AnimatePresence>
                            </div>
                            <div>
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm sm:text-base font-semibold text-foreground">{m.label}</p>
                                  {m.badge && (
                                    <span className="text-[9px] sm:text-[10px] font-bold tracking-wider uppercase px-1.5 sm:px-2 py-0.5 bg-foreground text-primary-foreground">
                                      {m.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground">{m.desc}</p>
                              </div>
                            </div>
                          </div>
                          <span className="text-sm font-bold text-foreground mt-2 sm:mt-0">{m.price}</span>
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {/* Step 2: Payment */}
                  {step === 2 && (
                    <div className="space-y-4 sm:space-y-5">
                      <h2 className="text-xs sm:text-sm font-bold tracking-widest uppercase text-foreground mb-4 sm:mb-6">Payment Method</h2>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 sm:mb-6">
                        {[
                          { id: "card", label: "Card", icon: <CreditCard size={16} /> },
                          { id: "apple", label: "Apple Pay", icon: null },
                          { id: "google", label: "Google Pay", icon: null },
                        ].map((pm) => (
                          <motion.button
                            key={pm.id}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => pm.id === "card" && setPaymentMethod(pm.id)}
                            className={`flex-1 h-12 sm:h-14 rounded-xl sm:rounded-2xl border text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${paymentMethod === pm.id
                              ? "border-foreground bg-foreground text-primary-foreground"
                              : "border-border text-muted-foreground hover:border-foreground/30 bg-background"
                              } ${pm.id !== "card" ? "opacity-50 cursor-not-allowed" : ""}`}
                            disabled={pm.id !== "card"}
                          >
                            {pm.icon}
                            {pm.label}
                          </motion.button>
                        ))}
                      </div>
                      <FloatingInput label="Cardholder name" value={payment.cardName} onChange={(v) => setPayment({ ...payment, cardName: v })} />
                      <FloatingInput label="Card number" value={payment.cardNumber} onChange={handleCardNumberChange} placeholder="1234 5678 9012 3456" />
                      <div className="grid grid-cols-2 gap-4">
                        <FloatingInput label="Expiry" value={payment.expiry} onChange={handleExpiryChange} placeholder="MM / YY" />
                        <FloatingInput label="CVC" value={payment.cvc} onChange={(v) => setPayment({ ...payment, cvc: v.replace(/\D/g, "").slice(0, 4) })} placeholder="123" />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                        <Lock size={12} className="flex-shrink-0" />
                        <span className="text-xs sm:text-sm">Your payment info is encrypted and secure</span>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Review */}
                {step === 3 && (
                    <div className="space-y-3 sm:space-y-5">
                      <h2 className="text-xs sm:text-sm font-bold tracking-widest uppercase text-foreground mb-4 sm:mb-6">Review Order</h2>
                      {(couponLoading || couponPreview?.valid) && (
                        <div className="rounded-3xl border border-border bg-background/70 p-4 text-xs text-muted-foreground">
                          {couponLoading ? (
                            <p>Validating coupon...</p>
                          ) : couponPreview?.valid ? (
                            <p>
                              Coupon {couponPreview.code ?? couponCode} applied{couponPreview.discountAmount > 0 ? `, saving $${couponPreview.discountAmount.toFixed(2)}.` : "."}
                            </p>
                          ) : null}
                        </div>
                      )}
                      {couponPreview && !couponPreview.valid && (
                        <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
                          {couponPreview.message || "This coupon is not valid for the current cart."}
                        </div>
                      )}

                      <div className="rounded-3xl border border-border bg-background/70 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xs font-bold tracking-widest uppercase text-foreground">Shipping</h3>
                          <button onClick={() => goTo(0)} className="text-xs text-muted-foreground hover:text-foreground underline transition-colors">Edit</button>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {shipping.firstName} {shipping.lastName}<br />
                          {shipping.email}<br />
                          {shipping.address}<br />
                          {shipping.city}, {shipping.state} {shipping.zip}<br />
                          {shipping.country}
                        </p>
                      </div>

                      <div className="rounded-3xl border border-border bg-background/70 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xs font-bold tracking-widest uppercase text-foreground">Delivery</h3>
                          <button onClick={() => goTo(1)} className="text-xs text-muted-foreground hover:text-foreground underline transition-colors">Edit</button>
                        </div>
                        <p className="text-sm text-muted-foreground capitalize">{deliveryMethod} — {deliveryCost === 0 ? "Free" : `$${deliveryCost}.00`}</p>
                      </div>

                      <div className="rounded-3xl border border-border bg-background/70 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xs font-bold tracking-widest uppercase text-foreground">Payment</h3>
                          <button onClick={() => goTo(2)} className="text-xs text-muted-foreground hover:text-foreground underline transition-colors">Edit</button>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard size={14} className="text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            •••• {payment.cardNumber.slice(-4) || "••••"}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-3xl border border-border bg-background/70 p-5 shadow-sm">
                        <h3 className="text-xs font-bold tracking-widest uppercase text-foreground mb-4">Items ({items.length})</h3>
                        <div className="space-y-3">
                          {items.map((item) => (
                            <div key={`${item.id}-${item.size}`} className="flex items-center gap-3">
                              <div className="w-12 h-14 bg-muted overflow-hidden flex-shrink-0">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
                                <p className="text-xs text-muted-foreground">Size: {item.size} × {item.quantity}</p>
                              </div>
                              <span className="text-sm font-bold text-foreground">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6 sm:mt-10">
                {step > 0 && (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={back}
                    className="min-h-16 py-4 px-8 sm:px-12 border border-border text-foreground text-sm font-semibold tracking-[0.08em] uppercase rounded-xl hover:border-foreground transition-colors order-2 sm:order-1 sm:flex-shrink-0"
                  >
                    Back
                  </motion.button>
                )}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={next}
                  disabled={loading}
                  className="flex-1 min-h-16 py-4 px-6 sm:px-12 bg-foreground text-primary-foreground text-sm font-semibold tracking-[0.08em] uppercase hover:bg-foreground/90 transition-colors rounded-xl flex items-center justify-center gap-2 disabled:opacity-70 order-1 sm:order-2"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : step === 3 ? (
                    <>
                      <ShieldCheck size={14} />
                      Place Order — ${total.toFixed(2)}
                    </>
                  ) : (
                    "Continue"
                  )}
                </motion.button>
              </div>

              {step === 3 && (
                <p className="text-xs sm:text-sm text-muted-foreground text-center mt-4 flex items-center justify-center gap-2">
                  <Lock size={12} className="flex-shrink-0" /> Secure checkout — your data is protected
                </p>
              )}
            </div>

            {/* Order Summary - Desktop */}
            <div className="hidden lg:block">
              <div className="lg:sticky lg:top-28 lg:self-start border border-border">
                <div className="p-6">
                  <h3 className="text-xs font-bold tracking-widest uppercase text-foreground mb-6">Order Summary</h3>
                  <div className="space-y-4 mb-6">
                    {items.map((item) => (
                      <motion.div key={`${item.id}-${item.size}`} layout className="flex gap-3">
                        <div className="w-16 h-20 bg-muted overflow-hidden flex-shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Size: {item.size} × {item.quantity}</p>
                          <p className="text-xs font-bold text-foreground mt-1">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                      <div className="space-y-2 border-t border-border pt-4 text-sm">
                        <div className="flex justify-between text-muted-foreground text-xs">
                          <span>Subtotal</span>
                          <span>${totalPrice.toFixed(2)}</span>
                        </div>
                        {couponPreview?.valid && couponPreview.discountAmount > 0 && (
                          <div className="flex justify-between text-foreground text-xs">
                            <span>Coupon {couponPreview.code ?? couponCode}</span>
                            <span>- ${couponPreview.discountAmount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-muted-foreground text-xs">
                          <span>Merchandise total</span>
                          <span>${discountedSubtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground text-xs">
                          <span>Shipping</span>
                          <span>{deliveryCost === 0 ? "Free" : `$${deliveryCost}.00`}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground text-xs">
                          <span>Tax (10%)</span>
                          <span>${tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-foreground pt-3 border-t border-border text-sm">
                          <span>Total</span>
                          <motion.span key={total} initial={{ scale: 1.05 }} animate={{ scale: 1 }}>
                            ${total.toFixed(2)}
                          </motion.span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary - Mobile toggle */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-[0_-4px_20px_rgba(15,23,42,0.06)]">
              <button
                onClick={() => setSummaryOpen(!summaryOpen)}
                className="w-full flex items-center justify-between px-6 sm:px-8 py-5 text-sm font-semibold uppercase text-foreground bg-background rounded-t-3xl"
              >
                <span>Order Summary ({items.length})</span>
                <span className="font-bold">${total.toFixed(2)}</span>
              </button>
              <AnimatePresence>
                {summaryOpen && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden border-t border-border"
                  >
                    <div className="px-6 py-4 space-y-3 max-h-[40vh] overflow-y-auto">
                      {items.map((item) => (
                        <div key={`${item.id}-${item.size}`} className="flex items-center gap-3 text-xs">
                          <div className="w-10 h-12 bg-muted overflow-hidden flex-shrink-0">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                          </div>
                          <span className="flex-1 text-foreground truncate">{item.name} ({item.size}) × {item.quantity}</span>
                          <span className="font-bold text-foreground">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
