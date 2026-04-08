import { useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { revenueData, salesByProduct, metrics } from "@/lib/admin-data";

const timeRanges = ["7 days", "30 days", "90 days", "12 months"] as const;
const COLORS = ["rgba(255,255,255,0.7)", "rgba(255,255,255,0.4)", "rgba(255,255,255,0.2)"];

const customerGrowth = [
  { month: "Nov", customers: 42 },
  { month: "Dec", customers: 68 },
  { month: "Jan", customers: 95 },
  { month: "Feb", customers: 120 },
  { month: "Mar", customers: 158 },
  { month: "Apr", customers: 189 },
];

const ChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[hsl(0,0%,10%)] border border-white/10 rounded-md px-3 py-2 shadow-xl">
        <p className="text-xs text-white/50">{label}</p>
        <p className="text-sm font-semibold text-white">{typeof payload[0].value === "number" && payload[0].value > 100 ? `$${payload[0].value.toLocaleString()}` : payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default function AdminAnalytics() {
  const [range, setRange] = useState<string>("30 days");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white/90">Analytics</h1>
          <p className="text-sm text-white/40 mt-0.5">Track performance and growth</p>
        </div>
        <div className="flex items-center gap-1.5">
          {timeRanges.map((t) => (
            <button
              key={t}
              onClick={() => setRange(t)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                range === t
                  ? "bg-white/10 text-white border border-white/[0.12]"
                  : "text-white/30 hover:text-white/60 border border-transparent"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-5"
        >
          <h2 className="text-sm font-semibold text-white/70 mb-4">Revenue Trend</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(0,0%,100%)" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="hsl(0,0%,100%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 11 }} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="rgba(255,255,255,0.5)" strokeWidth={1.5} fill="url(#aGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Customer Growth */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-5"
        >
          <h2 className="text-sm font-semibold text-white/70 mb-4">Customer Growth</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerGrowth}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 11 }} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="customers" fill="rgba(255,255,255,0.15)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Sales by Category */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-5"
        >
          <h2 className="text-sm font-semibold text-white/70 mb-4">Sales by Category</h2>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={salesByProduct} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" stroke="none">
                  {salesByProduct.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  formatter={(value) => <span className="text-xs text-white/50">{value}</span>}
                  iconType="circle"
                  iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-5 flex flex-col justify-center"
        >
          <h2 className="text-sm font-semibold text-white/70 mb-6">Period Summary</h2>
          <div className="space-y-5">
            {[
              { label: "Total Revenue", value: `$${metrics.totalRevenue.toLocaleString()}`, change: `+${metrics.revenueGrowth}%` },
              { label: "Avg Order Value", value: `$${Math.round(metrics.totalRevenue / metrics.totalOrders)}`, change: "+4.1%" },
              { label: "New Customers", value: "32", change: `+${metrics.customerGrowth}%` },
              { label: "Conversion Rate", value: `${metrics.conversionRate}%`, change: `+${metrics.conversionGrowth}%` },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-white/40">{item.label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-white/80">{item.value}</span>
                  <span className="text-xs font-medium text-emerald-400">{item.change}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
