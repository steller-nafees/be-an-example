import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Truck, Gift, Crown, Lock } from "lucide-react";
import { getTier, type MemberTier } from "@/components/dashboard/DashboardLayout";
import PageHeader from "./_PageHeader";

type Ctx = { totalSpend: number; tier: MemberTier };

const TIERS: { name: MemberTier; min: number; perks: string[] }[] = [
  { name: "Bronze", min: 0, perks: ["Free standard shipping", "Birthday gift"] },
  { name: "Silver", min: 500, perks: ["Free shipping credit", "Early access to drops"] },
  { name: "Gold", min: 1500, perks: ["Members-only collection", "Priority support", "Free returns"] },
  { name: "Elite", min: 5000, perks: ["Concierge styling", "Lifetime free shipping", "Exclusive events"] },
];

const REWARDS = [
  { icon: Truck, title: "Free shipping credit", cost: 500, desc: "On your next order." },
  { icon: Gift, title: "Mystery member gift", cost: 1000, desc: "A signed piece from the archive." },
  { icon: Sparkles, title: "$50 credit", cost: 2000, desc: "Apply at checkout." },
  { icon: Crown, title: "Private styling session", cost: 5000, desc: "30 minutes with our team." },
];

export default function DashboardRewards() {
  const { totalSpend } = useOutletContext<Ctx>();
  const { tier, next, progress, toNext } = getTier(totalSpend);
  const points = Math.floor(totalSpend);

  return (
    <div className="px-6 md:px-12 py-10 md:py-14 max-w-6xl">
      <PageHeader eyebrow="Membership" title="Rewards" subtitle="Loyalty, recognized." />

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="mt-10 relative overflow-hidden rounded-2xl bg-foreground text-background p-8 md:p-10">
        <div className="absolute inset-0 grain opacity-30" />
        <div className="relative grid md:grid-cols-2 gap-8 items-end">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-background/60 mb-3">Current tier</p>
            <h2 className="text-5xl md:text-7xl font-black tracking-tight">{tier}</h2>
            <p className="mt-3 text-background/70 text-sm">{points.toLocaleString()} points · ${totalSpend.toFixed(2)} lifetime</p>
          </div>
          <div>
            {next ? (
              <>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-[10px] tracking-[0.3em] uppercase text-background/60">Progress to {next}</span>
                  <span className="text-xs text-background/80">${toNext.toFixed(2)} away</span>
                </div>
                <div className="h-1.5 bg-background/15 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1.2, ease: "easeOut" }} className="h-full bg-accent" />
                </div>
              </>
            ) : (
              <p className="text-sm text-background/70">You've reached the highest tier. Your perks are eternal.</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Tier ladder */}
      <div className="mt-12">
        <h3 className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-5">The ladder</h3>
        <div className="grid md:grid-cols-4 gap-4">
          {TIERS.map((t, i) => {
            const reached = totalSpend >= t.min;
            const current = t.name === tier;
            return (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`relative p-6 rounded-2xl border transition-all ${
                  current ? "border-foreground bg-foreground text-background" : reached ? "bg-background border-border/70" : "bg-background border-dashed border-border opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] tracking-[0.25em] uppercase ${current ? "text-background/60" : "text-muted-foreground"}`}>
                    ${t.min.toLocaleString()}+
                  </span>
                  {!reached && <Lock size={12} className="text-muted-foreground" />}
                </div>
                <p className="text-xl font-black mb-4">{t.name}</p>
                <ul className={`space-y-1.5 text-xs ${current ? "text-background/80" : "text-muted-foreground"}`}>
                  {t.perks.map((p) => <li key={p}>· {p}</li>)}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Rewards catalog */}
      <div className="mt-12">
        <h3 className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-5">Available rewards</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {REWARDS.map((r, i) => {
            const can = points >= r.cost;
            return (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-6 bg-background border border-border/70 rounded-xl flex items-center gap-5"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${can ? "bg-foreground text-background" : "bg-muted text-muted-foreground"}`}>
                  <r.icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{r.title}</p>
                  <p className="text-xs text-muted-foreground">{r.desc}</p>
                </div>
                <button
                  disabled={!can}
                  className="h-10 px-5 text-[10px] tracking-[0.25em] uppercase font-semibold rounded-lg bg-foreground text-background disabled:bg-muted disabled:text-muted-foreground"
                >
                  {can ? "Redeem" : `${r.cost} pts`}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
