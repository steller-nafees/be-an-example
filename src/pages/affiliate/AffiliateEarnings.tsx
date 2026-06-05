import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";
import { useMyAffiliate, useMyCommissions, computeEarnings } from "@/hooks/use-affiliate";

export default function AffiliateEarnings() {
  const { data: affiliate, isLoading } = useMyAffiliate();
  const { data: commissions = [] } = useMyCommissions(affiliate?.id);
  const earnings = computeEarnings(commissions);

  if (isLoading) return <div className="py-16 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  if (!affiliate) return <p className="text-sm text-muted-foreground">No affiliate profile.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Earnings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Commission breakdown and transaction history.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending", value: earnings.pending, color: "text-yellow-600" },
          { label: "Approved", value: earnings.approved, color: "text-foreground" },
          { label: "Paid", value: earnings.paid, color: "text-green-600" },
        ].map((item) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-background border border-border rounded-lg p-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{item.label}</p>
            <p className={`text-2xl font-bold mt-1 ${item.color}`}>${item.value.toFixed(2)}</p>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-background border border-border rounded-lg">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground/70">Transaction History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Order</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Customer</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Order Total</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Commission</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Date</th>
              </tr>
            </thead>
            <tbody>
              {commissions.length === 0 && (
                <tr><td colSpan={6} className="py-10 text-center text-sm text-muted-foreground">No commissions yet.</td></tr>
              )}
              {commissions.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="px-5 py-3 font-medium text-foreground/80">{c.order_id ? `ORD-${c.order_id.slice(0, 8).toUpperCase()}` : "—"}</td>
                  <td className="px-5 py-3 text-muted-foreground">{c.orders ? ([c.orders.first_name, c.orders.last_name].filter(Boolean).join(" ") || c.orders.email) : "—"}</td>
                  <td className="px-5 py-3 text-foreground/70">${c.orders ? Number(c.orders.total).toFixed(2) : "—"}</td>
                  <td className="px-5 py-3 font-medium text-foreground">${Number(c.amount).toFixed(2)}</td>
                  <td className="px-5 py-3"><StatusBadge status={c.status === "approved" ? "delivered" : c.status === "paid" ? "delivered" : "pending"} /></td>
                  <td className="px-5 py-3 text-muted-foreground">{c.created_at.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
