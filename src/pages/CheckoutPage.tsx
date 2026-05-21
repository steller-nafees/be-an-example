import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Check, CreditCard, Truck, MapPin, ClipboardList, Loader2, ShieldCheck, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useOrder } from "@/context/OrderContext";
import Navbar from "@/components/Navbar";
import Invoice from "@/components/Invoice";
import InvoiceDownloadButton from "@/components/InvoiceDownload";
import type { Order } from "@/context/OrderContext";

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
        className={`w-full h-14 px-4 pt-5 pb-1 border bg-background text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none transition-all duration-200 ${
          focused ? "border-foreground shadow-[0_0_0_1px_hsl(var(--foreground))]" : "border-border"
        }`}
      />
    </div>
  );
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { addOrder } = useOrder();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const [shipping, setShipping] = useState({
    firstName: "", lastName: "", email: "", phone: "", address: "", city: "", state: "", zip: "",
  });
  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [payment, setPayment] = useState({ cardNumber: "", expiry: "", cvc: "", cardName: "" });

  const deliveryCost = deliveryMethod === "express" ? 15 : deliveryMethod === "overnight" ? 25 : 0;
  const total = totalPrice + deliveryCost;

  const goTo = (newStep: number) => {
    setDirection(newStep > step ? 1 : -1);
    setStep(newStep);
  };

  const next = () => {
    if (step < 3) {
      goTo(step + 1);
    } else {
      setLoading(true);
      setTimeout(() => {
        // Calculate tax (10%)
        const tax = totalPrice * 0.1;

        // Create order object
        const newOrder = addOrder({
          customerInfo: shipping,
          items,
          shippingMethod: deliveryMethod as "standard" | "express" | "overnight",
          deliveryFee: deliveryCost,
          subtotal: totalPrice,
          tax,
          total: totalPrice + deliveryCost + tax,
        });

        setCreatedOrder(newOrder);
        setLoading(false);
        setOrderPlaced(true);
        clearCart();
      }, 2000);
    }
  };

  const back = () => {
    if (step > 0) goTo(step - 1);
  };

  // Success screen
  if (orderPlaced && createdOrder) {
    return (
      <>
        <Navbar />
        <main className="pt-24 pb-12 bg-background min-h-screen">
          <div className="container mx-auto px-6 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-center mb-12"
            >
              {/* Animated checkmark */}
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

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-2xl font-black tracking-tight text-foreground mb-3"
              >
                Order Placed Successfully
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-sm text-muted-foreground mb-2"
              >
                Thank you for shopping with BE AN EXAMPLE.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="text-xs text-muted-foreground mb-10"
              >
                Order ID: <span className="font-semibold">{createdOrder.id}</span>
              </motion.p>
            </motion.div>

            {/* Invoice */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mb-12"
            >
              <Invoice order={createdOrder} />
            </motion.div>

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <InvoiceDownloadButton
                order={createdOrder}
                contentId="invoice-content"
              />
              <Link
                to="/orders"
                className="inline-flex items-center justify-center px-6 py-2 border border-border rounded-md hover:bg-accent transition-colors text-sm font-medium"
              >
                View Order History
              </Link>
              <Link
                to="/"
                className="inline-block px-12 py-2 bg-foreground text-primary-foreground text-xs font-bold tracking-[0.2em] uppercase hover:bg-foreground/90 transition-colors rounded-md"
              >
                Continue Shopping
              </Link>
            </motion.div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-24 bg-background min-h-screen">
        <div className="container mx-auto px-6 max-w-6xl">
          <Link to="/" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8 group">
            <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Continue shopping
          </Link>

          <h1 className="text-3xl font-black tracking-tight text-foreground mb-10">Checkout</h1>

          {/* Step indicator */}
          <div className="flex items-center mb-12">
            {steps.map((s, i) => (
              <div key={s.label} className="flex items-center flex-1">
                <button
                  onClick={() => i < step && goTo(i)}
                  disabled={i > step}
                  className="flex items-center gap-2.5 group"
                >
                  <motion.div
                    animate={{
                      backgroundColor: i <= step ? "hsl(var(--foreground))" : "hsl(var(--muted))",
                      color: i <= step ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
                    }}
                    transition={{ duration: 0.3 }}
                    className="w-9 h-9 flex items-center justify-center text-xs font-semibold"
                  >
                    {i < step ? <Check size={14} /> : i + 1}
                  </motion.div>
                  <span className={`hidden sm:block text-xs font-medium transition-colors duration-300 ${
                    i <= step ? "text-foreground" : "text-muted-foreground"
                  }`}>
                    {s.label}
                  </span>
                </button>
                {i < steps.length - 1 && (
                  <div className="flex-1 h-px mx-4 relative overflow-hidden bg-border">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Form area */}
            <div className="lg:col-span-2">
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
                    <div className="space-y-4">
                      <h2 className="text-sm font-bold tracking-widest uppercase text-foreground mb-6">Shipping Address</h2>
                      <div className="grid grid-cols-2 gap-4">
                        <FloatingInput label="First name" value={shipping.firstName} onChange={(v) => setShipping({ ...shipping, firstName: v })} />
                        <FloatingInput label="Last name" value={shipping.lastName} onChange={(v) => setShipping({ ...shipping, lastName: v })} />
                      </div>
                      <FloatingInput label="Email" value={shipping.email} onChange={(v) => setShipping({ ...shipping, email: v })} type="email" />
                      <FloatingInput label="Phone" value={shipping.phone} onChange={(v) => setShipping({ ...shipping, phone: v })} type="tel" />
                      <FloatingInput label="Street address" value={shipping.address} onChange={(v) => setShipping({ ...shipping, address: v })} />
                      <div className="grid grid-cols-3 gap-4">
                        <FloatingInput label="City" value={shipping.city} onChange={(v) => setShipping({ ...shipping, city: v })} />
                        <FloatingInput label="State" value={shipping.state} onChange={(v) => setShipping({ ...shipping, state: v })} />
                        <FloatingInput label="ZIP" value={shipping.zip} onChange={(v) => setShipping({ ...shipping, zip: v })} />
                      </div>
                    </div>
                  )}

                  {/* Step 1: Delivery */}
                  {step === 1 && (
                    <div className="space-y-4">
                      <h2 className="text-sm font-bold tracking-widest uppercase text-foreground mb-6">Delivery Method</h2>
                      {[
                        { id: "standard", label: "Standard Shipping", desc: "5–7 business days", price: "Free", badge: "Recommended" },
                        { id: "express", label: "Express Shipping", desc: "2–3 business days", price: "$15.00", badge: "" },
                        { id: "overnight", label: "Overnight", desc: "Next business day", price: "$25.00", badge: "" },
                      ].map((m) => (
                        <motion.button
                          key={m.id}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => setDeliveryMethod(m.id)}
                          className={`w-full flex items-center justify-between p-5 border transition-all duration-200 text-left relative overflow-hidden ${
                            deliveryMethod === m.id
                              ? "border-foreground bg-muted/50"
                              : "border-border hover:border-foreground/30"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-4 h-4 border-2 flex items-center justify-center transition-colors ${
                              deliveryMethod === m.id ? "border-foreground" : "border-muted-foreground/40"
                            }`}>
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
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-foreground">{m.label}</p>
                                {m.badge && (
                                  <span className="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 bg-foreground text-primary-foreground">
                                    {m.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
                            </div>
                          </div>
                          <span className="text-sm font-bold text-foreground">{m.price}</span>
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {/* Step 2: Payment */}
                  {step === 2 && (
                    <div className="space-y-5">
                      <h2 className="text-sm font-bold tracking-widest uppercase text-foreground mb-6">Payment Method</h2>
                      <div className="flex gap-3 mb-6">
                        {[
                          { id: "card", label: "Card", icon: <CreditCard size={16} /> },
                          { id: "apple", label: "Apple Pay", icon: null },
                          { id: "google", label: "Google Pay", icon: null },
                        ].map((pm) => (
                          <motion.button
                            key={pm.id}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => pm.id === "card" && setPaymentMethod(pm.id)}
                            className={`flex-1 h-12 border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                              paymentMethod === pm.id
                                ? "border-foreground bg-foreground text-primary-foreground"
                                : "border-border text-muted-foreground hover:border-foreground/30"
                            } ${pm.id !== "card" ? "opacity-40 cursor-not-allowed" : ""}`}
                            disabled={pm.id !== "card"}
                          >
                            {pm.icon}
                            {pm.label}
                          </motion.button>
                        ))}
                      </div>
                      <FloatingInput label="Cardholder name" value={payment.cardName} onChange={(v) => setPayment({ ...payment, cardName: v })} />
                      <FloatingInput label="Card number" value={payment.cardNumber} onChange={(v) => setPayment({ ...payment, cardNumber: v })} placeholder="1234 5678 9012 3456" />
                      <div className="grid grid-cols-2 gap-4">
                        <FloatingInput label="Expiry" value={payment.expiry} onChange={(v) => setPayment({ ...payment, expiry: v })} placeholder="MM / YY" />
                        <FloatingInput label="CVC" value={payment.cvc} onChange={(v) => setPayment({ ...payment, cvc: v })} placeholder="123" />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                        <Lock size={12} />
                        <span>Your payment info is encrypted and secure</span>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Review */}
                  {step === 3 && (
                    <div className="space-y-5">
                      <h2 className="text-sm font-bold tracking-widest uppercase text-foreground mb-6">Review Order</h2>

                      {/* Shipping summary */}
                      <div className="border border-border p-5">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xs font-bold tracking-widest uppercase text-foreground">Shipping</h3>
                          <button onClick={() => goTo(0)} className="text-xs text-muted-foreground hover:text-foreground underline transition-colors">Edit</button>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {shipping.firstName} {shipping.lastName}<br />
                          {shipping.email}<br />
                          {shipping.address}<br />
                          {shipping.city}, {shipping.state} {shipping.zip}
                        </p>
                      </div>

                      {/* Delivery summary */}
                      <div className="border border-border p-5">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xs font-bold tracking-widest uppercase text-foreground">Delivery</h3>
                          <button onClick={() => goTo(1)} className="text-xs text-muted-foreground hover:text-foreground underline transition-colors">Edit</button>
                        </div>
                        <p className="text-sm text-muted-foreground capitalize">{deliveryMethod} — {deliveryCost === 0 ? "Free" : `$${deliveryCost}.00`}</p>
                      </div>

                      {/* Payment summary */}
                      <div className="border border-border p-5">
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

                      {/* Items */}
                      <div className="border border-border p-5">
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
              <div className="flex gap-3 mt-10">
                {step > 0 && (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={back}
                    className="h-13 px-8 border border-border text-foreground text-xs font-bold tracking-widest uppercase hover:border-foreground transition-colors"
                  >
                    Back
                  </motion.button>
                )}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={next}
                  disabled={loading}
                  className="flex-1 h-13 bg-foreground text-primary-foreground text-xs font-bold tracking-[0.2em] uppercase hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
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
                <p className="text-[11px] text-muted-foreground text-center mt-4 flex items-center justify-center gap-1.5">
                  <Lock size={10} /> Secure checkout — your data is protected
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
                      <motion.div
                        key={`${item.id}-${item.size}`}
                        layout
                        className="flex gap-3"
                      >
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
                    <div className="flex justify-between text-muted-foreground text-xs">
                      <span>Shipping</span>
                      <span>{deliveryCost === 0 ? "Free" : `$${deliveryCost}.00`}</span>
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
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
              <button
                onClick={() => setSummaryOpen(!summaryOpen)}
                className="w-full flex items-center justify-between px-6 py-3 text-xs font-bold tracking-widest uppercase text-foreground"
              >
                <span>Order Summary ({items.length})</span>
                <span>${total.toFixed(2)}</span>
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
