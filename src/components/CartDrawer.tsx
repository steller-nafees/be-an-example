import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Link } from "react-router-dom";

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, totalPrice } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[70] bg-foreground/50"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 bottom-0 z-[80] w-full max-w-md bg-background border-l border-border flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-bold tracking-wider uppercase text-foreground">Cart</h2>
              <button onClick={() => setIsOpen(false)} className="text-foreground hover:text-muted-foreground transition-colors">
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag size={48} className="text-border mb-4" strokeWidth={1} />
                  <p className="text-muted-foreground text-sm mb-6">Your cart is empty</p>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-8 py-3 bg-foreground text-primary-foreground text-xs font-semibold tracking-widest uppercase"
                  >
                    Continue Shopping
                  </button>
                </div>
              )}
              {items.map((item) => (
                <motion.div
                  key={`${item.id}-${item.size}`}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  className="flex gap-4"
                >
                  <div className="w-20 h-24 bg-muted overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{item.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Size: {item.size}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)} className="text-foreground hover:text-muted-foreground">
                          <Minus size={14} />
                        </button>
                        <motion.span key={item.quantity} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="text-sm font-medium w-4 text-center">
                          {item.quantity}
                        </motion.span>
                        <button onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)} className="text-foreground hover:text-muted-foreground">
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-foreground">${item.price * item.quantity}</span>
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.id, item.size)} className="text-muted-foreground hover:text-foreground self-start">
                    <X size={14} />
                  </button>
                </motion.div>
              ))}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-border space-y-4">
                <div className="flex justify-between text-sm font-semibold text-foreground">
                  <span>Total</span>
                  <span>${totalPrice}</span>
                </div>
                <Link
                  to="/checkout"
                  onClick={() => setIsOpen(false)}
                  className="block w-full py-4 bg-foreground text-primary-foreground text-sm font-semibold tracking-widest uppercase hover:bg-foreground/90 transition-colors text-center"
                >
                  Checkout
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
