import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Package, Truck, CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import StatusBadge from "@/components/admin/StatusBadge";
import ModalPortal from "@/components/ModalPortal";

const statusFilters = ["all", "pending", "processing", "shipped", "delivered", "cancelled"] as const;
const statusOptions = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;

const timelineIcons: Record<string, any> = {
  pending: Clock,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

interface OrderItemRow {
  id: string;
  product_id: string;
  name: string;
  image: string | null;
  size: string | null;
  color: string | null;
  price: number;
  quantity: number;
  printful_sync_variant_id: number | null;
}

interface OrderRow {
  id: string;
  user_id: string | null;
  email: string;
  first_name: string | null;
  last_name: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  total: number;
  status: string;
  printful_order_id: string | null;
  printful_status: string | null;
  printful_error: string | null;
  created_at: string;
  order_items: OrderItemRow[];
}

const short = (id: string) => `ORD-${id.slice(0, 8).toUpperCase()}`;
const fullName = (o: OrderRow) =>
  [o.first_name, o.last_name].filter(Boolean).join(" ") || o.email;
const shipAddr = (o: OrderRow) =>
  [o.address, o.city, o.state, o.zip].filter(Boolean).join(", ") || "—";

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Failed to load orders", description: error.message, variant: "destructive" });
    } else {
      setOrders((data as OrderRow[]) ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("admin-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    // optimistic
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    setUpdatingId(null);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      load();
    } else {
      toast({ title: "Status updated", description: `${short(id)} → ${status}` });
    }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm(`Delete ${short(id)}? This cannot be undone.`)) return;
    setUpdatingId(id);
    const { error } = await supabase.from("orders").delete().eq("id", id);
    setUpdatingId(null);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    setOrders((prev) => prev.filter((o) => o.id !== id));
    toast({ title: "Deleted", description: short(id) });
    // close detail drawer if open
    if (selectedId === id) setSelectedId(null);
  };

  const filtered = useMemo(
    () =>
      orders.filter((o) => {
        const q = search.toLowerCase();
        const matchesSearch =
          !q ||
          fullName(o).toLowerCase().includes(q) ||
          o.email.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q);
        const matchesStatus = statusFilter === "all" || o.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [orders, search, statusFilter],
  );

  const selected = orders.find((o) => o.id === selectedId) || null;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Orders</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading ? "Loading…" : `${orders.length} total orders · live`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search orders…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 bg-background border border-border rounded-md pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium capitalize rounded-md transition-colors whitespace-nowrap ${
                statusFilter === s
                  ? "bg-foreground text-background border border-foreground"
                  : "text-muted-foreground hover:text-foreground border border-transparent"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-background border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">No orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Order</th>
                  <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Customer</th>
                  <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Date</th>
                  <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Printful</th>
                  <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Update</th>
                  <th className="text-right text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, i) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.02, 0.2) }}
                    className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-foreground/80 cursor-pointer" onClick={() => setSelectedId(order.id)}>
                      {short(order.id)}
                    </td>
                    <td className="px-4 py-3 cursor-pointer" onClick={() => setSelectedId(order.id)}>
                      <p className="text-sm text-foreground">{fullName(order)}</p>
                      <p className="text-xs text-muted-foreground">{order.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground cursor-pointer" onClick={() => setSelectedId(order.id)}>
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 cursor-pointer" onClick={() => setSelectedId(order.id)}>
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 cursor-pointer" onClick={() => setSelectedId(order.id)}>
                      <StatusBadge status={order.printful_status || "not_submitted"} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <select
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          className="h-8 bg-background border border-border rounded-md px-2 text-xs text-foreground focus:outline-none focus:border-foreground/30"
                        >
                          {statusOptions.map((s) => (
                            <option key={s} value={s} className="capitalize">{s}</option>
                          ))}
                        </select>
                        {updatingId === order.id && <Loader2 size={12} className="animate-spin text-muted-foreground" />}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-foreground/80">
                      ${Number(order.total).toFixed(2)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Order Detail Drawer */}
      <ModalPortal><AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedId(null)} className="fixed inset-0 bg-foreground/20 z-50" />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background border-l border-border z-50 overflow-y-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-border">
                <div>
                  <h2 className="text-base font-bold text-foreground">{short(selected.id)}</h2>
                  <p className="text-xs text-muted-foreground">{new Date(selected.created_at).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => deleteOrder(selected.id)}
                    disabled={updatingId === selected.id}
                    className="p-1.5 text-destructive hover:bg-destructive/10 rounded transition-colors"
                    title="Delete order"
                  >
                    <XCircle size={16} />
                  </button>
                  <button onClick={() => setSelectedId(null)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
                    <X size={16} />
                  </button>
                </div>
              </div>
              <div className="p-5 space-y-6">
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Status</h3>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={selected.status} />
                    <select
                      value={selected.status}
                      disabled={updatingId === selected.id}
                      onChange={(e) => updateStatus(selected.id, e.target.value)}
                      className="h-8 bg-background border border-border rounded-md px-2 text-xs text-foreground focus:outline-none focus:border-foreground/30"
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s} className="capitalize">{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Printful</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={selected.printful_status || "not_submitted"} />
                      {selected.printful_order_id && (
                        <span className="text-xs text-muted-foreground">
                          #{selected.printful_order_id}
                        </span>
                      )}
                    </div>
                    {selected.printful_error && (
                      <p className="text-xs text-destructive leading-relaxed">{selected.printful_error}</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Timeline</h3>
                  <div className="space-y-3">
                    {["pending", "processing", "shipped", "delivered"].map((step, idx) => {
                      const Icon = timelineIcons[step];
                      const statusOrder = ["pending", "processing", "shipped", "delivered"];
                      const currentIdx = statusOrder.indexOf(selected.status);
                      const isCompleted = idx <= currentIdx && selected.status !== "cancelled";
                      const isCurrent = idx === currentIdx;
                      return (
                        <div key={step} className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                            isCurrent ? "bg-foreground text-background" : isCompleted ? "bg-foreground/10 text-foreground/60" : "bg-muted text-muted-foreground/40"
                          }`}>
                            <Icon size={13} />
                          </div>
                          <span className={`text-sm capitalize ${isCurrent ? "text-foreground font-medium" : isCompleted ? "text-foreground/60" : "text-muted-foreground/40"}`}>
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Customer</h3>
                  <p className="text-sm text-foreground">{fullName(selected)}</p>
                  <p className="text-xs text-muted-foreground">{selected.email}</p>
                </div>

                <div>
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Shipping</h3>
                  <p className="text-sm text-foreground/70">{shipAddr(selected)}</p>
                </div>

                <div>
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    Items ({selected.order_items?.length ?? 0})
                  </h3>
                  <div className="space-y-3">
                    {(selected.order_items ?? []).map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-md border border-border">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-10 h-10 rounded object-cover" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.size ? `Size ${item.size} · ` : ""}Qty {item.quantity}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            Printful sync ID: {item.printful_sync_variant_id ?? "Not mapped"}
                          </p>
                        </div>
                        <span className="text-sm font-medium text-foreground/70">
                          ${(Number(item.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="text-sm font-medium text-muted-foreground">Total</span>
                  <span className="text-lg font-bold text-foreground">${Number(selected.total).toFixed(2)}</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence></ModalPortal>
    </div>
  );
}
