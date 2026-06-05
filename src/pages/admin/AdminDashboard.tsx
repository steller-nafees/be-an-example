import { motion } from "framer-motion";
import { DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import MetricCard from "@/components/admin/MetricCard";
import StatusBadge from "@/components/admin/StatusBadge";
import { useProducts } from "@/hooks/use-products";
import { useAdminOrders, computeMetrics, revenueByDay } from "@/hooks/use-admin-data";
import { Link } from "react-router-dom";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-background border border-border rounded-md px-3 py-2 shadow-lg">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">${Number(payload[0].value).toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const { data: products = [] } = useProducts();
  const { data: orders = [] } = useAdminOrders();
  const metrics = computeMetrics(orders);
  const revenueData = revenueByDay(orders, 14);
  const recentOrders = orders.slice(0, 5);
  const topProducts = products.slice(0, 4);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Live overview of your store.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Revenue" value={Math.round(metrics.totalRevenue)} prefix="$" growth={metrics.revenueGrowth} icon={DollarSign} index={0} />
        <MetricCard label="Orders" value={metrics.totalOrders} growth={metrics.orderGrowth} icon={ShoppingCart} index={1} />
        <MetricCard label="Customers" value={metrics.totalCustomers} growth={0} icon={Users} index={2} />
        <MetricCard label="Products" value={products.length} growth={0} icon={TrendingUp} index={3} />
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-3 bg-background border border-border rounded-lg p-5">
          <h2 className="text-sm font-semibold text-foreground/70 mb-4">Revenue (last 14 days)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(0,0%,0%)" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="hsl(0,0%,0%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "hsl(0,0%,45%)", fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(0,0%,45%)", fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(0,0%,0%)" strokeWidth={1.5} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2 bg-background border border-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground/70">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs text-muted-foreground hover:text-foreground">View all →</Link>
          </div>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-xs text-muted-foreground">No orders yet.</p>
            ) : recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground/80 truncate">
                    {[order.first_name, order.last_name].filter(Boolean).join(" ") || order.email}
                  </p>
                  <p className="text-xs text-muted-foreground">ORD-{order.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <StatusBadge status={order.status} />
                  <span className="text-sm font-medium text-foreground/60">${Number(order.total).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-background border border-border rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground/70">Top Products</h2>
          <Link to="/admin/products" className="text-xs text-muted-foreground hover:text-foreground">View all →</Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {topProducts.map((product) => (
            <div key={product.id} className="flex items-center gap-3 p-3 rounded-md bg-muted/50 border border-border">
              <img src={product.image} alt={product.name} className="w-10 h-10 rounded object-cover" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground/80 truncate">{product.name}</p>
                <p className="text-xs text-muted-foreground">${product.price} · {product.stock} in stock</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
