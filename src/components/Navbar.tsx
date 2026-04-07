import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Menu, X, Heart, Search, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Link, useLocation } from "react-router-dom";

const links = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems, setIsOpen } = useCart();
  const { count: wishCount } = useWishlist();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Only transparent on home
  const isHome = location.pathname === "/";
  const bg = scrolled || !isHome
    ? "bg-background/95 backdrop-blur-md border-b border-border"
    : "bg-transparent";

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${bg}`}
      >
        <div className="container mx-auto flex items-center justify-between h-16 md:h-20 px-6">
          <Link to="/" className="text-lg md:text-xl font-black tracking-[0.2em] text-foreground uppercase">
            BE AN EXAMPLE
          </Link>

          <div className="hidden md:flex items-center gap-10">
            {links.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="relative text-sm font-medium tracking-wide text-foreground/70 hover:text-foreground transition-colors group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-foreground transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link to="/wishlist" className="relative text-foreground hover:text-foreground/70 transition-colors">
              <Heart size={19} strokeWidth={1.5} />
              {wishCount > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center rounded-full">
                  {wishCount}
                </span>
              )}
            </Link>
            <Link to="/auth" className="text-foreground hover:text-foreground/70 transition-colors hidden sm:block">
              <User size={19} strokeWidth={1.5} />
            </Link>
            <button
              onClick={() => setIsOpen(true)}
              className="relative text-foreground hover:text-foreground/70 transition-colors"
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-4 h-4 bg-foreground text-primary-foreground text-[10px] font-bold flex items-center justify-center rounded-full"
                >
                  {totalItems}
                </motion.span>
              )}
            </button>
            <button className="md:hidden text-foreground" onClick={() => setMobileOpen(true)}>
              <Menu size={22} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background"
          >
            <div className="flex items-center justify-between h-16 px-6">
              <span className="text-lg font-black tracking-[0.2em] uppercase">BE AN EXAMPLE</span>
              <button onClick={() => setMobileOpen(false)}>
                <X size={22} strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex flex-col items-center justify-center gap-8 pt-20">
              {links.map((link, i) => (
                <motion.div key={link.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <Link
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-3xl font-bold tracking-wider text-foreground"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Link to="/auth" onClick={() => setMobileOpen(false)} className="text-xl font-medium tracking-wider text-muted-foreground">
                  Account
                </Link>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="text-xl font-medium tracking-wider text-muted-foreground">
                  Wishlist
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
