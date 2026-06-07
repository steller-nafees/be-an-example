import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Package, Gift, Tag, Check, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import PageHeader from "./_PageHeader";

type Notif = { id: string; type: "order" | "reward" | "promo"; title: string; body: string; at: string; read: boolean };

const ICONS = { order: Package, reward: Gift, promo: Tag };

export default function DashboardNotifications() {
  const { user } = useAuth();
  const key = `bae-notifs-${user?.id ?? "guest"}`;
  const [list, setList] = useState<Notif[]>([]);

  useEffect(() => {
    try { setList(JSON.parse(localStorage.getItem(key) || "[]")); } catch { setList([]); }

    // Seed promo if empty
    if (!localStorage.getItem(key)) {
      const seed: Notif[] = [
        { id: crypto.randomUUID(), type: "promo", title: "Drop 04 — Members only preview", body: "Get 24h early access. Live this Friday.", at: new Date().toISOString(), read: false },
      ];
      setList(seed);
      localStorage.setItem(key, JSON.stringify(seed));
    }

    if (!user) return;
    // Subscribe to order updates → push notifications
    const ch = supabase
      .channel(`notifs_orders_${user.id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `user_id=eq.${user.id}` }, (p: any) => {
        const n: Notif = {
          id: crypto.randomUUID(),
          type: "order",
          title: `Order #${String(p.new.id).slice(0, 8).toUpperCase()} is ${p.new.status}`,
          body: "Track the journey in your orders tab.",
          at: new Date().toISOString(),
          read: false,
        };
        setList((prev) => {
          const next = [n, ...prev].slice(0, 50);
          localStorage.setItem(key, JSON.stringify(next));
          return next;
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, key]);

  const persist = (next: Notif[]) => { setList(next); localStorage.setItem(key, JSON.stringify(next)); };
  const markRead = (id: string) => persist(list.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const markAll = () => persist(list.map((n) => ({ ...n, read: true })));
  const remove = (id: string) => persist(list.filter((n) => n.id !== id));

  const unread = useMemo(() => list.filter((n) => !n.read).length, [list]);

  return (
    <div className="px-6 md:px-12 py-10 md:py-14 max-w-3xl">
      <PageHeader
        eyebrow="Inbox"
        title="Notifications"
        subtitle={unread ? `${unread} new` : "All clear."}
        action={
          unread > 0 && (
            <button onClick={markAll} className="h-10 px-4 text-[11px] tracking-[0.25em] uppercase border border-border rounded-lg">
              Mark all read
            </button>
          )
        }
      />

      <div className="mt-10 space-y-2">
        {list.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-background">
            <Bell size={32} strokeWidth={1} className="mx-auto text-border mb-3" />
            <p className="text-muted-foreground">Nothing here yet.</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {list.map((n) => {
              const Icon = ICONS[n.type];
              return (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  className={`flex items-start gap-4 p-5 bg-background border rounded-xl transition-colors ${
                    n.read ? "border-border/60" : "border-foreground/30"
                  }`}
                >
                  <div className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center ${n.read ? "bg-muted text-muted-foreground" : "bg-foreground text-background"}`}>
                    <Icon size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-sm font-semibold">{n.title}</p>
                      <span className="text-[10px] text-muted-foreground shrink-0">{new Date(n.at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {!n.read && (
                      <button onClick={() => markRead(n.id)} className="p-2 hover:bg-foreground/[0.05] rounded" aria-label="Mark read">
                        <Check size={14} />
                      </button>
                    )}
                    <button onClick={() => remove(n.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded" aria-label="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
