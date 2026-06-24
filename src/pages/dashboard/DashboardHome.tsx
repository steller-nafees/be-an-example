import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Package, Heart, Gift, TrendingUp, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { useMyAffiliate, useMyCommissions, computeEarnings } from "@/hooks/use-affiliate";
import { supabase } from "@/lib/supabase";
import { getTier, type MemberTier } from "@/components/dashboard/DashboardLayout";
import { formatCurrency } from "@/lib/currency";

type Ctx = { totalSpend: number; tier: MemberTier; firstName: string };

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

function CountUp({ value, prefix = "", decimals = 0 }: { value: number; prefix?: string; decimals?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const dur = 900;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setN(value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{prefix}{n.toFixed(decimals)}</>;
}

export default function DashboardHome() {
  const { firstName, totalSpend } = useOutletContext<Ctx>();
  const { user } = useAuth();
  const { count: wishCount } = useWishlist();
  const [orderCount, setOrderCount] = useState(0);
  const [recent, setRecent] = useState<any>(null);
  const { data: aff } = useMyAffiliate();
  const { data: commissions = [] } = useMyCommissions(aff?.id);
  const earnings = computeEarnings(commissions);
  const { tier, next, progress, toNext } = getTier(totalSpend);
  const points = Math.floor(totalSpend);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, count } = await supabase
        .from("orders")
        .select("id,total,status,created_at", { count: "exact" })
        .neq("status", "cancelled")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);
      setOrderCount(count ?? 0);
      setRecent(data?.[0] ?? null);
    })();
  }, [user]);

  return (
    <div className="px-6 md:px-12 py-10 md:py-14 max-w-6xl">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <p className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-3">Member dashboard</p>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground leading-[1.02]">
          Welcome back,<br />
          <span className="italic font-light">{firstName}.</span>
        </h1>
        <p className="mt-4 text-muted-foreground max-w-md">Keep setting the example.</p>
      </motion.div>

      {/* Hero card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15 }}
        className="mt-10 relative overflow-hidden rounded-2xl bg-foreground text-background p-7 md:p-10"
      >
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-accent/30 blur-3xl" />
        <div className="relative grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={14} className="text-accent" />
              <span className="text-[10px] tracking-[0.3em] uppercase text-background/70">{tier} Status</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-1">
              {next ? `${formatCurrency(toNext)} to ${next}` : "You've reached the top."}
            </h2>
            <p className="text-background/60 text-sm mb-6">
              {next ? "Unlock exclusive drops, early access, and elevated rewards." : "Enjoy your Elite benefits — for life."}
            </p>
            <div className="h-1.5 bg-background/15 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
                className="h-full bg-background"
              />
            </div>
            <div className="mt-3 flex justify-between text-[10px] tracking-widest uppercase text-background/50">
              <span>{tier}</span>
              <span>{next ?? "Elite"}</span>
            </div>
          </div>
          <div className="md:border-l md:border-background/15 md:pl-8 grid grid-cols-2 md:grid-cols-1 gap-5">
            <div>
              <p className="text-[10px] tracking-[0.25em] uppercase text-background/50 mb-1">Reward points</p>
              <p className="text-2xl font-black"><CountUp value={points} /></p>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.25em] uppercase text-background/50 mb-1">Lifetime spend</p>
              <p className="text-2xl font-black">{formatCurrency(totalSpend)}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Package} label="Orders" value={orderCount} to="/account/orders" />
        <StatCard icon={Heart} label="Wishlist" value={wishCount} to="/account/wishlist" />
        <StatCard icon={Gift} label="Reward points" value={points} to="/account/rewards" />
        <StatCard icon={TrendingUp} label="Referral earnings" value={earnings.total} currencyCode="gbp" decimals={2} to="/account/affiliate" />
      </motion.div>

      {/* Recent + recs */}
      <div className="mt-10 grid lg:grid-cols-[1.2fr_1fr] gap-6">
        <motion.div variants={item} initial="hidden" animate="show" className="bg-background border border-border/70 rounded-2xl p-7">
          <div className="flex items-baseline justify-between mb-5">
            <h3 className="text-lg font-black tracking-tight">Recent order</h3>
            <Link to="/account/orders" className="text-[11px] tracking-[0.25em] uppercase text-muted-foreground hover:text-foreground">
              View all →
            </Link>
          </div>
          {recent ? (
            <Link to={`/account/orders`} className="block group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-[11px] text-muted-foreground mb-1">#{String(recent.id).slice(0, 8).toUpperCase()}</p>
                  <p className="text-2xl font-black">{formatCurrency(Number(recent.total))}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(recent.created_at).toLocaleDateString()}</p>
                </div>
                <span className="text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full bg-foreground/[0.05] text-foreground">
                  {recent.status}
                </span>
              </div>
            </Link>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground mb-4">No orders yet. The first piece sets the tone.</p>
              <Link to="/shop" className="inline-flex items-center gap-2 text-xs tracking-[0.25em] uppercase font-semibold border-b border-foreground pb-0.5">
                Discover the collection <ArrowUpRight size={14} />
              </Link>
            </div>
          )}
        </motion.div>

        <motion.div variants={item} initial="hidden" animate="show" className="relative overflow-hidden rounded-2xl bg-secondary p-7">
          <div className="absolute inset-0 grain opacity-50 pointer-events-none" />
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-3">Members only</p>
          <h3 className="text-xl font-black tracking-tight mb-2">Early access — Drop 04</h3>
          <p className="text-sm text-muted-foreground mb-5">
            {tier === "Bronze" ? "Reach Silver to unlock." : "You're on the list. We'll notify you 24h before the public drop."}
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-xs tracking-[0.25em] uppercase font-semibold border-b border-foreground pb-0.5"
          >
            Explore <ArrowUpRight size={14} />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  to,
  prefix = "",
  decimals = 0,
  currencyCode,
}: {
  icon: any;
  label: string;
  value: number;
  to: string;
  prefix?: string;
  decimals?: number;
  currencyCode?: string;
}) {
  return (
    <motion.div variants={item}>
      <Link
        to={to}
        className="group block p-5 bg-background border border-border/70 rounded-2xl hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.15)] transition-all"
      >
        <div className="flex items-center justify-between mb-6">
          <Icon size={16} strokeWidth={1.7} className="text-muted-foreground" />
          <ArrowUpRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <p className="text-3xl font-black tracking-tight">
          {currencyCode ? formatCurrency(value, currencyCode) : <CountUp value={value} prefix={prefix} decimals={decimals} />}
        </p>
        <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground mt-1">{label}</p>
      </Link>
    </motion.div>
  );
}
