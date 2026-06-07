import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Check, Package, Truck, Home, Clock, RotateCcw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import PageHeader from "./_PageHeader";

type Order = {
  id: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  created_at: string;
  affiliate_code?: string | null;
};

type OrderItem = { id: string; name: string; price: number; quantity: number; size: string | null; image: string | null };

const STAGES: Order["status"][] = ["pending", "processing", "shipped", "delivered"];
const STAGE_LABEL: Record<string, string> = {
  pending: "Order placed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
};
const STAGE_ICON: Record<string, any> = { pending: Clock, processing: Package, shipped: Truck, delivered: Home };

const FILTERS = ["all", "pending", "processing", "shipped", "delivered", "cancelled"] as const;

export default function DashboardOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<Record<string, OrderItem[]>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("orders")
        .select("id,status,total,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setOrders((data as Order[]) || []);
      setLoading(false);
    })();

    const ch = supabase
      .channel(`dash_orders_${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `user_id=eq.${user.id}` }, (p: any) => {
        setOrders((prev) => {
          if (p.eventType === "INSERT") return [p.new, ...prev];
          if (p.eventType === "UPDATE") return prev.map((o) => (o.id === p.new.id ? { ...o, ...p.new } : o));
          if (p.eventType === "DELETE") return prev.filter((o) => o.id !== p.old.id);
          return prev;
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  const toggleExpand = async (id: string) => {
    const next = expanded === id ? null : id;
    setExpanded(next);
    if (next && !items[id]) {
      const { data } = await supabase.from("order_items").select("*").eq("order_id", id);
      setItems((m) => ({ ...m, [id]: (data as OrderItem[]) || [] }));
    }
  };

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (filter !== "all" && o.status !== filter) return false;
      if (q && !o.id.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [orders, q, filter]);

  return (
    <div className="px-6 md:px-12 py-10 md:py-14 max-w-6xl">
      <PageHeader eyebrow="Activity" title="Orders" subtitle="Track every order from placement to your door." />

      {/* Controls */}
      <div className="mt-8 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search order number"
            className="w-full h-11 pl-10 pr-3 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-foreground transition-colors"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto -mx-1 px-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 h-11 px-4 text-[11px] tracking-[0.2em] uppercase rounded-lg border transition-colors ${
                filter === f
                  ? "bg-foreground text-background border-foreground"
                  : "bg-background border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="mt-6 space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-background border border-border animate-pulse" />)
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-background">
            <p className="text-muted-foreground">No orders match.</p>
          </div>
        ) : (
          filtered.map((o, i) => {
            const stageIdx = STAGES.indexOf(o.status as any);
            const isCancelled = o.status === "cancelled";
            return (
              <motion.div
                key={o.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className="bg-background border border-border/70 rounded-xl overflow-hidden"
              >
                <button onClick={() => toggleExpand(o.id)} className="w-full grid grid-cols-[1fr_auto] md:grid-cols-[1.4fr_1fr_1fr_auto] items-center gap-4 p-5 text-left hover:bg-foreground/[0.02] transition-colors">
                  <div>
                    <p className="font-mono text-[11px] text-muted-foreground mb-0.5">#{o.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-sm font-semibold text-foreground">{new Date(o.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</p>
                  </div>
                  <p className="hidden md:block text-sm">${Number(o.total).toFixed(2)}</p>
                  <div className="hidden md:block">
                    <StatusPill status={o.status} />
                  </div>
                  <div className="md:hidden flex flex-col items-end gap-1.5">
                    <p className="text-sm font-semibold">${Number(o.total).toFixed(2)}</p>
                    <StatusPill status={o.status} />
                  </div>
                  <motion.span animate={{ rotate: expanded === o.id ? 180 : 0 }} className="hidden md:block text-muted-foreground text-xs">▾</motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {expanded === o.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden border-t border-border/70"
                    >
                      <div className="p-6 md:p-7">
                        {/* Timeline */}
                        {!isCancelled ? (
                          <div className="mb-7">
                            <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-5">Shipment</p>
                            <div className="relative">
                              <div className="absolute left-0 right-0 top-4 h-px bg-border" />
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(stageIdx / (STAGES.length - 1)) * 100}%` }}
                                transition={{ duration: 0.9, ease: "easeOut" }}
                                className="absolute left-0 top-4 h-px bg-foreground"
                              />
                              <div className="relative grid grid-cols-4">
                                {STAGES.map((s, idx) => {
                                  const done = idx <= stageIdx;
                                  const Icon = STAGE_ICON[s];
                                  return (
                                    <div key={s} className="flex flex-col items-center">
                                      <motion.div
                                        initial={{ scale: 0.6, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.15 + idx * 0.08 }}
                                        className={`w-9 h-9 rounded-full flex items-center justify-center border ${
                                          done ? "bg-foreground border-foreground text-background" : "bg-background border-border text-muted-foreground"
                                        }`}
                                      >
                                        {done && idx < stageIdx ? <Check size={14} /> : <Icon size={14} />}
                                      </motion.div>
                                      <p className={`mt-2 text-[10px] tracking-widest uppercase text-center ${done ? "text-foreground" : "text-muted-foreground"}`}>
                                        {STAGE_LABEL[s]}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-destructive mb-6">This order was cancelled.</p>
                        )}

                        {/* Items */}
                        <div className="space-y-3">
                          {(items[o.id] || []).map((it) => (
                            <div key={it.id} className="flex items-center gap-4">
                              <div className="w-14 h-14 bg-muted rounded-md overflow-hidden">
                                {it.image && <img src={it.image} alt={it.name} className="w-full h-full object-cover" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{it.name}</p>
                                <p className="text-xs text-muted-foreground">{it.size && `${it.size} · `}Qty {it.quantity}</p>
                              </div>
                              <p className="text-sm">${(it.price * it.quantity).toFixed(2)}</p>
                            </div>
                          ))}
                          {!items[o.id] && <div className="h-14 bg-muted/40 rounded-md animate-pulse" />}
                        </div>

                        <div className="mt-6 flex flex-wrap gap-2">
                          <button className="text-[11px] tracking-[0.2em] uppercase px-4 h-10 border border-border rounded-lg hover:bg-foreground hover:text-background transition-colors inline-flex items-center gap-2">
                            <RotateCcw size={13} /> Reorder
                          </button>
                          <button className="text-[11px] tracking-[0.2em] uppercase px-4 h-10 border border-border rounded-lg hover:bg-foreground hover:text-background transition-colors">
                            Download invoice
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-amber-50 text-amber-800 border-amber-200",
    processing: "bg-blue-50 text-blue-800 border-blue-200",
    shipped: "bg-violet-50 text-violet-800 border-violet-200",
    delivered: "bg-emerald-50 text-emerald-800 border-emerald-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-block text-[10px] tracking-[0.2em] uppercase px-2.5 py-1 rounded-full border ${map[status] || ""}`}>
      {status}
    </span>
  );
}
