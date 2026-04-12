import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { affiliateClicksData, affiliateEarningsData, topReferredProducts } from "@/lib/affiliate-data";

const ChartTooltip = ({ active, payload, label, prefix = "" }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-background border border-border rounded-md px-3 py-2 shadow-lg">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">{prefix}{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default function AffiliateAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Track your performance and optimize.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-background border border-border rounded-lg p-5">
          <h2 className="text-sm font-semibold text-foreground/70 mb-4">Clicks Over Time</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={affiliateClicksData}>
                <defs>
                  <linearGradient id="clicksGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(0,0%,0%)" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="hsl(0,0%,0%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "hsl(0,0%,45%)", fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(0,0%,45%)", fontSize: 11 }} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="clicks" stroke="hsl(0,0%,0%)" strokeWidth={1.5} fill="url(#clicksGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-background border border-border rounded-lg p-5">
          <h2 className="text-sm font-semibold text-foreground/70 mb-4">Revenue Generated</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={affiliateEarningsData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(0,0%,0%)" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="hsl(0,0%,0%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "hsl(0,0%,45%)", fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(0,0%,45%)", fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip content={<ChartTooltip prefix="$" />} />
                <Area type="monotone" dataKey="earnings" stroke="hsl(0,0%,0%)" strokeWidth={1.5} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-background border border-border rounded-lg p-5">
        <h2 className="text-sm font-semibold text-foreground/70 mb-4">Top Referred Products</h2>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topReferredProducts}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(0,0%,45%)", fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(0,0%,45%)", fontSize: 11 }} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="referrals" fill="hsl(0,0%,0%)" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
