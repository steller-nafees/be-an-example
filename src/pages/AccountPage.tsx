import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, Settings as SettingsIcon, LogOut, Loader2, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type Order = {
  id: string;
  status: string;
  total: number;
  created_at: string;
};

type Profile = {
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
};

const statusColor: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AccountPage() {
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState<"orders" | "settings">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile>({ full_name: "", email: "", avatar_url: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: o }, { data: p }] = await Promise.all([
        supabase.from("orders").select("id,status,total,created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("profiles").select("full_name,email,avatar_url").eq("id", user.id).maybeSingle(),
      ]);
      setOrders((o as Order[]) || []);
      setProfile(p || { full_name: user.user_metadata?.full_name ?? "", email: user.email ?? "", avatar_url: "" });
      setLoading(false);
    })();

    // Realtime: keep order list in sync when admin updates status
    const channel = supabase
      .channel(`orders_user_${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `user_id=eq.${user.id}` },
        (payload: any) => {
          setOrders((prev) => {
            if (payload.eventType === "INSERT") return [payload.new, ...prev];
            if (payload.eventType === "UPDATE") return prev.map((o) => (o.id === payload.new.id ? { ...o, ...payload.new } : o));
            if (payload.eventType === "DELETE") return prev.filter((o) => o.id !== payload.old.id);
            return prev;
          });
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ full_name: profile.full_name }).eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 pt-28 pb-16">
        <div className="mb-10">
          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2">My Account</p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
            Welcome{profile.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
          </h1>
        </div>

        <div className="grid md:grid-cols-[220px_1fr] gap-8">
          <aside className="space-y-1">
            <button onClick={() => setTab("orders")} className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-md transition ${tab === "orders" ? "bg-foreground/[0.06] text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}>
              <Package size={16} /> Orders
            </button>
            <button onClick={() => setTab("settings")} className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-md transition ${tab === "settings" ? "bg-foreground/[0.06] text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}>
              <SettingsIcon size={16} /> Profile settings
            </button>
            <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-md text-muted-foreground hover:text-foreground transition">
              <LogOut size={16} /> Sign out
            </button>
          </aside>

          <section>
            {loading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
            ) : tab === "orders" ? (
              orders.length === 0 ? (
                <div className="border border-border rounded-lg p-12 text-center">
                  <p className="text-muted-foreground mb-4">No orders yet.</p>
                  <Link to="/shop" className="inline-block px-6 py-2 bg-foreground text-background rounded-md text-sm">Start shopping</Link>
                </div>
              ) : (
                <ul className="divide-y divide-border border border-border rounded-lg overflow-hidden">
                  {orders.map((o) => (
                    <li key={o.id}>
                      <Link to={`/orders/${o.id}`} className="flex items-center justify-between p-5 hover:bg-muted/40 transition">
                        <div>
                          <p className="font-mono text-xs text-muted-foreground mb-1">#{o.id.slice(0, 8).toUpperCase()}</p>
                          <p className="text-sm text-foreground">{new Date(o.created_at).toLocaleDateString()} · ${Number(o.total).toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[11px] uppercase tracking-wide px-2 py-0.5 rounded-full ${statusColor[o.status] || "bg-muted text-muted-foreground"}`}>{o.status}</span>
                          <ChevronRight size={16} className="text-muted-foreground" />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )
            ) : (
              <div className="max-w-md space-y-5">
                <div>
                  <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">Full name</label>
                  <input value={profile.full_name ?? ""} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} className="w-full h-11 px-3 border border-border bg-background text-sm" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">Email</label>
                  <input value={profile.email ?? ""} disabled className="w-full h-11 px-3 border border-border bg-muted/40 text-sm text-muted-foreground" />
                </div>
                <div className="flex flex-col gap-3">
                  <button onClick={saveProfile} disabled={saving} className="h-11 px-6 bg-foreground text-background text-sm font-semibold uppercase tracking-widest flex items-center gap-2 disabled:opacity-60">
                    {saving && <Loader2 size={14} className="animate-spin" />} Save changes
                  </button>
                  <Link to="/reset-password" className="inline-flex items-center justify-center h-11 px-6 border border-border rounded-md text-sm font-medium text-foreground hover:bg-muted/60 transition">
                    Reset password
                  </Link>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
