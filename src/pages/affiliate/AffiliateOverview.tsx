import { motion } from "framer-motion";
import { DollarSign, MousePointerClick, ShoppingBag, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import MetricCard from "@/components/admin/MetricCard";
import { mockAffiliates, affiliateEarningsData, mockReferrals } from "@/lib/affiliate-data";
import StatusBadge from "@/components/admin/StatusBadge";

const affiliate = mockAffiliates[0];

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

export default function AffiliateOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Welcome back, {affiliate.name.split(" ")[0]}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Here's your performance overview.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Earnings" value={affiliate.totalEarnings} prefix="$" growth={12.5} icon={DollarSign} index={0} />
        <MetricCard label="Pending" value={affiliate.pendingEarnings} prefix="$" growth={8.2} icon={TrendingUp} index={1} />
        <MetricCard label="Clicks" value={affiliate.totalClicks} growth={15.3} icon={MousePointerClick} index={2} />
        <MetricCard label="Conversions" value={affiliate.totalConversions} growth={2.1} icon={ShoppingBag} index={3} />
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-3 bg-background border border-border rounded-lg p-5"
        >
          <h2 className="text-sm font-semibold text-foreground/70 mb-4">Earnings Overview</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={affiliateEarningsData}>
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

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-background border border-border rounded-lg p-5"
        >
          <h2 className="text-sm font-semibold text-foreground/70 mb-4">Recent Referrals</h2>
          <div className="space-y-3">
            {mockReferrals.slice(0, 5).map((ref) => (
              <div key={ref.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground/80">{ref.customer}</p>
                  <p className="text-xs text-muted-foreground">{ref.product}</p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <StatusBadge status={ref.status as any} />
                  <span className="text-sm font-medium text-foreground/60">${ref.commission.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
