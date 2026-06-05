import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ShoppingBag } from "lucide-react";
import ModalPortal from "@/components/ModalPortal";
import { useAdminOrders, useAdminProfiles } from "@/hooks/use-admin-data";

interface CustomerAgg {
  id: string;
  name: string;
  email: string;
  totalOrders: number;
  totalSpend: number;
  joinedDate: string;
}

export default function AdminCustomers() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CustomerAgg | null>(null);
  const { data: profiles = [] } = useAdminProfiles();
  const { data: orders = [] } = useAdminOrders();

  const customers: CustomerAgg[] = useMemo(() => {
    const map = new Map<string, CustomerAgg>();
    profiles.forEach((p) => {
      const email = p.email || "(no email)";
      map.set(email, {
        id: p.id,
        name: p.full_name || email.split("@")[0],
        email,
        totalOrders: 0,
        totalSpend: 0,
        joinedDate: p.created_at.slice(0, 10),
      });
    });
    orders.forEach((o) => {
      const key = o.email;
      const existing = map.get(key) ?? {
        id: o.user_id ?? key,
        name: [o.first_name, o.last_name].filter(Boolean).join(" ") || key.split("@")[0],
        email: key,
        totalOrders: 0,
        totalSpend: 0,
        joinedDate: o.created_at.slice(0, 10),
      };
      existing.totalOrders += 1;
      existing.totalSpend += Number(o.total);
      map.set(key, existing);
    });
    return Array.from(map.values()).sort((a, b) => b.totalSpend - a.totalSpend);
  }, [profiles, orders]);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()),
  );

  const customerOrders = selected ? orders.filter((o) => o.email === selected.email) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Customers</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{customers.length} customers</p>
      </div>

      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search customers…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-9 bg-background border border-border rounded-md pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30"
        />
      </div>

      <div className="bg-background border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Customer</th>
                <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Joined</th>
                <th className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Orders</th>
                <th className="text-right text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Total Spend</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer) => (
                <tr
                  key={customer.email}
                  onClick={() => setSelected(customer)}
                  className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                        {customer.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">{customer.joinedDate}</td>
                  <td className="px-4 py-3 text-sm text-foreground/70">{customer.totalOrders}</td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-foreground/80">${customer.totalSpend.toFixed(2)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-sm text-muted-foreground">No customers yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ModalPortal><AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)} className="fixed inset-0 bg-foreground/20 z-50" />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background border-l border-border z-50 overflow-y-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h2 className="text-base font-bold text-foreground">{selected.name}</h2>
                <button onClick={() => setSelected(null)} className="p-1.5 text-muted-foreground hover:text-foreground">
                  <X size={16} />
                </button>
              </div>
              <div className="p-5 space-y-6">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-muted/50 border border-border rounded-md text-center">
                    <p className="text-lg font-bold text-foreground">{selected.totalOrders}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Orders</p>
                  </div>
                  <div className="p-3 bg-muted/50 border border-border rounded-md text-center">
                    <p className="text-lg font-bold text-foreground">${selected.totalSpend.toFixed(0)}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Spent</p>
                  </div>
                  <div className="p-3 bg-muted/50 border border-border rounded-md text-center">
                    <p className="text-lg font-bold text-foreground">{selected.joinedDate.slice(0, 7)}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Since</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Order History</h3>
                  {customerOrders.length > 0 ? (
                    <div className="space-y-2">
                      {customerOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-md border border-border">
                          <div>
                            <p className="text-sm text-foreground font-medium">ORD-{order.id.slice(0, 8).toUpperCase()}</p>
                            <p className="text-xs text-muted-foreground">{order.created_at.slice(0, 10)}</p>
                          </div>
                          <span className="text-sm font-medium text-foreground/70">${Number(order.total).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingBag size={24} className="mx-auto text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground">No orders found</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence></ModalPortal>
    </div>
  );
}
