import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  Heart,
  MapPin,
  Gift,
  TrendingUp,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

const NAV = [
  { to: "/account", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/account/orders", label: "Orders", icon: Package },
  { to: "/account/wishlist", label: "Wishlist", icon: Heart },
  { to: "/account/addresses", label: "Addresses", icon: MapPin },
  { to: "/account/rewards", label: "Rewards", icon: Gift },
  { to: "/account/affiliate", label: "Affiliate", icon: TrendingUp },
  { to: "/account/notifications", label: "Notifications", icon: Bell },
  { to: "/account/settings", label: "Settings", icon: Settings },
];

export type MemberTier = "Bronze" | "Silver" | "Gold" | "Elite";

export function getTier(totalSpend: number): { tier: MemberTier; next: MemberTier | null; progress: number; toNext: number } {
  if (totalSpend >= 5000) return { tier: "Elite", next: null, progress: 100, toNext: 0 };
  if (totalSpend >= 1500) return { tier: "Gold", next: "Elite", progress: ((totalSpend - 1500) / 3500) * 100, toNext: 5000 - totalSpend };
  if (totalSpend >= 500) return { tier: "Silver", next: "Gold", progress: ((totalSpend - 500) / 1000) * 100, toNext: 1500 - totalSpend };
  return { tier: "Bronze", next: "Silver", progress: (totalSpend / 500) * 100, toNext: 500 - totalSpend };
}

const TIER_COLOR: Record<MemberTier, string> = {
  Bronze: "from-amber-700 to-amber-900",
  Silver: "from-slate-400 to-slate-600",
  Gold: "from-yellow-500 to-yellow-700",
  Elite: "from-foreground to-foreground",
};

export default function DashboardLayout() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profile, setProfile] = useState<{ full_name: string | null; avatar_url: string | null }>({
    full_name: user?.user_metadata?.full_name ?? null,
    avatar_url: null,
  });
  const [totalSpend, setTotalSpend] = useState(0);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: p }, { data: o }] = await Promise.all([
        supabase.from("profiles").select("full_name,avatar_url").eq("id", user.id).maybeSingle(),
        supabase.from("orders").select("total").eq("user_id", user.id),
      ]);
      if (p) setProfile(p);
      setTotalSpend((o || []).reduce((s: number, r: any) => s + Number(r.total || 0), 0));
    })();
  }, [user]);

  const firstName = (profile.full_name || user?.email || "Member").split(" ")[0].split("@")[0];
  const initials = firstName.slice(0, 2).toUpperCase();
  const { tier } = getTier(totalSpend);

  const SidebarInner = (
    <div className="h-full flex flex-col">
      {/* Brand */}
      <div className="px-7 pt-8 pb-6 border-b border-border/60">
        <Link to="/" className="text-xs tracking-[0.3em] uppercase font-black flex items-center gap-2 text-foreground">
          <ChevronLeft size={14} /> Be An Example
        </Link>
      </div>

      {/* User card */}
      <div className="px-7 py-7 border-b border-border/60">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold tracking-widest">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{profile.full_name || firstName}</p>
            <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-gradient-to-r ${TIER_COLOR[tier]}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-background/90" />
          <span className="text-[10px] tracking-[0.2em] uppercase font-semibold text-background">{tier} Member</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-0.5 overflow-y-auto">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-foreground/[0.05] text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.03]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-foreground rounded-r"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <item.icon size={16} strokeWidth={1.7} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={signOut}
        className="mx-4 mb-6 flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-foreground/[0.03] transition-colors"
      >
        <LogOut size={16} strokeWidth={1.7} /> Sign out
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Mobile header */}
      <header className="md:hidden sticky top-0 z-30 bg-background/85 backdrop-blur border-b border-border px-5 h-14 flex items-center justify-between">
        <button onClick={() => setMobileOpen(true)} className="p-1.5 -ml-1.5">
          <Menu size={20} />
        </button>
        <p className="text-[11px] tracking-[0.3em] uppercase font-black">Be An Example</p>
        <div className="w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center text-[10px] font-bold">
          {initials}
        </div>
      </header>

      <div className="md:grid md:grid-cols-[280px_1fr] min-h-screen">
        {/* Desktop sidebar */}
        <aside className="hidden md:block sticky top-0 h-screen border-r border-border/60 bg-background">
          {SidebarInner}
        </aside>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                className="md:hidden fixed inset-0 z-40 bg-foreground/40"
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "tween", duration: 0.25 }}
                className="md:hidden fixed top-0 left-0 bottom-0 w-[82%] max-w-[320px] z-50 bg-background"
              >
                <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 p-1.5 z-10">
                  <X size={18} />
                </button>
                {SidebarInner}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main */}
        <main className="min-w-0">
          <Outlet context={{ totalSpend, tier, firstName, profile }} />
        </main>
      </div>
    </div>
  );
}
