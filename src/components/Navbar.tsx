import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Menu, X, Heart, User, ChevronDown, ChevronRight, Package } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useLogo } from "@/context/LogoContext";
import { useAuth } from "@/context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import MegaMenu from "./MegaMenu";

const links = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop", hasMega: true },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];

const mobileCategories = [
  {
    title: "Tops",
    items: [
      { label: "Hoodies", href: "/shop?category=hoodies" },
      { label: "T-Shirts", href: "/shop?category=tshirts" },
      { label: "Sweatshirts", href: "/shop?category=sweatshirts" },
    ],
  },
  {
    title: "Collections",
    items: [
      { label: "New Arrivals", href: "/shop?collection=new" },
      { label: "Best Sellers", href: "/shop?collection=bestsellers" },
      { label: "Essentials", href: "/shop?collection=essentials" },
    ],
  },
  {
    title: "More",
    items: [
      { label: "Accessories", href: "/shop?category=accessories" },
      { label: "Sale", href: "/shop?sale=true" },
      { label: "All Products", href: "/shop" },
    ],
  },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null);
  const { totalItems, setIsOpen } = useCart();
  const { count: wishCount } = useWishlist();
  const { logo } = useLogo();
  const { user, role } = useAuth();
  const accountHref = !user ? "/auth" : role === "admin" ? "/admin" : role === "affiliate" ? "/affiliate" : "/account";
  const location = useLocation();
  const closeTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMegaOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMegaOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleMegaEnter = useCallback(() => {
    clearTimeout(closeTimeout.current);
    setMegaOpen(true);
  }, []);

  const handleMegaLeave = useCallback(() => {
    closeTimeout.current = setTimeout(() => setMegaOpen(false), 250);
  }, []);

  const isHome = location.pathname === "/";
  const bg = scrolled || !isHome || megaOpen
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
          <Link to="/" className="flex items-center gap-2">
            {logo ? (
              <img src={logo} alt="Logo" className="h-8 md:h-10 object-contain" />
            ) : (
              <span className="text-lg md:text-xl font-black tracking-[0.2em] text-foreground uppercase">
                BE AN EXAMPLE
              </span>
            )}
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            {links.map((link) =>
              link.hasMega ? (
                <div
                  key={link.label}
                  onMouseEnter={handleMegaEnter}
                  onMouseLeave={handleMegaLeave}
                  className="relative"
                >
                  <button
                    onClick={() => setMegaOpen((p) => !p)}
                    className="relative flex items-center gap-1 text-sm font-medium tracking-wide text-foreground/70 hover:text-foreground transition-colors group"
                  >
                    {link.label}
                    <ChevronDown
                      size={13}
                      className={`transition-transform duration-200 ${megaOpen ? "rotate-180" : ""}`}
                    />
                    <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-foreground transition-all duration-300 group-hover:w-full" />
                  </button>
                </div>
              ) : (
                <Link
                  key={link.label}
                  to={link.href}
                  className="relative text-sm font-medium tracking-wide text-foreground/70 hover:text-foreground transition-colors group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-foreground transition-all duration-300 group-hover:w-full" />
                </Link>
              )
            )}
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            <Link to="/wishlist" className="relative text-foreground hover:text-foreground/70 transition-colors">
              <Heart size={19} strokeWidth={1.5} />
              {wishCount > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center rounded-full">
                  {wishCount}
                </span>
              )}
            </Link>
            <Link to="/orders" className="text-foreground hover:text-foreground/70 transition-colors hidden sm:block" title="My Orders">
              <Package size={19} strokeWidth={1.5} />
            </Link>
            <Link to={accountHref} className="text-foreground hover:text-foreground/70 transition-colors hidden sm:block" title={user ? "My account" : "Sign in"}>
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

      {/* Desktop Mega Menu */}
      <AnimatePresence>
        {megaOpen && (
          <div onMouseEnter={handleMegaEnter} onMouseLeave={handleMegaLeave}>
            <MegaMenu onClose={() => setMegaOpen(false)} />
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Full-Screen Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] bg-background"
          >
            <div className="flex items-center justify-between h-16 px-6 border-b border-border">
              <Link to="/" className="flex items-center gap-2">
                {logo ? (
                  <img src={logo} alt="Logo" className="h-6 object-contain" />
                ) : (
                  <span className="text-lg font-black tracking-[0.2em] uppercase">BE AN EXAMPLE</span>
                )}
              </Link>
              <button onClick={() => setMobileOpen(false)}>
                <X size={22} strokeWidth={1.5} />
              </button>
            </div>

            <div className="overflow-y-auto h-[calc(100vh-4rem)] px-6 py-8">
              {/* Main Links */}
              <div className="space-y-1 mb-8">
                {links.filter((l) => !l.hasMega).map((link, i) => (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Link
                      to={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="block text-2xl font-bold tracking-wider text-foreground py-2"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Shop Accordion */}
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
              >
                <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-muted-foreground mb-4">
                  Shop
                </p>
              </motion.div>

              <div className="space-y-0 border-t border-border">
                {mobileCategories.map((cat, ci) => (
                  <motion.div
                    key={cat.title}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + ci * 0.06 }}
                    className="border-b border-border"
                  >
                    <button
                      onClick={() => setExpandedMobile(expandedMobile === cat.title ? null : cat.title)}
                      className="flex items-center justify-between w-full py-4 text-left"
                    >
                      <span className="text-base font-semibold tracking-wide text-foreground">
                        {cat.title}
                      </span>
                      <ChevronRight
                        size={16}
                        className={`text-muted-foreground transition-transform duration-200 ${
                          expandedMobile === cat.title ? "rotate-90" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {expandedMobile === cat.title && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="pb-4 pl-3 space-y-3">
                            {cat.items.map((item) => (
                              <Link
                                key={item.label}
                                to={item.href}
                                onClick={() => setMobileOpen(false)}
                                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {item.label}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>

              {/* Bottom Links */}
              <div className="mt-10 space-y-4">
                <Link
                  to="/auth"
                  onClick={() => setMobileOpen(false)}
                  className="block text-sm font-medium tracking-wider text-muted-foreground"
                >
                  Account
                </Link>
                <Link
                  to="/wishlist"
                  onClick={() => setMobileOpen(false)}
                  className="block text-sm font-medium tracking-wider text-muted-foreground"
                >
                  Wishlist
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
