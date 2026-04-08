import { motion } from "framer-motion";
import { DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import MetricCard from "@/components/admin/MetricCard";
import StatusBadge from "@/components/admin/StatusBadge";
import { metrics, revenueData, mockOrders } from "@/lib/admin-data";
import { products } from "@/lib/products";
import { Link } from "react-router-dom";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[hsl(0,0%,10%)] border border-white/10 rounded-md px-3 py-2 shadow-xl">
        <p className="text-xs text-white/50">{label}</p>
        <p className="text-sm font-semibold text-white">${payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const recentOrders = mockOrders.slice(0, 5);
  const topProducts = products.slice(0, 4);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white/90">Dashboard</h1>
        <p className="text-sm text-white/40 mt-0.5">Welcome back. Here's what's happening.</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Revenue" value={metrics.totalRevenue} prefix="$" growth={metrics.revenueGrowth} icon={DollarSign} index={0} />
        <MetricCard label="Orders" value={metrics.totalOrders} growth={metrics.orderGrowth} icon={ShoppingCart} index={1} />
        <MetricCard label="Customers" value={metrics.totalCustomers} growth={metrics.customerGrowth} icon={Users} index={2} />
        <MetricCard label="Conversion" value={metrics.conversionRate} suffix="%" growth={metrics.conversionGrowth} icon={TrendingUp} index={3} />
      </div>

      {/* Chart + Recent Orders */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="lg:col-span-3 bg-white/[0.03] border border-white/[0.06] rounded-lg p-5"
        >
          <h2 className="text-sm font-semibold text-white/70 mb-4">Revenue Overview</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(0,0%,100%)" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="hsl(0,0%,100%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="rgba(255,255,255,0.5)" strokeWidth={1.5} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="lg:col-span-2 bg-white/[0.03] border border-white/[0.06] rounded-lg p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white/70">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs text-white/30 hover:text-white/60 transition-colors">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                <div>
                  <p className="text-sm font-medium text-white/80">{order.customer}</p>
                  <p className="text-xs text-white/30">{order.id}</p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <StatusBadge status={order.status} />
                  <span className="text-sm font-medium text-white/60">${order.total}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top Products */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white/70">Top Products</h2>
          <Link to="/admin/products" className="text-xs text-white/30 hover:text-white/60 transition-colors">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {topProducts.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 + i * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-md bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors"
            >
              <img src={product.image} alt={product.name} className="w-10 h-10 rounded object-cover" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-white/80 truncate">{product.name}</p>
                <p className="text-xs text-white/40">${product.price} · {product.stock} in stock</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
