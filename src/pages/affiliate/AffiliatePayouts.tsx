import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, X } from "lucide-react";
import { mockPayouts, mockAffiliates } from "@/lib/affiliate-data";
import StatusBadge from "@/components/admin/StatusBadge";
import ModalPortal from "@/components/ModalPortal";

const affiliate = mockAffiliates[0];

export default function AffiliatePayouts() {
  const [showRequest, setShowRequest] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState<"bank" | "paypal">("paypal");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Payouts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Request withdrawals and view payout history.</p>
        </div>
        <button
          onClick={() => setShowRequest(true)}
          disabled={affiliate.pendingEarnings < 50}
          className="flex items-center gap-2 px-4 py-2 bg-foreground text-background text-sm font-medium rounded-md hover:bg-foreground/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Wallet size={16} />
          Request Payout
        </button>
      </div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background border border-border rounded-lg p-6"
      >
        <div className="grid sm:grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Available Balance</p>
            <p className="text-3xl font-bold text-foreground mt-1">${affiliate.pendingEarnings}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Paid</p>
            <p className="text-3xl font-bold text-green-600 mt-1">${affiliate.paidEarnings.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Minimum Payout</p>
            <p className="text-3xl font-bold text-foreground/50 mt-1">$50</p>
          </div>
        </div>
      </motion.div>

      {/* Payout History */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-background border border-border rounded-lg"
      >
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground/70">Payout History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">ID</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Method</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Requested</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Processed</th>
              </tr>
            </thead>
            <tbody>
              {mockPayouts.map((p, i) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 + i * 0.03 }}
                  className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                >
                  <td className="px-5 py-3 font-medium text-foreground/80">{p.id}</td>
                  <td className="px-5 py-3 font-semibold text-foreground">${p.amount}</td>
                  <td className="px-5 py-3 text-muted-foreground capitalize">{p.method === "bank" ? "Bank Transfer" : "PayPal"}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={p.status === "processed" ? "delivered" : "pending"} />
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{p.requestedDate}</td>
                  <td className="px-5 py-3 text-muted-foreground">{p.processedDate || "—"}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Payout Request Modal */}
      <ModalPortal><AnimatePresence>
        {showRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowRequest(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-background border border-border rounded-lg p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-foreground">Request Payout</h2>
                <button onClick={() => setShowRequest(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={18} />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Amount</p>
                <p className="text-3xl font-bold text-foreground">${affiliate.pendingEarnings}</p>
              </div>

              <div className="mb-6">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Payout Method</p>
                <div className="grid grid-cols-2 gap-3">
                  {(["paypal", "bank"] as const).map((method) => (
                    <button
                      key={method}
                      onClick={() => setPayoutMethod(method)}
                      className={`px-4 py-3 border rounded-md text-sm font-medium transition-all ${
                        payoutMethod === method
                          ? "border-foreground bg-foreground/[0.04] text-foreground"
                          : "border-border text-muted-foreground hover:border-foreground/30"
                      }`}
                    >
                      {method === "bank" ? "Bank Transfer" : "PayPal"}
                    </button>
                  ))}
                </div>
              </div>

              <button className="w-full py-3 bg-foreground text-background font-medium rounded-md hover:bg-foreground/90 transition-colors active:scale-[0.98]">
                Confirm Payout Request
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence></ModalPortal>
    </div>
  );
}
