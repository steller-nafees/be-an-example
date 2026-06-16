import { motion } from "framer-motion";
import { DollarSign, MousePointerClick, ShoppingBag, TrendingUp, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import MetricCard from "@/components/admin/MetricCard";
import StatusBadge from "@/components/admin/StatusBadge";
import { useMyAffiliate, useMyCommissions, useMyClicks, computeEarnings } from "@/hooks/use-affiliate";
import { useMemo } from "react";
import { Link } from "react-router-dom";

const ChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-background border border-border rounded-md px-3 py-2 shadow-lg">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">${payload[0].value}</p>
      </div>
    );
  }
  return null;
};

function earningsByDay(commissions: { created_at: string; amount: number }[], days = 14) {
  const buckets: Record<string, number> = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    buckets[d.toISOString().slice(5, 10)] = 0;
  }
  commissions.forEach((c) => {
    const k = c.created_at.slice(5, 10);
    if (k in buckets) buckets[k] += Number(c.amount);
  });
  return Object.entries(buckets).map(([date, earnings]) => ({ date, earnings }));
}

export default function AffiliateOverview() {
  const { data: affiliate, isLoading } = useMyAffiliate();
  const { data: commissions = [] } = useMyCommissions(affiliate?.id);
  const { data: clicks = [] } = useMyClicks(affiliate?.id);
  const earnings = computeEarnings(commissions);
  const approvedCommissions = commissions.filter((c) => c.status === "approved" || c.status === "paid");
  const chartData = useMemo(() => earningsByDay(approvedCommissions), [approvedCommissions]);

  if (isLoading) {
    return <div className="py-16 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  }

  if (!affiliate) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <h2 className="text-lg font-bold text-foreground mb-2">No affiliate profile</h2>
        <p className="text-sm text-muted-foreground mb-4">Apply to the affiliate program to get started.</p>
        <Link to="/affiliate/apply" className="inline-block px-4 py-2 bg-foreground text-background text-sm rounded-md">Apply now</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Welcome back, {affiliate.name.split(" ")[0]}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Status: <span className="capitalize">{affiliate.status}</span> · Code <span className="font-mono">{affiliate.code}</span> · Rate <span className="font-mono">{affiliate.commission_rate}%</span>
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Earnings" value={earnings.total} prefix="$" decimals={2} growth={0} icon={DollarSign} index={0} />
        <MetricCard label="Pending" value={earnings.pending} prefix="$" decimals={2} growth={0} icon={TrendingUp} index={1} />
        <MetricCard label="Clicks" value={clicks.length} growth={0} icon={MousePointerClick} index={2} />
        <MetricCard label="Conversions" value={commissions.length} growth={0} icon={ShoppingBag} index={3} />
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-3 bg-background border border-border rounded-lg p-5">
          <h2 className="text-sm font-semibold text-foreground/70 mb-4">Earnings (14 days)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(0,0%,0%)" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="hsl(0,0%,0%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "hsl(0,0%,45%)", fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(0,0%,45%)", fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="earnings" stroke="hsl(0,0%,0%)" strokeWidth={1.5} fill="url(#earningsGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 bg-background border border-border rounded-lg p-5">
          <h2 className="text-sm font-semibold text-foreground/70 mb-4">Recent Commissions</h2>
          <div className="space-y-3">
            {commissions.length === 0 && <p className="text-xs text-muted-foreground">No commissions yet.</p>}
            {commissions.slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground/80">
                    {c.orders ? ([c.orders.first_name, c.orders.last_name].filter(Boolean).join(" ") || c.orders.email) : "Order"}
                  </p>
                  <p className="text-xs text-muted-foreground">{c.created_at.slice(0, 10)}</p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <StatusBadge status={c.status === "approved" ? "delivered" : c.status === "paid" ? "delivered" : "pending"} />
                  <span className="text-sm font-medium text-foreground/60">${Number(c.amount).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
