import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, X, Package, Truck, CheckCircle, Clock, XCircle } from "lucide-react";
import { mockOrders, Order } from "@/lib/admin-data";
import StatusBadge from "@/components/admin/StatusBadge";

const statusFilters = ["all", "pending", "processing", "shipped", "delivered", "cancelled"] as const;

const timelineIcons: Record<string, any> = {
  pending: Clock,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

export default function AdminOrders() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filtered = mockOrders.filter((o) => {
    const matchesSearch =
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white/90">Orders</h1>
        <p className="text-sm text-white/40 mt-0.5">{mockOrders.length} total orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search orders…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 bg-white/[0.04] border border-white/[0.08] rounded-md pl-8 pr-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium capitalize rounded-md transition-colors whitespace-nowrap ${
                statusFilter === s
                  ? "bg-white/10 text-white border border-white/[0.12]"
                  : "text-white/30 hover:text-white/60 border border-transparent"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white/[0.03] border border-white/[0.06] rounded-lg overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left text-[11px] font-medium text-white/30 uppercase tracking-wider px-4 py-3">Order</th>
                <th className="text-left text-[11px] font-medium text-white/30 uppercase tracking-wider px-4 py-3">Customer</th>
                <th className="text-left text-[11px] font-medium text-white/30 uppercase tracking-wider px-4 py-3">Date</th>
                <th className="text-left text-[11px] font-medium text-white/30 uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-right text-[11px] font-medium text-white/30 uppercase tracking-wider px-4 py-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order, i) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setSelectedOrder(order)}
                  className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 text-sm font-medium text-white/70">{order.id}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-white/80">{order.customer}</p>
                    <p className="text-xs text-white/30">{order.email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-white/40">{order.date}</td>
                  <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-white/70">${order.total}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Order Detail Drawer */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-black/60 z-50"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[hsl(0,0%,6%)] border-l border-white/[0.06] z-50 overflow-y-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
                <div>
                  <h2 className="text-base font-bold text-white/90">{selectedOrder.id}</h2>
                  <p className="text-xs text-white/40">{selectedOrder.date}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-1.5 text-white/30 hover:text-white/70 transition-colors">
                  <X size={16} />
                </button>
              </div>
              <div className="p-5 space-y-6">
                {/* Status */}
                <div>
                  <h3 className="text-xs font-medium text-white/30 uppercase tracking-wider mb-3">Status</h3>
                  <StatusBadge status={selectedOrder.status} />
                </div>

                {/* Timeline */}
                <div>
                  <h3 className="text-xs font-medium text-white/30 uppercase tracking-wider mb-3">Timeline</h3>
                  <div className="space-y-3">
                    {["pending", "processing", "shipped", "delivered"].map((step, idx) => {
                      const Icon = timelineIcons[step];
                      const statusOrder = ["pending", "processing", "shipped", "delivered"];
                      const currentIdx = statusOrder.indexOf(selectedOrder.status);
                      const isCompleted = idx <= currentIdx && selectedOrder.status !== "cancelled";
                      const isCurrent = idx === currentIdx;
                      return (
                        <div key={step} className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                            isCurrent ? "bg-white/15 text-white" : isCompleted ? "bg-white/8 text-white/50" : "bg-white/[0.03] text-white/15"
                          }`}>
                            <Icon size={13} />
                          </div>
                          <span className={`text-sm capitalize ${isCurrent ? "text-white font-medium" : isCompleted ? "text-white/50" : "text-white/20"}`}>
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Customer */}
                <div>
                  <h3 className="text-xs font-medium text-white/30 uppercase tracking-wider mb-3">Customer</h3>
                  <p className="text-sm text-white/80">{selectedOrder.customer}</p>
                  <p className="text-xs text-white/40">{selectedOrder.email}</p>
                </div>

                {/* Shipping */}
                <div>
                  <h3 className="text-xs font-medium text-white/30 uppercase tracking-wider mb-3">Shipping</h3>
                  <p className="text-sm text-white/60">{selectedOrder.shippingAddress}</p>
                </div>

                {/* Items */}
                <div>
                  <h3 className="text-xs font-medium text-white/30 uppercase tracking-wider mb-3">Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-md border border-white/[0.04]">
                        <img src={item.product.image} alt={item.product.name} className="w-10 h-10 rounded object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white/80 truncate">{item.product.name}</p>
                          <p className="text-xs text-white/30">Size {item.size} · Qty {item.quantity}</p>
                        </div>
                        <span className="text-sm font-medium text-white/60">${item.product.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                  <span className="text-sm font-medium text-white/50">Total</span>
                  <span className="text-lg font-bold text-white/90">${selectedOrder.total}</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
