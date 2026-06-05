import { motion } from "framer-motion";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useAdminOrders, computeMetrics, revenueByDay } from "@/hooks/use-admin-data";
import { useProducts } from "@/hooks/use-products";
import { useMemo } from "react";

const ChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-background border border-border rounded-md px-3 py-2 shadow-lg">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default function AdminAnalytics() {
  const { data: orders = [] } = useAdminOrders();
  const { data: products = [] } = useProducts();
  const metrics = computeMetrics(orders);
  const revenueData = revenueByDay(orders, 30);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach((p) => { map[p.category] = (map[p.category] || 0) + 1; });
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  }, [products]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Live store performance</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-background border border-border rounded-lg p-5">
          <h2 className="text-sm font-semibold text-foreground/70 mb-4">Revenue Trend (30 days)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(0,0%,0%)" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="hsl(0,0%,0%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "hsl(0,0%,45%)", fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(0,0%,45%)", fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(0,0%,0%)" strokeWidth={1.5} fill="url(#aGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-background border border-border rounded-lg p-5">
          <h2 className="text-sm font-semibold text-foreground/70 mb-4">Products by Category</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(0,0%,45%)", fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(0,0%,45%)", fontSize: 11 }} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" fill="hsl(0,0%,0%)" fillOpacity={0.15} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-background border border-border rounded-lg p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-foreground/70 mb-6">Period Summary</h2>
          <div className="grid sm:grid-cols-4 gap-5">
            {[
              { label: "Total Revenue", value: `$${metrics.totalRevenue.toFixed(2)}` },
              { label: "Total Orders", value: metrics.totalOrders.toString() },
              { label: "Avg Order", value: metrics.totalOrders ? `$${(metrics.totalRevenue / metrics.totalOrders).toFixed(2)}` : "$0" },
              { label: "Customers", value: metrics.totalCustomers.toString() },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{item.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
