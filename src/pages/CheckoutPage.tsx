import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Check, CreditCard, Truck, MapPin, ClipboardList, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import Navbar from "@/components/Navbar";

const steps = [
  { label: "Shipping", icon: MapPin },
  { label: "Delivery", icon: Truck },
  { label: "Payment", icon: CreditCard },
  { label: "Review", icon: ClipboardList },
];

export default function CheckoutPage() {
  const { items, totalPrice } = useCart();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [shipping, setShipping] = useState({
    firstName: "", lastName: "", email: "", phone: "", address: "", city: "", state: "", zip: "", country: "US",
  });
  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  const [payment, setPayment] = useState({ cardNumber: "", expiry: "", cvc: "", cardName: "" });

  const deliveryCost = deliveryMethod === "express" ? 15 : deliveryMethod === "overnight" ? 25 : 0;
  const total = totalPrice + deliveryCost;

  const next = () => {
    if (step < 3) setStep(step + 1);
    else {
      setLoading(true);
      setTimeout(() => setLoading(false), 2000);
    }
  };

  const InputField = ({ label, value, onChange, type = "text", placeholder = "" }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) => (
    <div>
      <label className="block text-xs font-semibold tracking-widest uppercase text-foreground mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-12 px-4 border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
      />
    </div>
  );

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-24 bg-background min-h-screen">
        <div className="container mx-auto px-6 max-w-6xl">
          <Link to="/" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ChevronLeft size={14} /> Continue shopping
          </Link>

          <h1 className="text-3xl font-black tracking-tight text-foreground mb-8">Checkout</h1>

          {/* Progress */}
          <div className="flex items-center mb-12">
            {steps.map((s, i) => (
              <div key={s.label} className="flex items-center flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                      i <= step
                        ? "bg-foreground text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i < step ? <Check size={14} /> : i + 1}
                  </div>
                  <span className={`hidden sm:block text-xs font-medium transition-colors ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-px mx-4 transition-colors ${i < step ? "bg-foreground" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Form */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {step === 0 && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                        <InputField label="First name" value={shipping.firstName} onChange={(v) => setShipping({ ...shipping, firstName: v })} />
                        <InputField label="Last name" value={shipping.lastName} onChange={(v) => setShipping({ ...shipping, lastName: v })} />
                      </div>
                      <InputField label="Email" value={shipping.email} onChange={(v) => setShipping({ ...shipping, email: v })} type="email" />
                      <InputField label="Phone" value={shipping.phone} onChange={(v) => setShipping({ ...shipping, phone: v })} type="tel" />
                      <InputField label="Address" value={shipping.address} onChange={(v) => setShipping({ ...shipping, address: v })} />
                      <div className="grid grid-cols-3 gap-4">
                        <InputField label="City" value={shipping.city} onChange={(v) => setShipping({ ...shipping, city: v })} />
                        <InputField label="State" value={shipping.state} onChange={(v) => setShipping({ ...shipping, state: v })} />
                        <InputField label="ZIP" value={shipping.zip} onChange={(v) => setShipping({ ...shipping, zip: v })} />
                      </div>
                    </div>
                  )}

                  {step === 1 && (
                    <div className="space-y-4">
                      {[
                        { id: "standard", label: "Standard Shipping", desc: "5-7 business days", price: "Free" },
                        { id: "express", label: "Express Shipping", desc: "2-3 business days", price: "$15" },
                        { id: "overnight", label: "Overnight", desc: "Next business day", price: "$25" },
                      ].map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setDeliveryMethod(m.id)}
                          className={`w-full flex items-center justify-between p-5 border transition-all duration-200 text-left ${
                            deliveryMethod === m.id ? "border-foreground bg-muted" : "border-border hover:border-foreground/50"
                          }`}
                        >
                          <div>
                            <p className="text-sm font-semibold text-foreground">{m.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
                          </div>
                          <span className="text-sm font-semibold text-foreground">{m.price}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-5">
                      <div className="flex gap-3 mb-6">
                        <button className="flex-1 h-12 border border-foreground bg-foreground text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2">
                          <CreditCard size={16} /> Card
                        </button>
                        <button className="flex-1 h-12 border border-border text-foreground text-sm font-semibold flex items-center justify-center gap-2 hover:border-foreground/50 transition-colors opacity-50" disabled>
                          Apple Pay
                        </button>
                      </div>
                      <InputField label="Cardholder name" value={payment.cardName} onChange={(v) => setPayment({ ...payment, cardName: v })} />
                      <InputField label="Card number" value={payment.cardNumber} onChange={(v) => setPayment({ ...payment, cardNumber: v })} placeholder="1234 5678 9012 3456" />
                      <div className="grid grid-cols-2 gap-4">
                        <InputField label="Expiry" value={payment.expiry} onChange={(v) => setPayment({ ...payment, expiry: v })} placeholder="MM/YY" />
                        <InputField label="CVC" value={payment.cvc} onChange={(v) => setPayment({ ...payment, cvc: v })} placeholder="123" />
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-6">
                      <div className="border border-border p-5">
                        <h3 className="text-xs font-semibold tracking-widest uppercase text-foreground mb-3">Shipping</h3>
                        <p className="text-sm text-muted-foreground">
                          {shipping.firstName} {shipping.lastName}<br />
                          {shipping.address}<br />
                          {shipping.city}, {shipping.state} {shipping.zip}
                        </p>
                      </div>
                      <div className="border border-border p-5">
                        <h3 className="text-xs font-semibold tracking-widest uppercase text-foreground mb-3">Items</h3>
                        <div className="space-y-3">
                          {items.map((item) => (
                            <div key={`${item.id}-${item.size}`} className="flex items-center justify-between text-sm">
                              <span className="text-foreground">{item.name} × {item.quantity} ({item.size})</span>
                              <span className="font-semibold text-foreground">${item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="flex gap-3 mt-8">
                {step > 0 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="h-12 px-8 border border-border text-foreground text-sm font-semibold tracking-widest uppercase hover:border-foreground transition-colors"
                  >
                    Back
                  </button>
                )}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={next}
                  disabled={loading}
                  className="flex-1 h-12 bg-foreground text-primary-foreground text-sm font-semibold tracking-widest uppercase hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {step === 3 ? "Place Order" : "Continue"}
                </motion.button>
              </div>
            </div>

            {/* Order summary sidebar */}
            <div className="lg:sticky lg:top-28 lg:self-start">
              <div className="border border-border p-6">
                <h3 className="text-sm font-semibold tracking-widest uppercase text-foreground mb-6">Order Summary</h3>
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.size}`} className="flex gap-3">
                      <div className="w-14 h-16 bg-muted overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-foreground">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground">Size: {item.size} × {item.quantity}</p>
                        <p className="text-xs font-semibold text-foreground mt-1">${item.price * item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 border-t border-border pt-4 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>${totalPrice}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>{deliveryCost === 0 ? "Free" : `$${deliveryCost}`}</span>
                  </div>
                  <div className="flex justify-between font-bold text-foreground pt-2 border-t border-border">
                    <span>Total</span>
                    <span>${total}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
