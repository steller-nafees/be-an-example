import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, Loader2, Check, Package, Truck, Home, Clock, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Order = {
  id: string;
  formatted_id?: string;
  status: string;
  total: number;
  created_at: string;
  updated_at?: string;
  affiliate_code?: string | null;
};

type Item = {
  id: string;
  name: string;
  image: string | null;
  size: string | null;
  color: string | null;
  price: number;
  quantity: number;
};

const STAGES = [
  { key: "pending",    label: "Order placed", icon: Clock },
  { key: "processing", label: "Processing",   icon: Package },
  { key: "shipped",    label: "Shipped",      icon: Truck },
  { key: "delivered",  label: "Delivered",    icon: Home },
];

export default function OrderTrackPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const load = async () => {
      const [{ data: o }, { data: it }] = await Promise.all([
        supabase.from("orders").select("*").eq("id", id).maybeSingle(),
        supabase.from("order_items").select("*").eq("order_id", id),
      ]);
      if (cancelled) return;
      if (!o) { setNotFound(true); setLoading(false); return; }
      setOrder(o as Order);
      setItems((it as Item[]) || []);
      setLoading(false);
    };
    load();

    // Realtime: live status updates from admin
    const channel = supabase
      .channel(`order_${id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${id}` },
        (payload: any) => setOrder((prev) => prev ? { ...prev, ...payload.new } : payload.new))
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center pt-40"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-6 pt-32 text-center">
          <h1 className="text-2xl font-black mb-3">Order not found</h1>
          <Link to="/account" className="text-sm underline">Back to my orders</Link>
        </div>
      </div>
    );
  }

  const cancelled = order.status === "cancelled";
  const currentIdx = STAGES.findIndex((s) => s.key === order.status);

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-3xl mx-auto px-6 pt-28 pb-16">
        <Link to="/account" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ChevronLeft size={14} /> My orders
        </Link>

        <div className="mb-2 flex items-baseline justify-between">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Order #{order.formatted_id ?? order.id.slice(0, 8).toUpperCase()}</h1>
          <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
        </div>
        <p className="text-sm text-muted-foreground mb-10">Updates live as your order moves.</p>

        {/* Tracker */}
        {cancelled ? (
          <div className="border border-red-200 bg-red-50 text-red-800 rounded-lg p-6 flex items-center gap-3 mb-10">
            <XCircle size={20} /> <span className="font-medium">This order was cancelled.</span>
          </div>
        ) : (
          <div className="border border-border rounded-lg p-6 md:p-8 mb-10">
            <div className="flex items-start justify-between gap-2 relative">
              <div className="absolute top-5 left-5 right-5 h-px bg-border" />
              <div
                className="absolute top-5 left-5 h-px bg-foreground transition-all duration-700"
                style={{ width: `calc(${Math.max(0, currentIdx) / (STAGES.length - 1) * 100}% - ${currentIdx === STAGES.length - 1 ? 0 : 0}px)` }}
              />
              {STAGES.map((s, i) => {
                const done = i <= currentIdx;
                const Icon = done ? Check : s.icon;
                return (
                  <div key={s.key} className="relative flex flex-col items-center gap-2 flex-1">
                    <div className={`w-10 h-10 rounded-full border flex items-center justify-center transition ${done ? "bg-foreground border-foreground text-background" : "bg-background border-border text-muted-foreground"}`}>
                      <Icon size={16} />
                    </div>
                    <span className={`text-[11px] uppercase tracking-wider text-center ${done ? "text-foreground font-medium" : "text-muted-foreground"}`}>{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Items */}
        <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Items</h2>
        <ul className="divide-y divide-border border border-border rounded-lg overflow-hidden mb-6">
          {items.map((it) => (
            <li key={it.id} className="flex gap-4 p-4">
              {it.image && <img src={it.image} alt={it.name} className="w-16 h-16 object-cover rounded" />}
              <div className="flex-1">
                <p className="text-sm font-medium">{it.name}</p>
                <p className="text-xs text-muted-foreground">
                  {[it.size, it.color].filter(Boolean).join(" · ")} {it.size || it.color ? "·" : ""} Qty {it.quantity}
                </p>
              </div>
              <p className="text-sm font-medium">${(Number(it.price) * it.quantity).toFixed(2)}</p>
            </li>
          ))}
        </ul>

        <div className="flex justify-between border-t border-border pt-4 text-sm">
          <span className="text-muted-foreground">Total</span>
          <span className="font-bold">${Number(order.total).toFixed(2)}</span>
        </div>
      </main>
    </div>
  );
}
