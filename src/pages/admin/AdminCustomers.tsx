import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ShoppingBag } from "lucide-react";
import { mockCustomers, Customer, mockOrders } from "@/lib/admin-data";

export default function AdminCustomers() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Customer | null>(null);

  const filtered = mockCustomers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const customerOrders = selected
    ? mockOrders.filter((o) => o.email === selected.email)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white/90">Customers</h1>
        <p className="text-sm text-white/40 mt-0.5">{mockCustomers.length} customers</p>
      </div>

      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          placeholder="Search customers…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-9 bg-white/[0.04] border border-white/[0.08] rounded-md pl-8 pr-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors"
        />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/[0.03] border border-white/[0.06] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left text-[11px] font-medium text-white/30 uppercase tracking-wider px-4 py-3">Customer</th>
                <th className="text-left text-[11px] font-medium text-white/30 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Joined</th>
                <th className="text-left text-[11px] font-medium text-white/30 uppercase tracking-wider px-4 py-3">Orders</th>
                <th className="text-right text-[11px] font-medium text-white/30 uppercase tracking-wider px-4 py-3">Total Spend</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer, i) => (
                <motion.tr
                  key={customer.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setSelected(customer)}
                  className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-xs font-bold text-white/40">
                        {customer.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white/80">{customer.name}</p>
                        <p className="text-xs text-white/30">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-white/40 hidden sm:table-cell">{customer.joinedDate}</td>
                  <td className="px-4 py-3 text-sm text-white/60">{customer.totalOrders}</td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-white/70">${customer.totalSpend}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Customer Detail Drawer */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)} className="fixed inset-0 bg-black/60 z-50" />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[hsl(0,0%,6%)] border-l border-white/[0.06] z-50 overflow-y-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
                <h2 className="text-base font-bold text-white/90">{selected.name}</h2>
                <button onClick={() => setSelected(null)} className="p-1.5 text-white/30 hover:text-white/70 transition-colors">
                  <X size={16} />
                </button>
              </div>
              <div className="p-5 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-white/[0.06] flex items-center justify-center text-lg font-bold text-white/40">
                    {selected.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-white/80 font-medium">{selected.name}</p>
                    <p className="text-sm text-white/40">{selected.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Orders", value: selected.totalOrders },
                    { label: "Spent", value: `$${selected.totalSpend}` },
                    { label: "Since", value: selected.joinedDate.slice(0, 7) },
                  ].map((stat) => (
                    <div key={stat.label} className="p-3 bg-white/[0.03] border border-white/[0.04] rounded-md text-center">
                      <p className="text-lg font-bold text-white/80">{stat.value}</p>
                      <p className="text-[10px] text-white/30 uppercase tracking-wider">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="text-xs font-medium text-white/30 uppercase tracking-wider mb-3">Order History</h3>
                  {customerOrders.length > 0 ? (
                    <div className="space-y-2">
                      {customerOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-md border border-white/[0.04]">
                          <div>
                            <p className="text-sm text-white/70 font-medium">{order.id}</p>
                            <p className="text-xs text-white/30">{order.date}</p>
                          </div>
                          <span className="text-sm font-medium text-white/60">${order.total}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingBag size={24} className="mx-auto text-white/10 mb-2" />
                      <p className="text-sm text-white/30">No orders found</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
