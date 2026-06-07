import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Copy, ArrowUpRight, MousePointerClick, ShoppingBag, DollarSign, Check } from "lucide-react";
import { useState } from "react";
import { useMyAffiliate, useMyCommissions, useMyClicks, computeEarnings } from "@/hooks/use-affiliate";
import PageHeader from "./_PageHeader";

export default function DashboardAffiliate() {
  const { data: aff, isLoading } = useMyAffiliate();
  const { data: commissions = [] } = useMyCommissions(aff?.id);
  const { data: clicks = [] } = useMyClicks(aff?.id);
  const e = computeEarnings(commissions);
  const [copied, setCopied] = useState(false);

  const link = aff ? `${window.location.origin}/?ref=${aff.code}` : "";
  const conversions = commissions.length;
  const conversionRate = clicks.length ? (conversions / clicks.length) * 100 : 0;

  const copy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  if (isLoading) {
    return <div className="px-6 md:px-12 py-14"><div className="h-40 bg-muted/50 rounded-2xl animate-pulse" /></div>;
  }

  if (!aff || aff.status !== "approved") {
    return (
      <div className="px-6 md:px-12 py-10 md:py-14 max-w-6xl">
        <PageHeader eyebrow="Earn" title="Affiliate Center" subtitle="Refer the brand. Earn the share." />
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-10 p-10 md:p-14 bg-foreground text-background rounded-2xl relative overflow-hidden">
          <div className="absolute -right-24 -bottom-24 w-80 h-80 rounded-full bg-accent/40 blur-3xl" />
          <div className="relative max-w-lg">
            <p className="text-[10px] tracking-[0.3em] uppercase text-background/60 mb-3">
              {aff?.status === "pending" ? "Application pending" : "Become an affiliate"}
            </p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              {aff?.status === "pending" ? "We're reviewing your application." : "Set the example. Earn from it."}
            </h2>
            <p className="text-background/70 mb-7">
              {aff?.status === "pending"
                ? "You'll hear from us within 48 hours."
                : "Up to 20% commission on every referred order. Personal links, real-time analytics, fast payouts."}
            </p>
            {aff?.status !== "pending" && (
              <Link to="/affiliate/apply" className="inline-flex items-center gap-2 h-12 px-7 bg-background text-foreground text-[11px] tracking-[0.25em] uppercase font-semibold rounded-lg">
                Apply now <ArrowUpRight size={14} />
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-12 py-10 md:py-14 max-w-6xl">
      <PageHeader
        eyebrow="Earn"
        title="Affiliate Center"
        subtitle="Your performance, in real time."
        action={
          <Link to="/affiliate" className="h-11 px-5 inline-flex items-center gap-2 border border-border rounded-lg text-[11px] tracking-[0.25em] uppercase">
            Full portal <ArrowUpRight size={13} />
          </Link>
        }
      />

      {/* Referral link */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-10 p-6 md:p-7 bg-background border border-border/70 rounded-2xl">
        <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-3">Your referral link</p>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 h-12 px-4 bg-muted/50 rounded-lg flex items-center font-mono text-sm truncate">{link}</div>
          <button
            onClick={copy}
            className="h-12 px-6 bg-foreground text-background text-[11px] tracking-[0.25em] uppercase font-semibold rounded-lg inline-flex items-center justify-center gap-2"
          >
            {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy link</>}
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={DollarSign} label="Total earnings" value={`$${e.total.toFixed(2)}`} />
        <Stat icon={DollarSign} label="Paid out" value={`$${e.paid.toFixed(2)}`} />
        <Stat icon={MousePointerClick} label="Clicks" value={clicks.length.toString()} />
        <Stat icon={ShoppingBag} label="Conversion" value={`${conversionRate.toFixed(1)}%`} sub={`${conversions} orders`} />
      </div>

      {/* Recent commissions */}
      <div className="mt-10 bg-background border border-border/70 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-border/70 flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-wide">Recent commissions</h3>
          <Link to="/affiliate/earnings" className="text-[11px] tracking-[0.25em] uppercase text-muted-foreground hover:text-foreground">
            View all →
          </Link>
        </div>
        {commissions.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-muted-foreground">No commissions yet — share your link to get started.</p>
        ) : (
          <ul className="divide-y divide-border/70">
            {commissions.slice(0, 6).map((c) => (
              <li key={c.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-mono text-[11px] text-muted-foreground">#{(c.order_id ?? c.id).slice(0, 8).toUpperCase()}</p>
                  <p className="text-sm">{new Date(c.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-full bg-foreground/[0.05]">{c.status}</span>
                  <p className="font-semibold">+${Number(c.amount).toFixed(2)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="p-5 bg-background border border-border/70 rounded-2xl">
      <Icon size={16} className="text-muted-foreground mb-6" strokeWidth={1.7} />
      <p className="text-2xl font-black tracking-tight">{value}</p>
      <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground mt-1">{label}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </motion.div>
  );
}
