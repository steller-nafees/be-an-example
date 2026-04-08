import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  Search,
  Bell,
  Menu,
  LogOut,
  User,
  X,
} from "lucide-react";

const navItems = [
  { label: "Overview", path: "/admin", icon: LayoutDashboard },
  { label: "Products", path: "/admin/products", icon: Package },
  { label: "Orders", path: "/admin/orders", icon: ShoppingCart },
  { label: "Customers", path: "/admin/customers", icon: Users },
  { label: "Analytics", path: "/admin/analytics", icon: BarChart3 },
  { label: "Settings", path: "/admin/settings", icon: Settings },
];

export default function AdminLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const isActive = (path: string) =>
    path === "/admin"
      ? location.pathname === "/admin"
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
                ? "bg-white/10 text-white"
                : "text-white/50 hover:text-white/80 hover:bg-white/5"
            }`}
          >
            {active && (
              <motion.div
                layoutId="admin-nav-indicator"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-white rounded-full"
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
    <div className="flex h-screen bg-[hsl(0,0%,4%)] text-white overflow-hidden">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="hidden lg:flex flex-col border-r border-white/[0.06] bg-[hsl(0,0%,6%)] flex-shrink-0"
      >
        <div className="flex items-center justify-between h-14 px-4 border-b border-white/[0.06]">
          {!collapsed && (
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-white/70">
              BE AN EXAMPLE
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md hover:bg-white/5 text-white/40 hover:text-white/70 transition-colors"
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
        <div className="p-3 border-t border-white/[0.06]">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/40 hover:text-white/70 transition-colors rounded-md hover:bg-white/5"
          >
            <LogOut size={18} strokeWidth={1.5} />
            {!collapsed && <span>Back to Store</span>}
          </Link>
        </div>
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-[240px] bg-[hsl(0,0%,6%)] border-r border-white/[0.06] z-50 lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between h-14 px-4 border-b border-white/[0.06]">
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-white/70">
                  BE AN EXAMPLE
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 text-white/40 hover:text-white/70"
                >
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-14 flex items-center justify-between px-4 md:px-6 border-b border-white/[0.06] bg-[hsl(0,0%,4%)] flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-1.5 text-white/50 hover:text-white/80"
            >
              <Menu size={20} />
            </button>
            <div className="relative hidden sm:flex items-center">
              <Search
                size={14}
                className="absolute left-3 text-white/30"
              />
              <input
                type="text"
                placeholder="Search…"
                className="h-8 w-56 bg-white/[0.04] border border-white/[0.08] rounded-md pl-8 pr-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 text-white/40 hover:text-white/70 transition-colors">
              <Bell size={18} strokeWidth={1.5} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-accent rounded-full" />
            </button>
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-md hover:bg-white/5 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                  <User size={14} className="text-white/60" />
                </div>
                {!collapsed && (
                  <span className="hidden md:block text-sm text-white/60">Admin</span>
                )}
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1 w-48 bg-[hsl(0,0%,10%)] border border-white/[0.08] rounded-md shadow-xl overflow-hidden z-50"
                  >
                    <div className="px-3 py-2.5 border-b border-white/[0.06]">
                      <p className="text-sm font-medium text-white/90">Admin User</p>
                      <p className="text-xs text-white/40">admin@beanexample.com</p>
                    </div>
                    <Link
                      to="/admin/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <Settings size={14} />
                      Settings
                    </Link>
                    <Link
                      to="/"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <LogOut size={14} />
                      Sign Out
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
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
