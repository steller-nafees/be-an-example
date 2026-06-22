import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Link2,
  ShoppingBag,
  BarChart3,
  DollarSign,
  Wallet,
  Settings,
  ChevronLeft,
  Menu,
  X,
  LogOut,
  User,
} from "lucide-react";

const navItems = [
  { label: "Overview", path: "/affiliate", icon: LayoutDashboard },
  { label: "Links", path: "/affiliate/links", icon: Link2 },
  { label: "Orders", path: "/affiliate/orders", icon: ShoppingBag },
  { label: "Analytics", path: "/affiliate/analytics", icon: BarChart3 },
  { label: "Earnings", path: "/affiliate/earnings", icon: DollarSign },
  { label: "Payouts", path: "/affiliate/payouts", icon: Wallet },
  { label: "Settings", path: "/affiliate/settings", icon: Settings },
];

export default function AffiliateLayout() {
  const location = useLocation();
  const { signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) =>
    path === "/affiliate"
      ? location.pathname === "/affiliate"
      : location.pathname.startsWith(path);

  const SidebarContent = () => (
    <nav className="flex flex-col gap-1 px-3">
      {navItems.map((item) => {
        const active = isActive(item.path);
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={`relative flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-200 rounded-md group ${
              active
                ? "bg-foreground/[0.06] text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.03]"
            }`}
          >
            {active && (
              <motion.div
                layoutId="affiliate-nav-indicator"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-foreground rounded-full"
              />
            )}
            <item.icon size={18} strokeWidth={1.5} />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="hidden lg:flex flex-col border-r border-border bg-muted/40 flex-shrink-0"
      >
        <div className="flex items-center justify-between h-14 px-4 border-b border-border">
          {!collapsed && (
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-foreground/70">
              Creator Hub
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md hover:bg-foreground/[0.05] text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft
              size={16}
              className={`transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`}
            />
          </button>
        </div>
        <div className="flex-1 py-4 overflow-y-auto">
          <SidebarContent />
        </div>
        <div className="p-3 border-t border-border space-y-2">
          <button
            type="button"
            onClick={signOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-foreground/[0.03]"
          >
            <LogOut size={18} strokeWidth={1.5} />
            {!collapsed && <span>Sign Out</span>}
          </button>
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-foreground/[0.03]"
          >
            <LogOut size={18} strokeWidth={1.5} />
            {!collapsed && <span>Back to Store</span>}
          </Link>
        </div>
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-foreground/20 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-[240px] bg-background border-r border-border z-50 lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between h-14 px-4 border-b border-border">
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-foreground/70">
                  Creator Hub
                </span>
                <button onClick={() => setMobileOpen(false)} className="p-1.5 text-muted-foreground hover:text-foreground">
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 py-4 overflow-y-auto">
                <SidebarContent />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 flex items-center justify-between px-4 md:px-6 border-b border-border bg-background flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-1.5 text-muted-foreground hover:text-foreground">
              <Menu size={20} />
            </button>
            <h1 className="text-sm font-semibold text-foreground/70">Affiliate Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-foreground/10 flex items-center justify-center">
              <User size={14} className="text-muted-foreground" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/30">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
