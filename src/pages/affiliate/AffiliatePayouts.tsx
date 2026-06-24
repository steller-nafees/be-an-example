import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, X, Loader2 } from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";
import ModalPortal from "@/components/ModalPortal";
import { useMyAffiliate, useMyCommissions, useMyPayouts, computeEarnings } from "@/hooks/use-affiliate";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/currency";

export default function AffiliatePayouts() {
  const { data: affiliate, isLoading } = useMyAffiliate();
  const { data: commissions = [] } = useMyCommissions(affiliate?.id);
  const { data: payouts = [] } = useMyPayouts(affiliate?.id);
  const qc = useQueryClient();
  const [showRequest, setShowRequest] = useState(false);
  const [method, setMethod] = useState<"paypal" | "bank">("paypal");
  const [submitting, setSubmitting] = useState(false);

  const earnings = computeEarnings(commissions);
  const available = earnings.approved;

  if (isLoading) return <div className="py-16 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  if (!affiliate) return <p className="text-sm text-muted-foreground">No affiliate profile.</p>;

  const requestPayout = async () => {
    if (available < 50) return;
    setSubmitting(true);
    const { error } = await supabase.from("payouts").insert({
      affiliate_id: affiliate.id,
      amount: available,
      method,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Payout requested" });
      setShowRequest(false);
      qc.invalidateQueries({ queryKey: ["my-payouts"] });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Payouts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Request withdrawals and view payout history.</p>
        </div>
        <button
          onClick={() => setShowRequest(true)}
          disabled={available < 50}
          className="flex items-center gap-2 px-4 py-2 bg-foreground text-background text-sm font-medium rounded-md hover:bg-foreground/90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Wallet size={16} />
          Request Payout
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-background border border-border rounded-lg p-6">
        <div className="grid sm:grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Available</p>
            <p className="text-3xl font-bold text-foreground mt-1">{formatCurrency(available)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Paid</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{formatCurrency(earnings.paid)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Minimum Payout</p>
            <p className="text-3xl font-bold text-foreground/50 mt-1">{formatCurrency(50)}</p>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-background border border-border rounded-lg">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground/70">Payout History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">ID</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Amount</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Method</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Requested</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Processed</th>
              </tr>
            </thead>
            <tbody>
              {payouts.length === 0 && (
                <tr><td colSpan={6} className="py-10 text-center text-sm text-muted-foreground">No payouts.</td></tr>
              )}
              {payouts.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="px-5 py-3 font-medium text-foreground/80">{p.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-5 py-3 font-semibold text-foreground">{formatCurrency(Number(p.amount))}</td>
                  <td className="px-5 py-3 text-muted-foreground capitalize">{p.method === "bank" ? "Bank Transfer" : "PayPal"}</td>
                  <td className="px-5 py-3"><StatusBadge status={p.status === "processed" ? "delivered" : p.status === "rejected" ? "cancelled" : "pending"} /></td>
                  <td className="px-5 py-3 text-muted-foreground">{p.requested_at.slice(0, 10)}</td>
                  <td className="px-5 py-3 text-muted-foreground">{p.processed_at?.slice(0, 10) || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <ModalPortal><AnimatePresence>
        {showRequest && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowRequest(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-background border border-border rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-foreground">Request Payout</h2>
                <button onClick={() => setShowRequest(false)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
              </div>
              <div className="mb-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Amount</p>
                <p className="text-3xl font-bold text-foreground">{formatCurrency(available)}</p>
              </div>
              <div className="mb-6">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Payout Method</p>
                <div className="grid grid-cols-2 gap-3">
                  {(["paypal", "bank"] as const).map((m) => (
                    <button key={m} onClick={() => setMethod(m)}
                      className={`px-4 py-3 border rounded-md text-sm font-medium ${method === m ? "border-foreground bg-foreground/[0.04] text-foreground" : "border-border text-muted-foreground hover:border-foreground/30"}`}>
                      {m === "bank" ? "Bank Transfer" : "PayPal"}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={requestPayout} disabled={submitting} className="w-full py-3 bg-foreground text-background font-medium rounded-md disabled:opacity-50">
                {submitting ? "Submitting…" : "Confirm Payout Request"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence></ModalPortal>
    </div>
  );
}
