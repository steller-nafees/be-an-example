import { motion } from "framer-motion";
import { mockReferrals, mockAffiliates } from "@/lib/affiliate-data";
import StatusBadge from "@/components/admin/StatusBadge";

const affiliate = mockAffiliates[0];

export default function AffiliateEarnings() {
  const pending = mockReferrals.filter((r) => r.status === "pending");
  const approved = mockReferrals.filter((r) => r.status === "approved");
  const paid = mockReferrals.filter((r) => r.status === "paid");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Earnings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Commission breakdown and transaction history.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending", value: affiliate.pendingEarnings, color: "text-yellow-600" },
          { label: "Approved", value: affiliate.totalEarnings - affiliate.pendingEarnings - affiliate.paidEarnings, color: "text-foreground" },
          { label: "Paid", value: affiliate.paidEarnings, color: "text-green-600" },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-background border border-border rounded-lg p-4 text-center"
          >
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{item.label}</p>
            <p className={`text-2xl font-bold mt-1 ${item.color}`}>${item.value.toLocaleString()}</p>
          </motion.div>
        ))}
      </div>

      {/* Transaction History */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-background border border-border rounded-lg"
      >
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground/70">Transaction History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Order</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Product</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Order Total</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Commission</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody>
              {mockReferrals.map((ref, i) => (
                <motion.tr
                  key={ref.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.03 }}
                  className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                >
                  <td className="px-5 py-3 font-medium text-foreground/80">{ref.orderId}</td>
                  <td className="px-5 py-3 text-muted-foreground">{ref.customer}</td>
                  <td className="px-5 py-3 text-muted-foreground">{ref.product}</td>
                  <td className="px-5 py-3 text-foreground/70">${ref.orderTotal}</td>
                  <td className="px-5 py-3 font-medium text-foreground">${ref.commission.toFixed(2)}</td>
                  <td className="px-5 py-3"><StatusBadge status={ref.status as any} /></td>
                  <td className="px-5 py-3 text-muted-foreground">{ref.date}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
