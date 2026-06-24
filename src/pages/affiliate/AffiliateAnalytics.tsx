import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";
import { useMyAffiliate, useMyClicks, useMyCommissions } from "@/hooks/use-affiliate";
import { useMemo } from "react";
import { formatCurrency } from "@/lib/currency";

const ChartTooltip = ({ active, payload, label, prefix = "" }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-background border border-border rounded-md px-3 py-2 shadow-lg">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">
          {prefix ? `${prefix}${Number(payload[0].value).toLocaleString()}` : Number(payload[0].value).toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

function bucketByDay<T extends { created_at: string }>(rows: T[], accessor: (r: T) => number, days = 30) {
  const buckets: Record<string, number> = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    buckets[d.toISOString().slice(5, 10)] = 0;
  }
  rows.forEach((r) => {
    const k = r.created_at.slice(5, 10);
    if (k in buckets) buckets[k] += accessor(r);
  });
  return Object.entries(buckets).map(([date, value]) => ({ date, value }));
}

export default function AffiliateAnalytics() {
  const { data: affiliate, isLoading } = useMyAffiliate();
  const { data: clicks = [] } = useMyClicks(affiliate?.id);
  const { data: commissions = [] } = useMyCommissions(affiliate?.id);
  const approvedCommissions = commissions.filter((c) => c.status === "approved" || c.status === "paid");

  const clicksData = useMemo(() => bucketByDay(clicks.map((c) => ({ created_at: c.created_at })), () => 1), [clicks]);
  const earningsData = useMemo(() => bucketByDay(approvedCommissions, (c) => Number(c.amount)), [approvedCommissions]);

  if (isLoading) return <div className="py-16 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  if (!affiliate) return <p className="text-sm text-muted-foreground">No affiliate profile.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Track your performance.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-background border border-border rounded-lg p-5">
          <h2 className="text-sm font-semibold text-foreground/70 mb-4">Clicks (30 days)</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={clicksData}>
                <defs><linearGradient id="clicksGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(0,0%,0%)" stopOpacity={0.08} /><stop offset="100%" stopColor="hsl(0,0%,0%)" stopOpacity={0} /></linearGradient></defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "hsl(0,0%,45%)", fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(0,0%,45%)", fontSize: 11 }} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="value" stroke="hsl(0,0%,0%)" strokeWidth={1.5} fill="url(#clicksGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-background border border-border rounded-lg p-5">
          <h2 className="text-sm font-semibold text-foreground/70 mb-4">Earnings (30 days)</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={earningsData}>
                <defs><linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(0,0%,0%)" stopOpacity={0.08} /><stop offset="100%" stopColor="hsl(0,0%,0%)" stopOpacity={0} /></linearGradient></defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "hsl(0,0%,45%)", fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(0,0%,45%)", fontSize: 11 }} tickFormatter={(v) => formatCurrency(Number(v))} />
                <Tooltip content={<ChartTooltip prefix="£" />} />
                <Area type="monotone" dataKey="value" stroke="hsl(0,0%,0%)" strokeWidth={1.5} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
